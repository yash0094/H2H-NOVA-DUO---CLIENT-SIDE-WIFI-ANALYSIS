"import React, { useEffect, useState } from \"react\";
import { useNavigate } from \"react-router-dom\";
import MobileLayout from \"../components/MobileLayout\";
import { getSettings, updateSettings, getNotifications, readAllNotifs } from \"../lib/api\";
import { Bell, Zap, Moon, ShieldCheck, Share2, HelpCircle, ChevronRight, LogOut } from \"lucide-react\";

function Toggle({ on, onChange, testid }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className=\"w-11 h-6 rounded-full transition-all relative\"
      style={{ background: on ? \"linear-gradient(180deg, #2f95ff, #0b6ee8)\" : \"#d5e0ee\" }}
      data-testid={testid}
    >
      <span
        className=\"absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all\"
        style={{ left: on ? 22 : 2 }}
      />
    </button>
  );
}

export default function More() {
  const nav = useNavigate();
  const [settings, setSettings] = useState(null);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    const [s, n] = await Promise.all([getSettings(), getNotifications()]);
    setSettings(s);
    setUnread(n.filter(x => !x.read).length);
  };
  useEffect(() => { load(); }, []);

  const update = async (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await updateSettings(next);
  };

  if (!settings) {
    return <MobileLayout title=\"More\"><div className=\"py-20 text-center\" style={{ color: \"var(--ink-500)\" }}>Loading...</div></MobileLayout>;
  }

  return (
    <MobileLayout title=\"Settings & More\">
      <section className=\"glass-card p-4 mt-2 fade-in\" data-testid=\"profile-card\">
        <div className=\"flex items-center gap-3\">
          <div
            className=\"w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-[18px]\"
            style={{ background: \"linear-gradient(135deg, #4ea3ff, #0b6ee8)\" }}
          >HN</div>
          <div className=\"flex-1\">
            <div className=\"text-[15px] font-extrabold\" style={{ color: \"var(--ink-900)\" }}>Home Network</div>
            <div className=\"text-[12px] font-semibold\" style={{ color: \"var(--ink-500)\" }}>Owner · ASUS RT-AX88U</div>
          </div>
          <button className=\"btn-ghost\" onClick={() => nav(\"/notifications\")} data-testid=\"open-notifs\">
            <Bell size={15} />
            {unread > 0 && <span className=\"ml-1 text-[11px] font-bold\">{unread}</span>}
          </button>
        </div>
      </section>

      <section className=\"soft-card mt-3 p-2 fade-in-2\" data-testid=\"prefs-card\">
        <Row icon={Bell} label=\"Notifications\" sub=\"Alerts, summaries, updates\">
          <Toggle on={settings.notifications_enabled} onChange={v => update({ notifications_enabled: v })} testid=\"toggle-notifs\" />
        </Row>
        <Row icon={Zap} label=\"Auto Scan\" sub={`Every ${settings.scan_interval_min} min`}>
          <Toggle on={settings.auto_scan} onChange={v => update({ auto_scan: v })} testid=\"toggle-autoscan\" />
        </Row>
        <Row icon={ShieldCheck} label=\"Background Monitoring\" sub=\"Keep network watched 24/7\">
          <Toggle on={settings.background_monitoring} onChange={v => update({ background_monitoring: v })} testid=\"toggle-bgmon\" />
        </Row>
        <Row icon={Share2} label=\"Share Diagnostics\" sub=\"Help improve the app\">
          <Toggle on={settings.share_diagnostics} onChange={v => update({ share_diagnostics: v })} testid=\"toggle-share\" />
        </Row>
        <Row icon={Moon} label=\"Theme\" sub={settings.theme === \"light\" ? \"Light\" : \"Dark\"}>
          <button className=\"btn-ghost\" onClick={() => update({ theme: settings.theme === \"light\" ? \"dark\" : \"light\" })} data-testid=\"toggle-theme\">
            Switch
          </button>
        </Row>
      </section>

      <section className=\"soft-card mt-3 p-2 fade-in-3\">
        <Row icon={HelpCircle} label=\"Help & Support\" sub=\"FAQs and contact\"><ChevronRight size={16} style={{ color: \"var(--ink-400)\" }} /></Row>
        <Row icon={LogOut} label=\"Sign Out\" sub=\"Disconnect from this network\"><ChevronRight size={16} style={{ color: \"var(--ink-400)\" }} /></Row>
      </section>

      <div className=\"text-center text-[11px] font-semibold mt-5\" style={{ color: \"var(--ink-400)\" }}>
        v1.0.0 · Smart WiFi Diagnostics
      </div>
    </MobileLayout>
  );
}

function Row({ icon: Icon, label, sub, children }) {
  return (
    <div className=\"flex items-center gap-3 px-2 py-3 border-b last:border-b-0\" style={{ borderColor: \"#eef3fb\" }}>
      <div className=\"icon-circle\"><Icon size={16} /></div>
      <div className=\"flex-1 min-w-0\">
        <div className=\"text-[13px] font-extrabold\" style={{ color: \"var(--ink-900)\" }}>{label}</div>
        <div className=\"text-[11px] font-medium\" style={{ color: \"var(--ink-500)\" }}>{sub}</div>
      </div>
      {children}
    </div>
  );
}
"
