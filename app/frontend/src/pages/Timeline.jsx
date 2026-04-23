"import React, { useEffect, useState } from \"react\";
import { getTimeline } from \"../lib/api\";

const SEV_COLOR = { critical: \"#FF3333\", warning: \"#FFEA00\", info: \"#3366FF\", success: \"#00FF66\" };

const formatWhen = (iso) => {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return \"just now\";
  if (diffMin < 60) return `${diffMin}m ago`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
};

export default function Timeline() {
  const [events, setEvents] = useState([]);
  useEffect(() => { getTimeline().then(setEvents); }, []);

  return (
    <div className=\"p-4 md:p-8\" data-testid=\"timeline-page\">
      <div className=\"label-micro mb-2\">SYSTEM LOG</div>
      <h1 className=\"font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter uppercase\">Problem Timeline</h1>
      <p className=\"font-mono text-xs text-[#A1A1A1] mt-2\">// Historical events &amp; auto-resolutions.</p>

      <div className=\"mt-8 relative pl-6 md:pl-8\" data-testid=\"timeline-list\">
        {/* vertical line */}
        <div className=\"absolute left-2 md:left-3 top-0 bottom-0 w-px bg-[#2E2E2E]\" />
        {events.map((ev, idx) => (
          <div key={ev.id} className=\"relative pb-6\" data-testid={`timeline-${idx}`}>
            {/* node */}
            <div
              className=\"absolute left-[-22px] md:left-[-26px] top-1 w-3 h-3 border-2 bg-[#0A0A0A]\"
              style={{ borderColor: SEV_COLOR[ev.severity] }}
            />
            <div className=\"tile p-4 md:p-5\">
              <div className=\"flex flex-wrap items-center gap-3 mb-2\">
                <span className=\"label-micro\" style={{ color: SEV_COLOR[ev.severity] }}>
                  {ev.severity.toUpperCase()}
                </span>
                <span className=\"label-micro text-[#525252]\">{formatWhen(ev.timestamp)}</span>
                {ev.resolved && (
                  <span className=\"label-micro text-[#00FF66]\">RESOLVED</span>
                )}
              </div>
              <div className=\"font-heading font-semibold text-lg\">{ev.title}</div>
              <div className=\"font-body text-sm text-[#A1A1A1] mt-1\">{ev.detail}</div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className=\"font-mono text-sm text-[#A1A1A1]\">&gt; No events recorded.</div>
        )}
      </div>
    </div>
  );
}
"
