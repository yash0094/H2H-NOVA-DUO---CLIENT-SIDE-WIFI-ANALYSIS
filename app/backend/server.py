"from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import asyncio
import math
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI(title=\"WiFi Analysis API\")
api_router = APIRouter(prefix=\"/api\")

# --------------------------
# Simulated WiFi engine
# --------------------------

SSID = \"MyHomeWiFi\"
ROUTER_MODEL = \"ASUS RT-AX88U\"
CHANNELS_24 = [1, 6, 11]
CHANNELS_5 = [36, 40, 44, 48, 149, 153, 157, 161]

# Session state persists across calls to create believable variation
_state: Dict[str, Any] = {
    \"base_latency\": 38.0,
    \"base_signal\": -62.0,
    \"base_download\": 145.0,
    \"base_upload\": 42.0,
    \"band\": \"2.4GHz\",
    \"channel\": 6,
    \"devices_count\": 7,
    \"last_update\": datetime.now(timezone.utc),
}


def _jitter(base: float, pct: float = 0.15) -> float:
    return base * (1 + random.uniform(-pct, pct))


def _current_metrics() -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    # Time-based congestion: more load during peak hours 18-22
    hour = now.hour
    peak_factor = 1.4 if 18 <= hour <= 22 else (1.15 if 12 <= hour <= 14 else 1.0)

    latency = max(5.0, _jitter(_state[\"base_latency\"]) * peak_factor)
    signal = _jitter(_state[\"base_signal\"], 0.05)  # dBm varies little
    download = max(1.0, _jitter(_state[\"base_download\"]) / peak_factor)
    upload = max(0.5, _jitter(_state[\"base_upload\"]) / peak_factor)
    devices = _state[\"devices_count\"] + random.randint(-1, 1)
    devices = max(3, min(15, devices))
    congestion = min(100, int(45 + (devices - 5) * 7 + (peak_factor - 1) * 80))

    return {
        \"ssid\": SSID,
        \"router_model\": ROUTER_MODEL,
        \"band\": _state[\"band\"],
        \"channel\": _state[\"channel\"],
        \"download_mbps\": round(download, 1),
        \"upload_mbps\": round(upload, 1),
        \"latency_ms\": round(latency, 0),
        \"signal_dbm\": round(signal, 0),
        \"devices_count\": devices,
        \"congestion_pct\": congestion,
        \"timestamp\": now.isoformat(),
    }


def _health_score(m: Dict[str, Any]) -> int:
    # Weight: signal 35, latency 25, congestion 20, speed 20
    sig = m[\"signal_dbm\"]
    sig_score = max(0, min(100, (sig + 90) * (100 / 40)))  # -90..-50 -> 0..100
    lat = m[\"latency_ms\"]
    lat_score = max(0, min(100, 100 - (lat - 20) * 1.5))
    cong_score = max(0, 100 - m[\"congestion_pct\"])
    speed_score = max(0, min(100, (m[\"download_mbps\"] / 200) * 100))

    score = (sig_score * 0.35 + lat_score * 0.25 + cong_score * 0.20 + speed_score * 0.20)
    return int(round(score))


def _detect_issues(m: Dict[str, Any]) -> List[Dict[str, str]]:
    issues = []
    if m[\"signal_dbm\"] < -75:
        issues.append({
            \"code\": \"WEAK_SIGNAL\",
            \"severity\": \"critical\",
            \"title\": \"Weak Signal Detected\",
            \"detail\": f\"Signal strength is {m['signal_dbm']} dBm. Move closer to the router or add a mesh node.\",
        })
    if m[\"latency_ms\"] > 90:
        issues.append({
            \"code\": \"HIGH_LATENCY\",
            \"severity\": \"critical\",
            \"title\": \"High Latency\",
            \"detail\": f\"Ping is {m['latency_ms']}ms. Affects video calls and gaming.\",
        })
    if m[\"devices_count\"] >= 7:
        issues.append({
            \"code\": \"TOO_MANY_DEVICES\",
            \"severity\": \"warning\",
            \"title\": \"Network Overloaded\",
            \"detail\": f\"{m['devices_count']} devices are connected. Consider splitting load or upgrading bandwidth.\",
        })
    if m[\"congestion_pct\"] > 70:
        issues.append({
            \"code\": \"CHANNEL_CONGESTION\",
            \"severity\": \"warning\",
            \"title\": \"Channel Congestion\",
            \"detail\": f\"Channel {m['channel']} is {m['congestion_pct']}% congested. Switch to a cleaner channel.\",
        })
    if m[\"band\"] == \"2.4GHz\" and m[\"download_mbps\"] < 100:
        issues.append({
            \"code\": \"SUGGEST_5GHZ\",
            \"severity\": \"info\",
            \"title\": \"Switch to 5 GHz\",
            \"detail\": \"Switching to the 5 GHz band previously improved your speed by ~30%.\",
        })
    if not issues:
        issues.append({
            \"code\": \"HEALTHY\",
            \"severity\": \"success\",
            \"title\": \"Network Healthy\",
            \"detail\": \"No issues detected on your network.\",
        })
    return issues


# --------------------------
# Models
# --------------------------

class NetworkStatus(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    ssid: str
    router_model: str
    band: str
    channel: int
    download_mbps: float
    upload_mbps: float
    latency_ms: float
    signal_dbm: float
    devices_count: int
    congestion_pct: int
    health_score: int
    health_label: str
    timestamp: str


class Issue(BaseModel):
    code: str
    severity: str
    title: str
    detail: str


class IssuesResponse(BaseModel):
    issues: List[Issue]
    count: int


class Device(BaseModel):
    id: str
    name: str
    type: str
    ip: str
    mac: str
    signal_dbm: int
    bandwidth_mbps: float
    is_hog: bool


class DevicesResponse(BaseModel):
    devices: List[Device]
    count: int


class DiagnoseStep(BaseModel):
    key: str
    label: str
    status: str  # pending | running | ok | fail
    detail: Optional[str] = None


class DiagnoseSession(BaseModel):
    session_id: str
    steps: List[DiagnoseStep]
    progress: int
    status: str  # running | done
    summary: Optional[str] = None


class TimelineEvent(BaseModel):
    id: str
    timestamp: str
    title: str
    detail: str
    severity: str
    resolved: bool


class HeatmapZone(BaseModel):
    id: str
    name: str
    x: int  # 0-100 grid coord
    y: int
    signal_dbm: int
    status: str  # good | moderate | weak


class Recommendation(BaseModel):
    id: str
    title: str
    detail: str
    impact: str
    action: str


class PredictionResponse(BaseModel):
    headline: str
    detail: str
    minutes_until: int
    confidence: int


class ToggleBandRequest(BaseModel):
    band: str  # \"2.4GHz\" | \"5GHz\"


# --------------------------
# Routes
# --------------------------

@api_router.get(\"/\")
async def root():
    return {\"message\": \"WiFi Analysis API\"}


@api_router.get(\"/network/status\", response_model=NetworkStatus)
async def get_status():
    m = _current_metrics()
    score = _health_score(m)
    if score >= 80:
        label = \"EXCELLENT\"
    elif score >= 60:
        label = \"MODERATE\"
    elif score >= 40:
        label = \"DEGRADED\"
    else:
        label = \"CRITICAL\"
    m[\"health_score\"] = score
    m[\"health_label\"] = label
    return NetworkStatus(**m)


@api_router.get(\"/network/issues\", response_model=IssuesResponse)
async def get_issues():
    m = _current_metrics()
    issues = _detect_issues(m)
    return IssuesResponse(issues=[Issue(**i) for i in issues], count=len(issues))


_DEVICE_POOL = [
    (\"iPhone 15 Pro\", \"phone\"),
    (\"MacBook Pro 16\", \"laptop\"),
    (\"PlayStation 5\", \"console\"),
    (\"Samsung Smart TV\", \"tv\"),
    (\"Nest Thermostat\", \"iot\"),
    (\"Ring Doorbell\", \"iot\"),
    (\"iPad Air\", \"tablet\"),
    (\"Dad's Laptop\", \"laptop\"),
    (\"Sonos Arc\", \"speaker\"),
    (\"Echo Dot\", \"iot\"),
    (\"Xbox Series X\", \"console\"),
    (\"Work Laptop\", \"laptop\"),
]


@api_router.get(\"/network/devices\", response_model=DevicesResponse)
async def get_devices():
    m = _current_metrics()
    n = m[\"devices_count\"]
    random.seed(42)  # stable device list per session-ish
    chosen = random.sample(_DEVICE_POOL, min(n, len(_DEVICE_POOL)))
    random.seed()
    devices = []
    for idx, (name, typ) in enumerate(chosen):
        signal = random.randint(-82, -48)
        bw = round(random.uniform(0.1, 45.0), 1)
        devices.append(Device(
            id=f\"dev-{idx}\",
            name=name,
            type=typ,
            ip=f\"192.168.1.{20 + idx}\",
            mac=\":\".join(f\"{random.randint(0, 255):02X}\" for _ in range(6)),
            signal_dbm=signal,
            bandwidth_mbps=bw,
            is_hog=bw > 25,
        ))
    return DevicesResponse(devices=devices, count=len(devices))


@api_router.get(\"/network/heatmap\")
async def get_heatmap():
    # Simulated home floorplan zones
    zones_raw = [
        (\"Living Room\", 25, 30, -52, \"good\"),
        (\"Kitchen\", 55, 25, -64, \"good\"),
        (\"Master Bedroom\", 75, 55, -74, \"moderate\"),
        (\"Kid's Room\", 82, 30, -81, \"weak\"),
        (\"Office\", 20, 60, -58, \"good\"),
        (\"Garage\", 10, 85, -86, \"weak\"),
        (\"Bathroom\", 60, 65, -70, \"moderate\"),
        (\"Hallway\", 45, 50, -60, \"good\"),
    ]
    zones = [
        HeatmapZone(id=f\"zone-{i}\", name=n, x=x, y=y, signal_dbm=s, status=st)
        for i, (n, x, y, s, st) in enumerate(zones_raw)
    ]
    router_pos = {\"x\": 40, \"y\": 40}
    return {\"zones\": [z.model_dump() for z in zones], \"router\": router_pos}


@api_router.get(\"/network/timeline\", response_model=List[TimelineEvent])
async def get_timeline():
    events = await db.timeline.find({}, {\"_id\": 0}).sort(\"timestamp\", -1).to_list(50)
    if not events:
        # Seed with sample events
        now = datetime.now(timezone.utc)
        sample = [
            (\"Router restarted\", \"Auto-healing reset restored connectivity.\", \"success\", True, 2),
            (\"High latency spike\", \"Latency hit 180ms for 4 minutes.\", \"warning\", True, 6),
            (\"Weak signal in Garage\", \"Signal dropped to -88 dBm.\", \"critical\", True, 14),
            (\"New device connected\", \"iPad Air joined MyHomeWiFi.\", \"info\", True, 26),
            (\"Channel switched 6 -> 11\", \"Reduced congestion by 35%.\", \"success\", True, 40),
            (\"Bandwidth hog detected\", \"PlayStation 5 used 42 Mbps for 2h.\", \"warning\", True, 70),
        ]
        to_insert = []
        for title, detail, sev, resolved, hours_ago in sample:
            ev = {
                \"id\": str(uuid.uuid4()),
                \"timestamp\": (now - timedelta(hours=hours_ago)).isoformat(),
                \"title\": title,
                \"detail\": detail,
                \"severity\": sev,
                \"resolved\": resolved,
            }
            to_insert.append(ev)
        await db.timeline.insert_many(to_insert)
        events = sorted(to_insert, key=lambda e: e[\"timestamp\"], reverse=True)
        # Strip Mongo _id if any got added
        for e in events:
            e.pop(\"_id\", None)
    return [TimelineEvent(**e) for e in events]


# --------------------------
# Diagnostic flow
# --------------------------

_DIAG_SESSIONS: Dict[str, Dict[str, Any]] = {}

DIAG_STEP_DEFS = [
    (\"ping_router\", \"Ping router gateway\"),
    (\"dns_check\", \"Resolve DNS (1.1.1.1)\"),
    (\"speed_test\", \"Run speed benchmark\"),
    (\"scan_channels\", \"Scan 2.4GHz / 5GHz channels\"),
    (\"scan_interference\", \"Detect neighboring networks\"),
    (\"audit_devices\", \"Audit connected devices\"),
    (\"signal_sweep\", \"Sweep signal strength across bands\"),
    (\"summarize\", \"Compile diagnostic report\"),
]


async def _run_diagnostic(session_id: str):
    sess = _DIAG_SESSIONS[session_id]
    total = len(sess[\"steps\"])
    for i, step in enumerate(sess[\"steps\"]):
        step[\"status\"] = \"running\"
        sess[\"progress\"] = int((i / total) * 100)
        await asyncio.sleep(random.uniform(0.6, 1.2))
        # ~90% success, 10% warnings on specific steps
        if step[\"key\"] in (\"scan_channels\", \"scan_interference\") and random.random() < 0.35:
            step[\"status\"] = \"ok\"
            step[\"detail\"] = \"Detected 3 overlapping SSIDs on channel 6.\"
        elif step[\"key\"] == \"speed_test\":
            m = _current_metrics()
            step[\"status\"] = \"ok\"
            step[\"detail\"] = f\"{m['download_mbps']} Mbps down / {m['upload_mbps']} Mbps up\"
        elif step[\"key\"] == \"ping_router\":
            m = _current_metrics()
            step[\"status\"] = \"ok\"
            step[\"detail\"] = f\"Latency {int(m['latency_ms'])}ms\"
        else:
            step[\"status\"] = \"ok\"
            step[\"detail\"] = \"Passed.\"
        sess[\"progress\"] = int(((i + 1) / total) * 100)

    sess[\"status\"] = \"done\"
    sess[\"summary\"] = \"Diagnostic complete. Review recommendations for targeted fixes.\"


@api_router.post(\"/network/diagnose\", response_model=DiagnoseSession)
async def start_diagnose():
    sid = str(uuid.uuid4())
    steps = [{\"key\": k, \"label\": l, \"status\": \"pending\", \"detail\": None} for k, l in DIAG_STEP_DEFS]
    _DIAG_SESSIONS[sid] = {
        \"session_id\": sid,
        \"steps\": steps,
        \"progress\": 0,
        \"status\": \"running\",
        \"summary\": None,
    }
    asyncio.create_task(_run_diagnostic(sid))
    return DiagnoseSession(**_DIAG_SESSIONS[sid])


@api_router.get(\"/network/diagnose/{session_id}\", response_model=DiagnoseSession)
async def get_diagnose(session_id: str):
    sess = _DIAG_SESSIONS.get(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail=\"Diagnostic session not found\")
    return DiagnoseSession(**sess)


# --------------------------
# Band toggle (simulate fix action)
# --------------------------

@api_router.post(\"/network/band\")
async def toggle_band(req: ToggleBandRequest):
    if req.band not in (\"2.4GHz\", \"5GHz\"):
        raise HTTPException(status_code=400, detail=\"Invalid band\")
    _state[\"band\"] = req.band
    _state[\"channel\"] = random.choice(CHANNELS_5 if req.band == \"5GHz\" else CHANNELS_24)
    if req.band == \"5GHz\":
        _state[\"base_download\"] = 320.0
        _state[\"base_upload\"] = 95.0
        _state[\"base_latency\"] = 22.0
        _state[\"base_signal\"] = -58.0
    else:
        _state[\"base_download\"] = 145.0
        _state[\"base_upload\"] = 42.0
        _state[\"base_latency\"] = 38.0
        _state[\"base_signal\"] = -62.0

    # Log timeline event
    ev = {
        \"id\": str(uuid.uuid4()),
        \"timestamp\": datetime.now(timezone.utc).isoformat(),
        \"title\": f\"Switched to {req.band}\",
        \"detail\": f\"Now on channel {_state['channel']}.\",
        \"severity\": \"success\",
        \"resolved\": True,
    }
    await db.timeline.insert_one(ev.copy())
    return {\"ok\": True, \"band\": _state[\"band\"], \"channel\": _state[\"channel\"]}


@api_router.post(\"/network/restart-router\")
async def restart_router():
    # Improves metrics temporarily
    _state[\"base_latency\"] *= 0.7
    _state[\"base_signal\"] = max(-58.0, _state[\"base_signal\"] + 4)
    _state[\"base_download\"] *= 1.15
    ev = {
        \"id\": str(uuid.uuid4()),
        \"timestamp\": datetime.now(timezone.utc).isoformat(),
        \"title\": \"Router restarted\",
        \"detail\": \"Auto-healing reset improved latency and signal.\",
        \"severity\": \"success\",
        \"resolved\": True,
    }
    await db.timeline.insert_one(ev.copy())
    return {\"ok\": True}


# --------------------------
# AI: Smart Recommendations + Prediction (Claude Sonnet 4.5)
# --------------------------

def _fallback_recommendations(m: Dict[str, Any]) -> List[Dict[str, str]]:
    recs = []
    if m[\"band\"] == \"2.4GHz\":
        recs.append({
            \"id\": \"rec-5ghz\",
            \"title\": \"Switch to 5 GHz\",
            \"detail\": \"The 5 GHz band is less crowded and historically improved your speed by ~30%.\",
            \"impact\": \"HIGH\",
            \"action\": \"SWITCH_BAND_5GHZ\",
        })
    if m[\"latency_ms\"] > 60:
        recs.append({
            \"id\": \"rec-restart\",
            \"title\": \"Restart your router\",
            \"detail\": f\"Latency is {int(m['latency_ms'])}ms. A quick restart clears stale connections.\",
            \"impact\": \"MEDIUM\",
            \"action\": \"RESTART_ROUTER\",
        })
    if m[\"signal_dbm\"] < -72:
        recs.append({
            \"id\": \"rec-mesh\",
            \"title\": \"Move closer or add a mesh node\",
            \"detail\": f\"Signal is {int(m['signal_dbm'])} dBm in your current location.\",
            \"impact\": \"HIGH\",
            \"action\": \"MOVE_CLOSER\",
        })
    if m[\"devices_count\"] >= 7:
        recs.append({
            \"id\": \"rec-qos\",
            \"title\": \"Enable QoS prioritization\",
            \"detail\": f\"{m['devices_count']} devices are competing. Prioritize video calls & gaming.\",
            \"impact\": \"MEDIUM\",
            \"action\": \"ENABLE_QOS\",
        })
    if not recs:
        recs.append({
            \"id\": \"rec-maintain\",
            \"title\": \"Keep firmware up to date\",
            \"detail\": \"Network is healthy. Periodic firmware updates keep it that way.\",
            \"impact\": \"LOW\",
            \"action\": \"UPDATE_FIRMWARE\",
        })
    return recs


@api_router.post(\"/network/recommendations\")
async def get_recommendations():
    m = _current_metrics()
    fallback = _fallback_recommendations(m)

    if not EMERGENT_LLM_KEY:
        return {\"recommendations\": fallback, \"source\": \"rule-based\"}

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f\"wifi-recs-{uuid.uuid4()}\",
            system_message=(
                \"You are an elite network engineer. Given live WiFi metrics, return exactly 3-4 \"
                \"specific, actionable recommendations to improve the network. \"
                \"Respond ONLY with a compact JSON array. Each item: \"
                '{\"id\": string, \"title\": short title (max 6 words), \"detail\": 1-2 sentence plain-English explanation, '
                '\"impact\": \"HIGH\"|\"MEDIUM\"|\"LOW\", \"action\": UPPER_SNAKE_CASE action code}. '
                \"No markdown, no prose outside the JSON.\"
            ),
        ).with_model(\"anthropic\", \"claude-sonnet-4-5-20250929\")

        prompt = (
            f\"Network snapshot: SSID={m['ssid']}, router={m['router_model']}, \"
            f\"band={m['band']} ch{m['channel']}, down={m['download_mbps']} Mbps, up={m['upload_mbps']} Mbps, \"
            f\"latency={m['latency_ms']}ms, signal={m['signal_dbm']} dBm, \"
            f\"devices={m['devices_count']}, congestion={m['congestion_pct']}%. \"
            \"Return the JSON array now.\"
        )
        resp = await chat.send_message(UserMessage(text=prompt))
        import json, re
        txt = resp.strip()
        # Strip markdown fences if present
        txt = re.sub(r\"^```(?:json)?\s*\", \"\", txt)
        txt = re.sub(r\"\s*```$\", \"\", txt)
        data = json.loads(txt)
        if isinstance(data, list) and data:
            return {\"recommendations\": data, \"source\": \"claude-sonnet-4-5\"}
    except Exception as e:
        logging.getLogger(__name__).warning(f\"LLM recommendations failed: {e}\")

    return {\"recommendations\": fallback, \"source\": \"rule-based\"}


@api_router.get(\"/network/prediction\", response_model=PredictionResponse)
async def get_prediction():
    m = _current_metrics()
    minutes = random.choice([8, 10, 12, 15, 20])
    confidence = random.randint(68, 92)

    if not EMERGENT_LLM_KEY:
        return PredictionResponse(
            headline=f\"Network likely to slow down in {minutes} minutes\",
            detail=f\"Congestion is trending up ({m['congestion_pct']}%) with {m['devices_count']} devices active.\",
            minutes_until=minutes,
            confidence=confidence,
        )

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f\"wifi-pred-{uuid.uuid4()}\",
            system_message=(
                \"You predict short-term WiFi issues from live metrics. Return ONLY a compact JSON object: \"
                '{\"headline\": short bold statement (max 12 words), \"detail\": one sentence reasoning, '
                '\"minutes_until\": integer minutes}. No markdown.'
            ),
        ).with_model(\"anthropic\", \"claude-sonnet-4-5-20250929\")
        resp = await chat.send_message(UserMessage(text=(
            f\"Metrics: band={m['band']}, down={m['download_mbps']} Mbps, lat={m['latency_ms']}ms, \"
            f\"signal={m['signal_dbm']} dBm, devices={m['devices_count']}, cong={m['congestion_pct']}%. \"
            \"Return JSON now.\"
        )))
        import json, re
        txt = resp.strip()
        txt = re.sub(r\"^```(?:json)?\s*\", \"\", txt)
        txt = re.sub(r\"\s*```$\", \"\", txt)
        data = json.loads(txt)
        return PredictionResponse(
            headline=str(data.get(\"headline\", f\"Slowdown in {minutes} minutes\")),
            detail=str(data.get(\"detail\", \"Based on current congestion trends.\")),
            minutes_until=int(data.get(\"minutes_until\", minutes)),
            confidence=confidence,
        )
    except Exception as e:
        logging.getLogger(__name__).warning(f\"LLM prediction failed: {e}\")

    return PredictionResponse(
        headline=f\"Network likely to slow down in {minutes} minutes\",
        detail=f\"Congestion is trending up ({m['congestion_pct']}%) with {m['devices_count']} devices active.\",
        minutes_until=minutes,
        confidence=confidence,
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event(\"shutdown\")
async def shutdown_db_client():
    client.close()
"
