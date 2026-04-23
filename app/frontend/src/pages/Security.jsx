"import React, { useEffect, useState } from \"react\";
import MobileLayout from \"../components/MobileLayout\";
import { getSecurityLatest, securityScan } from \"../lib/api\";
import { Shield, CheckCircle2, AlertTriangle, Lock, Eye, Globe } from \"lucide-react\";

export default function Security() {
  const [report, setReport] = useState(null);
  const [scanning, setScanning] = useState(false);

  const load = async () => setReport(await getSecurityLatest());
  useEffect(() => { load(); }, []);

  const runScan = async () => {
    setScanning(true);
    const r = await securityScan();
    setReport(r);
    setScanning(false);
  };

  if (!report) {
    return (
      <MobileLayout title=\"Security\">
        <div className=\"py-20 text-center\" style={{ color: \"var(--ink-500)\" }}>Loading...</div>
      </MobileLayout>
    );
  }

  const score = report.score;
  const color = score >= 85 ? \"#22c55e\" : score >= 65 ? \"#f59e0b\" : \"#ef4444\";

  return (
    <MobileLayout title=\"Security\">
      <section className=\"glass-card p-5 mt-2 fade-in\" data-testid=\"sec-hero\">
        <div className=\"flex items-center gap-4\">
          <div
            className=\"w-20 h-20 rounded-2xl flex items-center justify-center\"
            style={{ background: `linear-gradient(180deg, ${color}22, ${color}44)`, color }}
          >
            <Shield size={34} />
          </div>
          <div className=\"flex-1\">
            <div className=\"text-[13px] font-bold\" style={{ color: \"var(--ink-500)\" }}>Security Score</div>
            <div className=\"text-[34px] font-extrabold leading-none mt-1\" style={{ color }}>{score}<span className=\"text-[16px] font-bold\" style={{ color: \"var(--ink-500)\" }}>/100</span></div>
            <div className=\"text-[12px] font-semibold mt-1\" style={{ color: \"var(--ink-700)\" }}>
              Encryption: <b>{report.encryption}</b>
            </div>
          </div>
        </div>
        <button className=\"btn-primary w-full mt-4\" onClick={runScan} disabled={scanning} data-testid=\"sec-rescan\">
          {scanning ? \"SCANNING...\" : \"RUN SECURITY SCAN\"}
        </button>
      </section>

      <section className=\"grid grid-cols-2 gap-2 mt-3 fade-in-2\" data-testid=\"sec-grid\">
        <StatCard icon={Lock} label=\"Firewall\" value={report.firewall_enabled ? \"Active\" : \"Disabled\"} good={report.firewall_enabled} />
        <StatCard icon={Eye} label=\"Guest Isolated\" value={report.guest_network_isolated ? \"Yes\" : \"No\"} good={report.guest_network_isolated} />
        <StatCard icon={Shield} label=\"Password\" value={report.weak_password ? \"Weak\" : \"Strong\"} good={!report.weak_password} />
        <StatCard icon={Globe} label=\"Open Ports\" value={report.open_ports.length} good={report.open_ports.length === 0} />
      </section>

      <section className=\"soft-card p-4 mt-3 fade-in-3\" data-testid=\"sec-issues\">
        <div className=\"section-title\">Issues</div>
        {report.issues.length === 0 ? (
          <div className=\"mt-3 flex items-center gap-2 text-[13px] font-semibold\" style={{ color: \"#15803d\" }}>
            <CheckCircle2 size={18} /> No issues found. Your network looks secure.
          </div>
        ) : (
          <ul className=\"mt-3 space-y-2\">
            {report.issues.map((i, idx) => (
              <li key={idx} className=\"flex items-start gap-2 text-[13px] font-semibold\" style={{ color: \"var(--ink-900)\" }} data-testid={`issue-${idx}`}>
                <AlertTriangle size={17} style={{ color: i.severity === \"high\" ? \"#ef4444\" : \"#f59e0b\", flexShrink: 0, marginTop: 1 }} />
                <span>{i.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className=\"soft-card p-4 mt-3 fade-in-3\" data-testid=\"sec-recs\">
        <div className=\"section-title\">Recommendations</div>
        <ul className=\"mt-3 space-y-2\">
          {report.recommendations.map((r, i) => (
            <li key={i} className=\"flex items-start gap-2 text-[13px] font-medium\" style={{ color: \"var(--ink-700)\" }}>
              <CheckCircle2 size={17} style={{ color: \"#1f86ff\", flexShrink: 0, marginTop: 1 }} />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>
    </MobileLayout>
  );
}

function StatCard({ icon: Icon, label, value, good }) {
  const color = good ? \"#22c55e\" : \"#ef4444\";
  return (
    <div className=\"soft-card p-3\" data-testid={`stat-${label}`}>
      <div className=\"flex items-center gap-2\">
        <div className=\"icon-circle\" style={{ width: 34, height: 34, background: `${color}22`, color }}>
          <Icon size={15} />
        </div>
        <div className=\"text-[11px] font-bold\" style={{ color: \"var(--ink-500)\" }}>{label}</div>
      </div>
      <div className=\"text-[18px] font-extrabold mt-2\" style={{ color: \"var(--ink-900)\" }}>{value}</div>
    </div>
  );
}
"
