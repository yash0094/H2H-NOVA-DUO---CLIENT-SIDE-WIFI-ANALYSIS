"import React, { useEffect, useState } from \"react\";
import MobileLayout from \"../components/MobileLayout\";
import { getDevices, addDevice, deleteDevice, toggleDevice } from \"../lib/api\";
import { Smartphone, Laptop, Tv, Tablet, Gamepad2, Monitor, Cpu, Plus, Trash2, Wifi, WifiOff, X } from \"lucide-react\";

const ICONS = {
  phone: Smartphone, laptop: Laptop, tv: Tv, tablet: Tablet, console: Gamepad2, desktop: Monitor, iot: Cpu,
};

function SignalBars({ value }) {
  const bars = [20, 30, 40, 55]; // heights
  const active = value > 75 ? 4 : value > 55 ? 3 : value > 35 ? 2 : 1;
  return (
    <span className=\"signal-bars\" aria-label={`${value}%`}>
      {bars.map((h, i) => (
        <i key={i} style={{ height: `${h}%`, minHeight: 6 }} className={i < active ? \"on\" : \"\"} />
      ))}
    </span>
  );
}

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: \"\", type: \"phone\" });

  const load = async () => setDevices(await getDevices());
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addDevice(form);
    setForm({ name: \"\", type: \"phone\" });
    setAdding(false);
    load();
  };

  const onDel = async (id) => { await deleteDevice(id); load(); };
  const onToggle = async (id) => { await toggleDevice(id); load(); };

  return (
    <MobileLayout title=\"Connected Devices\">
      <div className=\"flex items-center justify-between mt-1 px-1\">
        <div className=\"text-[13px] font-semibold\" style={{ color: \"var(--ink-500)\" }}>
          {devices.filter(d => d.is_online).length} online · {devices.length} total
        </div>
        <button className=\"btn-ghost flex items-center gap-1\" onClick={() => setAdding(true)} data-testid=\"add-device-btn\">
          <Plus size={15} /> Add
        </button>
      </div>

      <ul className=\"mt-3 space-y-2\" data-testid=\"device-list\">
        {devices.map(d => {
          const Icon = ICONS[d.type] || Smartphone;
          return (
            <li key={d.id} className=\"row\" data-testid={`device-${d.id}`}>
              <div className=\"icon-circle\"><Icon size={18} /></div>
              <div className=\"flex-1 min-w-0\">
                <div className=\"flex items-center gap-1.5\">
                  <div className=\"text-[14px] font-bold truncate\" style={{ color: \"var(--ink-900)\" }}>{d.name}</div>
                  {!d.is_online && <span className=\"pill warn\" style={{ padding: \"2px 7px\", fontSize: 10 }}>Offline</span>}
                </div>
                <div className=\"text-[11px] font-medium mt-0.5\" style={{ color: \"var(--ink-500)\" }}>
                  {d.band} · {d.ip} · {(d.data_usage_mb / 1024).toFixed(2)} GB
                </div>
              </div>
              <div className=\"flex items-center gap-2\">
                <SignalBars value={d.signal_strength} />
                <button onClick={() => onToggle(d.id)} className=\"w-8 h-8 rounded-full flex items-center justify-center\" style={{ background: \"#eaf2fc\", color: \"var(--blue-700)\" }} data-testid={`toggle-${d.id}`}>
                  {d.is_online ? <Wifi size={14} /> : <WifiOff size={14} />}
                </button>
                <button onClick={() => onDel(d.id)} className=\"w-8 h-8 rounded-full flex items-center justify-center\" style={{ background: \"#fde7e9\", color: \"#b91c1c\" }} data-testid={`del-${d.id}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {adding && (
        <div
          style={{ position: \"absolute\", inset: 0, background: \"rgba(11,42,74,0.4)\", display: \"flex\", alignItems: \"flex-end\", zIndex: 20, borderRadius: \"inherit\" }}
          onClick={() => setAdding(false)}
          data-testid=\"add-modal\"
        >
          <form onClick={e => e.stopPropagation()} onSubmit={submit} className=\"w-full bg-white p-5 rounded-t-[24px]\" style={{ boxShadow: \"0 -20px 40px rgba(11,42,74,0.25)\" }}>
            <div className=\"flex items-center justify-between mb-3\">
              <div className=\"text-[16px] font-extrabold\" style={{ color: \"var(--ink-900)\" }}>Add Device</div>
              <button type=\"button\" onClick={() => setAdding(false)} className=\"w-8 h-8 rounded-full flex items-center justify-center\" style={{ background: \"#eaf2fc\" }}><X size={16} /></button>
            </div>
            <label className=\"block text-[12px] font-bold mb-1\" style={{ color: \"var(--ink-500)\" }}>Device name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder=\"e.g. Kitchen Echo\"
              className=\"w-full px-3 py-3 rounded-[12px] text-[14px] font-semibold outline-none\"
              style={{ background: \"#f1f6fd\", border: \"1px solid #dfeaf8\", color: \"var(--ink-900)\" }}
              data-testid=\"add-name-input\"
            />
            <label className=\"block text-[12px] font-bold mt-3 mb-1\" style={{ color: \"var(--ink-500)\" }}>Type</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className=\"w-full px-3 py-3 rounded-[12px] text-[14px] font-semibold outline-none\"
              style={{ background: \"#f1f6fd\", border: \"1px solid #dfeaf8\", color: \"var(--ink-900)\" }}
              data-testid=\"add-type-select\"
            >
              {Object.keys(ICONS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <button className=\"btn-primary w-full mt-4\" type=\"submit\" data-testid=\"add-submit\">ADD DEVICE</button>
          </form>
        </div>
      )}
    </MobileLayout>
  );
}
"
