"import React, { useEffect, useState } from \"react\";
import { useNavigate } from \"react-router-dom\";
import MobileLayout from \"../components/MobileLayout\";
import HealthGauge from \"../components/HealthGauge\";
import { getDashboard, getTips, getNotifications } from \"../lib/api\";
import { Wifi, Download, Upload, Clock, CheckCircle2, ChevronRight, Smartphone, Radio, SignalHigh } from \"lucide-react\";

function Metric({ value, unit, label, accent, testid }) {
  return (
    <div className=\"metric-chip\" data-testid={testid}>
      <div className=\"flex items-baseline gap-1\">
        <span className=\"text-[22px] font-extrabold\" style={{ color: \"var(--ink-900)\" }}>{value}</span>
        <span className=\"text-[11px] font-semibold\" style={{ color: \"var(--ink-500)\" }}>{unit}</span>
      </div>
      <div className=\"text-[11px] font-semibold\" style={{ color: \"var(--ink-400)\" }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [tips, setTips] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      const [s, t, n] = await Promise.all([getDashboard(), getTips(), getNotifications()]);
      setStats(s);
      setTips(t);
      setUnread(n.filter(x => !x.read).length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <MobileLayout
      title=\"Smart WiFi Diagnostics\"
      notifCount={unread}
      onBell={() => nav(\"/notifications\")}
      onCog={() => nav(\"/more\")}
    >
      {!stats ? (
        <div className=\"py-20 text-center\" style={{ color: \"var(--ink-500)\" }} data-testid=\"loading\">Loading...</div>
      ) : (
        <>
          {/* Greeting Card */}
          <section className=\"glass-card p-5 mt-2 fade-in\" data-testid=\"greeting-card\">
            <div className=\"text-[22px] font-extrabold\" style={{ color: \"var(--blue-700)\" }}>{stats.greeting}</div>
            <div className=\"text-[13px] font-medium mt-1\" style={{ color: \"var(--ink-500)\" }}>
              Your network is performing well
            </div>

            <div className=\"mt-4 flex items-center justify-between\">
              <div>
                <div className=\"flex items-center gap-2 text-[13px] font-bold\" style={{ color: \"var(--ink-900)\" }}>
                  <Wifi size={16} style={{ color: \"var(--blue-600)\" }} />
                  WiFi Health Score
                </div>
                <div className=\"health-bars mt-3\" data-testid=\"health-bars\">
                  {[10, 20, 14, 22, 30, 24, 34, 40, 28, 36, 44, 30].map((h, i) => (
                    <span key={i} style={{ height: `${h + 8}px`, animationDelay: `${i * 0.08}s` }} />
                  ))}
                </div>
              </div>
              <HealthGauge value={stats.health_score} max={stats.health_max} />
            </div>
          </section>

          {/* Metrics */}
          <section className=\"grid grid-cols-3 gap-2 mt-3 fade-in-2\">
            <Metric value={stats.download_mbps} unit=\"Mbps\" label=\"Download\" testid=\"metric-download\" />
            <Metric value={stats.upload_mbps} unit=\"Mbps\" label=\"Upload\" testid=\"metric-upload\" />
            <Metric value={stats.latency_ms} unit=\"ms\" label=\"Latency\" testid=\"metric-latency\" />
          </section>

          {/* Stable banner */}
          <section className=\"soft-card mt-3 p-3 flex items-center gap-3 fade-in-2\" data-testid=\"stable-banner\">
            <div className=\"icon-circle\" style={{ background: \"#e7f7ee\", color: \"#15803d\" }}>
              <CheckCircle2 size={18} />
            </div>
            <div className=\"text-[13px] font-semibold\" style={{ color: \"var(--ink-900)\" }}>
              {stats.status_message}
            </div>
          </section>

          {/* Network Summary */}
          <section className=\"soft-card mt-3 p-4 fade-in-3\" data-testid=\"network-summary\">
            <div className=\"flex items-center justify-between\">
              <div className=\"section-title\">Network Summary</div>
              <div className=\"section-link flex items-center gap-0.5\" onClick={() => nav(\"/devices\")}>
                View Details <ChevronRight size={14} />
              </div>
            </div>
            <div className=\"mt-3 grid grid-cols-[1fr_auto] gap-3 items-center\">
              <ul className=\"space-y-2 text-[13px] font-semibold\" style={{ color: \"var(--ink-700)\" }}>
                <li className=\"flex items-center gap-2\">
                  <Smartphone size={15} style={{ color: \"var(--blue-600)\" }} />
                  <span><b>{stats.devices_connected}</b> Devices Connected</span>
                </li>
                <li className=\"flex items-center gap-2\">
                  <Radio size={15} style={{ color: \"var(--blue-600)\" }} />
                  <span>{stats.band} Band</span>
                </li>
                <li className=\"flex items-center gap-2\">
                  <SignalHigh size={15} style={{ color: \"var(--blue-600)\" }} />
                  <span>Channel <b>{stats.channel}</b> ({stats.channel_quality})</span>
                </li>
              </ul>
              <MiniBars />
            </div>
          </section>

          {/* Optimization tips */}
          <section className=\"soft-card mt-3 p-4 fade-in-3\" data-testid=\"tips-card\">
            <div className=\"flex items-center justify-between\">
              <div className=\"section-title\">Optimization Tips</div>
              <div className=\"section-link flex items-center gap-0.5\" onClick={() => nav(\"/diagnostics\")}>
                See All <ChevronRight size={14} />
              </div>
            </div>
            <ul className=\"mt-3 space-y-2\">
              {tips.slice(0, 3).map(t => (
                <li key={t.id} className=\"flex items-start gap-2 text-[13px] font-medium\" style={{ color: \"var(--ink-700)\" }} data-testid={`tip-${t.id}`}>
                  <CheckCircle2 size={17} style={{ color: t.done ? \"#22c55e\" : \"#94a3b8\", flexShrink: 0, marginTop: 1 }} />
                  <span>{t.text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <button
            className=\"btn-primary w-full mt-5\"
            onClick={() => nav(\"/scan\")}
            data-testid=\"start-scan-cta\"
          >
            START NEW SCAN
          </button>
        </>
      )}
    </MobileLayout>
  );
}

function MiniBars() {
  const heights = [18, 24, 16, 28, 22, 32, 26, 36];
  return (
    <div className=\"flex items-end gap-1.5 h-14\" data-testid=\"mini-bars\">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: `${h}px`,
            background: i >= heights.length - 3
              ? \"linear-gradient(180deg, #5fd0ff, #1f86ff)\"
              : \"linear-gradient(180deg, #cfe3fa, #9ac6f5)\",
            borderRadius: 4,
          }}
        />
      ))}
    </div>
  );
}
"
