"import React, { useEffect, useState } from \"react\";
import { useNavigate } from \"react-router-dom\";
import MobileLayout from \"../components/MobileLayout\";
import { getScans, getTips } from \"../lib/api\";
import { Activity, ChevronRight, CheckCircle2, AlertTriangle, Zap } from \"lucide-react\";

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Diagnostics() {
  const nav = useNavigate();
  const [scans, setScans] = useState([]);
  const [tips, setTips] = useState([]);

  useEffect(() => {
    (async () => {
      const [s, t] = await Promise.all([getScans(), getTips()]);
      setScans(s);
      setTips(t);
    })();
  }, []);

  return (
    <MobileLayout title=\"Diagnostics\">
      <section className=\"glass-card p-5 mt-2 fade-in\" data-testid=\"diag-hero\">
        <div className=\"flex items-center gap-3\">
          <div className=\"icon-circle\" style={{ width: 52, height: 52, background: \"linear-gradient(180deg, #e9f2fe, #c7def9)\" }}>
            <Activity size={22} />
          </div>
          <div className=\"flex-1\">
            <div className=\"text-[16px] font-extrabold\" style={{ color: \"var(--ink-900)\" }}>Run a fresh scan</div>
            <div className=\"text-[12px] font-medium\" style={{ color: \"var(--ink-500)\" }}>Detect issues and get tailored fixes.</div>
          </div>
          <button className=\"btn-primary\" onClick={() => nav(\"/scan\")} data-testid=\"diag-scan-btn\">SCAN</button>
        </div>
      </section>

      <div className=\"flex items-center justify-between mt-4 px-1\">
        <div className=\"section-title\">Scan History</div>
        <div className=\"text-[12px] font-semibold\" style={{ color: \"var(--ink-500)\" }}>{scans.length} total</div>
      </div>

      {scans.length === 0 ? (
        <div className=\"soft-card p-6 mt-3 text-center text-[13px] font-semibold\" style={{ color: \"var(--ink-500)\" }} data-testid=\"no-scans\">
          No scans yet. Run your first diagnostic scan to see results here.
        </div>
      ) : (
        <ul className=\"mt-3 space-y-2\" data-testid=\"scan-list\">
          {scans.map(s => {
            const sev = s.problems?.[0]?.severity || \"low\";
            return (
              <li key={s.id} className=\"row\" data-testid={`scan-${s.id}`}>
                <div className=\"icon-circle\" style={{ background: sev === \"high\" ? \"#fde7e9\" : sev === \"medium\" ? \"#fff3e0\" : \"#e7f7ee\", color: sev === \"high\" ? \"#b91c1c\" : sev === \"medium\" ? \"#b45309\" : \"#15803d\" }}>
                  {sev === \"high\" ? <AlertTriangle size={17} /> : sev === \"medium\" ? <Zap size={17} /> : <CheckCircle2 size={17} />}
                </div>
                <div className=\"flex-1 min-w-0\">
                  <div className=\"text-[13px] font-bold truncate\" style={{ color: \"var(--ink-900)\" }}>{s.summary}</div>
                  <div className=\"text-[11px] font-medium\" style={{ color: \"var(--ink-500)\" }}>
                    ↓ {s.speed_download} Mbps · ↑ {s.speed_upload} Mbps · {s.latency_ms} ms · {timeAgo(s.started_at)}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: \"var(--ink-400)\" }} />
              </li>
            );
          })}
        </ul>
      )}

      <div className=\"section-title mt-5 px-1\">All Optimization Tips</div>
      <ul className=\"mt-2 soft-card p-4 space-y-2\" data-testid=\"tips-full\">
        {tips.map(t => (
          <li key={t.id} className=\"flex items-start gap-2 text-[13px] font-medium\" style={{ color: \"var(--ink-700)\" }}>
            <CheckCircle2 size={17} style={{ color: t.done ? \"#22c55e\" : \"#94a3b8\", flexShrink: 0, marginTop: 1 }} />
            <span>{t.text}</span>
          </li>
        ))}
      </ul>
    </MobileLayout>
  );
}
"
