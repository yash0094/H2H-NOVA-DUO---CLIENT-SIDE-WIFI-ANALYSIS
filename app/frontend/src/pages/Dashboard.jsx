"import React, { useEffect, useState } from \"react\";
import { useNavigate } from \"react-router-dom\";
import HealthGauge from \"../components/HealthGauge\";
import MetricCard from \"../components/MetricCard\";
import { getStatus, getIssues, toggleBand, restartRouter } from \"../lib/api\";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  TimerIcon,
  WifiHighIcon,
  UsersIcon,
  StackIcon,
  WarningOctagonIcon,
  LightningIcon,
  ArrowRightIcon,
} from \"@phosphor-icons/react\";
import { toast } from \"sonner\";

const SEV_COLOR = { critical: \"#FF3333\", warning: \"#FFEA00\", info: \"#3366FF\", success: \"#00FF66\" };

export default function Dashboard() {
  const [status, setStatus] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const navigate = useNavigate();

  const refresh = async () => {
    try {
      const [s, i] = await Promise.all([getStatus(), getIssues()]);
      setStatus(s);
      setIssues(i.issues || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  const handleQuickFix = async () => {
    if (!status) return;
    setActing(true);
    try {
      if (status.band === \"2.4GHz\") {
        await toggleBand(\"5GHz\");
        toast.success(\"Switched to 5 GHz\");
      } else {
        await restartRouter();
        toast.success(\"Router restarted\");
      }
      await refresh();
    } catch {
      toast.error(\"Action failed\");
    } finally {
      setActing(false);
    }
  };

  if (loading || !status) {
    return (
      <div className=\"p-8 font-mono text-sm text-[#A1A1A1]\" data-testid=\"dashboard-loading\">
        &gt; INITIALIZING NETWORK SCAN<span className=\"cursor-blink\">_</span>
      </div>
    );
  }

  const critical = issues.find(i => i.severity === \"critical\");
  const topIssue = critical || issues[0];

  return (
    <div className=\"flex flex-col\" data-testid=\"dashboard-page\">
      {/* Hero band */}
      <section className=\"border-b border-[#2E2E2E] px-4 md:px-8 py-6 md:py-10\">
        <div className=\"grid grid-cols-1 lg:grid-cols-12 gap-6 items-center\">
          <div className=\"lg:col-span-5\">
            <div className=\"label-micro mb-2\">NETWORK</div>
            <h1 className=\"font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter uppercase leading-[0.9]\">
              {status.ssid}
            </h1>
            <div className=\"font-mono text-xs text-[#A1A1A1] mt-3\" data-testid=\"router-info\">
              {status.router_model} / {status.band} / CH{status.channel}
            </div>
            <div className=\"mt-6 flex flex-wrap gap-3\">
              <button
                onClick={handleQuickFix}
                disabled={acting}
                data-testid=\"fix-my-wifi-btn\"
                className=\"bg-[#FAFAFA] text-[#0A0A0A] px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#00FF66] transition-colors flex items-center gap-2 disabled:opacity-50\"
              >
                <LightningIcon size={14} weight=\"fill\" />
                {acting ? \"Executing...\" : \"Fix My WiFi\"}
              </button>
              <button
                onClick={() => navigate(\"/diagnose\")}
                data-testid=\"run-diagnostic-btn\"
                className=\"border border-[#2E2E2E] hover:border-[#FAFAFA] text-[#FAFAFA] px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase transition-colors flex items-center gap-2\"
              >
                Run Full Diagnostic <ArrowRightIcon size={14} weight=\"bold\" />
              </button>
            </div>
          </div>
          <div className=\"lg:col-span-7 flex justify-center lg:justify-end\">
            <HealthGauge score={status.health_score} label={status.health_label} />
          </div>
        </div>
      </section>

      {/* What's wrong */}
      {topIssue && topIssue.code !== \"HEALTHY\" && (
        <section
          className=\"border-b border-[#2E2E2E] px-4 md:px-8 py-6 flex items-start gap-4 cursor-pointer hover:bg-[#141414] transition-colors\"
          style={{ borderLeft: `4px solid ${SEV_COLOR[topIssue.severity]}` }}
          onClick={() => navigate(\"/recommendations\")}
          data-testid=\"whats-wrong-card\"
        >
          <WarningOctagonIcon size={28} weight=\"fill\" color={SEV_COLOR[topIssue.severity]} className=\"shrink-0 mt-1\" />
          <div className=\"flex-1\">
            <div className=\"label-micro\" style={{ color: SEV_COLOR[topIssue.severity] }}>
              WHAT'S WRONG / {topIssue.severity.toUpperCase()}
            </div>
            <div className=\"font-heading font-bold text-xl md:text-2xl mt-1\">{topIssue.title}</div>
            <div className=\"font-body text-sm text-[#A1A1A1] mt-1\">{topIssue.detail}</div>
          </div>
          <ArrowRightIcon size={20} weight=\"bold\" className=\"self-center shrink-0\" />
        </section>
      )}

      {/* Metrics grid */}
      <section className=\"px-4 md:px-8 py-6 border-b border-[#2E2E2E]\">
        <div className=\"flex items-center justify-between mb-4\">
          <div className=\"label-micro\">LIVE METRICS</div>
          <div className=\"label-micro text-[#525252]\">UPDATED {new Date().toLocaleTimeString()}</div>
        </div>
        <div className=\"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 border border-[#2E2E2E]\">
          <div className=\"border-r border-b md:border-b-0 border-[#2E2E2E] p-4 md:p-6 flex flex-col gap-2\" data-testid=\"metric-download\">
            <div className=\"flex items-center gap-2\"><ArrowDownIcon size={12} color=\"#00FF66\" weight=\"bold\" /><span className=\"label-micro\">DOWNLOAD</span></div>
            <div className=\"font-mono text-3xl md:text-4xl tracking-tighter\">{status.download_mbps}</div>
            <div className=\"label-micro text-[#525252]\">Mbps</div>
          </div>
          <div className=\"border-r border-b md:border-b-0 border-[#2E2E2E] p-4 md:p-6 flex flex-col gap-2\" data-testid=\"metric-upload\">
            <div className=\"flex items-center gap-2\"><ArrowUpIcon size={12} color=\"#3366FF\" weight=\"bold\" /><span className=\"label-micro\">UPLOAD</span></div>
            <div className=\"font-mono text-3xl md:text-4xl tracking-tighter\">{status.upload_mbps}</div>
            <div className=\"label-micro text-[#525252]\">Mbps</div>
          </div>
          <div className=\"border-r border-b lg:border-b-0 border-[#2E2E2E] p-4 md:p-6 flex flex-col gap-2\" data-testid=\"metric-latency\">
            <div className=\"flex items-center gap-2\"><TimerIcon size={12} weight=\"bold\" /><span className=\"label-micro\">LATENCY</span></div>
            <div className=\"font-mono text-3xl md:text-4xl tracking-tighter\" style={{ color: status.latency_ms > 90 ? \"#FF3333\" : status.latency_ms > 60 ? \"#FFEA00\" : \"#FAFAFA\" }}>
              {Math.round(status.latency_ms)}
            </div>
            <div className=\"label-micro text-[#525252]\">ms</div>
          </div>
          <div className=\"border-r md:border-r border-b md:border-b-0 border-[#2E2E2E] p-4 md:p-6 flex flex-col gap-2\" data-testid=\"metric-signal\">
            <div className=\"flex items-center gap-2\"><WifiHighIcon size={12} weight=\"bold\" /><span className=\"label-micro\">SIGNAL</span></div>
            <div className=\"font-mono text-3xl md:text-4xl tracking-tighter\" style={{ color: status.signal_dbm < -75 ? \"#FF3333\" : status.signal_dbm < -65 ? \"#FFEA00\" : \"#00FF66\" }}>
              {Math.round(status.signal_dbm)}
            </div>
            <div className=\"label-micro text-[#525252]\">dBm</div>
          </div>
          <div className=\"border-r border-[#2E2E2E] p-4 md:p-6 flex flex-col gap-2\" data-testid=\"metric-devices\">
            <div className=\"flex items-center gap-2\"><UsersIcon size={12} weight=\"bold\" /><span className=\"label-micro\">DEVICES</span></div>
            <div className=\"font-mono text-3xl md:text-4xl tracking-tighter\">{status.devices_count}</div>
            <div className=\"label-micro text-[#525252]\">connected</div>
          </div>
          <div className=\"p-4 md:p-6 flex flex-col gap-2\" data-testid=\"metric-congestion\">
            <div className=\"flex items-center gap-2\"><StackIcon size={12} weight=\"bold\" /><span className=\"label-micro\">CONGEST.</span></div>
            <div className=\"font-mono text-3xl md:text-4xl tracking-tighter\" style={{ color: status.congestion_pct > 70 ? \"#FF3333\" : status.congestion_pct > 50 ? \"#FFEA00\" : \"#FAFAFA\" }}>
              {status.congestion_pct}
            </div>
            <div className=\"label-micro text-[#525252]\">%</div>
          </div>
        </div>
      </section>

      {/* Issues list */}
      <section className=\"px-4 md:px-8 py-6\">
        <div className=\"flex items-center justify-between mb-4\">
          <div className=\"label-micro\">DETECTED ISSUES / {issues.length}</div>
          <button onClick={() => navigate(\"/recommendations\")} className=\"label-micro hover:text-[#FAFAFA] flex items-center gap-1\" data-testid=\"view-recs-btn\">
            VIEW RECOMMENDATIONS <ArrowRightIcon size={12} weight=\"bold\" />
          </button>
        </div>
        <div className=\"border border-[#2E2E2E]\" data-testid=\"issues-list\">
          {issues.map((iss, idx) => (
            <div
              key={iss.code + idx}
              className=\"flex items-start gap-4 p-4 md:p-5 border-b border-[#2E2E2E] last:border-b-0 hover:bg-[#141414] transition-colors\"
              data-testid={`issue-${iss.code.toLowerCase()}`}
            >
              <div className=\"w-2 h-2 mt-2 shrink-0\" style={{ background: SEV_COLOR[iss.severity] }} />
              <div className=\"flex-1\">
                <div className=\"flex items-center gap-3\">
                  <span className=\"label-micro\" style={{ color: SEV_COLOR[iss.severity] }}>
                    {iss.severity.toUpperCase()}
                  </span>
                  <span className=\"label-micro text-[#525252]\">{iss.code}</span>
                </div>
                <div className=\"font-heading font-semibold text-base md:text-lg mt-1\">{iss.title}</div>
                <div className=\"font-body text-sm text-[#A1A1A1] mt-1\">{iss.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
"
