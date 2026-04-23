"import React from \"react\";
import { NavLink, useLocation } from \"react-router-dom\";
import { Home, Activity, Shield, Smartphone, MoreHorizontal, Bell, Settings as Cog } from \"lucide-react\";

const TABS = [
  { to: \"/\", label: \"Dashboard\", icon: Home, exact: true, testid: \"nav-dashboard\" },
  { to: \"/devices\", label: \"Devices\", icon: Smartphone, testid: \"nav-devices\" },
  { to: \"/diagnostics\", label: \"Diagnostics\", icon: Activity, testid: \"nav-diagnostics\" },
  { to: \"/security\", label: \"Security\", icon: Shield, testid: \"nav-security\" },
  { to: \"/more\", label: \"More\", icon: MoreHorizontal, testid: \"nav-more\" },
];

export default function MobileLayout({ children, title, notifCount = 0, onBell, onCog, showTopBar = true }) {
  const { pathname } = useLocation();
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: \"2-digit\", minute: \"2-digit\", hour12: false });

  return (
    <div className=\"phone-stage\">
      <div className=\"phone-frame\" data-testid=\"phone-frame\">
        <div className=\"status-bar\" data-testid=\"status-bar\">
          <span>{time}</span>
          <span className=\"flex items-center gap-1\" style={{ fontSize: 11 }}>
            <span>●●●</span>
            <span>WiFi</span>
            <span>100%</span>
          </span>
        </div>

        {showTopBar && (
          <div className=\"flex items-center justify-between px-5 pt-2 pb-2\" data-testid=\"top-bar\">
            <h1 className=\"text-[19px] font-extrabold tracking-tight\" style={{ color: \"var(--ink-900)\" }}>
              {title}
            </h1>
            <div className=\"flex items-center gap-2\">
              <button
                onClick={onBell}
                className=\"relative w-9 h-9 rounded-full flex items-center justify-center\"
                style={{ background: \"#eaf2fc\", color: \"var(--blue-700)\" }}
                data-testid=\"bell-button\"
              >
                <Bell size={17} />
                {notifCount > 0 && (
                  <span
                    className=\"absolute -top-0.5 -right-0.5 text-[10px] font-bold text-white rounded-full w-4 h-4 flex items-center justify-center\"
                    style={{ background: \"#ef4444\" }}
                    data-testid=\"bell-badge\"
                  >
                    {notifCount}
                  </span>
                )}
              </button>
              <button
                onClick={onCog}
                className=\"w-9 h-9 rounded-full flex items-center justify-center\"
                style={{ background: \"#eaf2fc\", color: \"var(--blue-700)\" }}
                data-testid=\"settings-button\"
              >
                <Cog size={17} />
              </button>
            </div>
          </div>
        )}

        <div className=\"content-scroll\" data-testid=\"scroll-area\">
          {children}
        </div>

        <nav className=\"bottom-nav\" data-testid=\"bottom-nav\">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <NavLink key={t.to} to={t.to} className={`nav-item ${active ? \"active\" : \"\"}`} data-testid={t.testid}>
                <span className=\"nav-icon-wrap\"><Icon size={18} /></span>
                <span>{t.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
"
