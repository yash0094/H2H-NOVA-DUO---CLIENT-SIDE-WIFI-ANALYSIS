"import React, { useEffect, useState } from \"react\";
import { useNavigate } from \"react-router-dom\";
import MobileLayout from \"../components/MobileLayout\";
import { getNotifications, markNotifRead, readAllNotifs } from \"../lib/api\";
import { ArrowLeft, Info, AlertTriangle, CheckCircle2 } from \"lucide-react\";

const ICONS = { info: Info, warning: AlertTriangle, success: CheckCircle2 };
const COLORS = { info: \"#1f86ff\", warning: \"#f59e0b\", success: \"#22c55e\" };

export default function Notifications() {
  const nav = useNavigate();
  const [list, setList] = useState([]);

  const load = async () => setList(await getNotifications());
  useEffect(() => { load(); }, []);

  const onRead = async (id) => { await markNotifRead(id); load(); };
  const onReadAll = async () => { await readAllNotifs(); load(); };

  return (
    <MobileLayout title=\"Notifications\" showTopBar={false}>
      <div className=\"flex items-center justify-between py-3 px-1\" data-testid=\"notif-topbar\">
        <button className=\"w-9 h-9 rounded-full flex items-center justify-center\" style={{ background: \"#eaf2fc\", color: \"var(--blue-700)\" }} onClick={() => nav(-1)} data-testid=\"notif-back\">
          <ArrowLeft size={18} />
        </button>
        <div className=\"text-[15px] font-extrabold\" style={{ color: \"var(--ink-900)\" }}>Notifications</div>
        <button className=\"btn-ghost text-[11px]\" onClick={onReadAll} data-testid=\"mark-all\">Read all</button>
      </div>

      {list.length === 0 ? (
        <div className=\"soft-card p-6 mt-3 text-center text-[13px] font-semibold\" style={{ color: \"var(--ink-500)\" }}>
          You're all caught up.
        </div>
      ) : (
        <ul className=\"mt-2 space-y-2\" data-testid=\"notif-list\">
          {list.map(n => {
            const Icon = ICONS[n.type] || Info;
            const color = COLORS[n.type] || \"#1f86ff\";
            return (
              <li key={n.id} className=\"row cursor-pointer\" onClick={() => onRead(n.id)} data-testid={`notif-${n.id}`} style={{ opacity: n.read ? 0.6 : 1 }}>
                <div className=\"icon-circle\" style={{ background: `${color}22`, color }}>
                  <Icon size={16} />
                </div>
                <div className=\"flex-1 min-w-0\">
                  <div className=\"text-[13px] font-extrabold\" style={{ color: \"var(--ink-900)\" }}>{n.title}</div>
                  <div className=\"text-[12px] font-medium mt-0.5\" style={{ color: \"var(--ink-500)\" }}>{n.body}</div>
                </div>
                {!n.read && <span className=\"w-2 h-2 rounded-full\" style={{ background: \"#1f86ff\" }} />}
              </li>
            );
          })}
        </ul>
      )}
    </MobileLayout>
  );
}
"
