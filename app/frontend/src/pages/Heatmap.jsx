"import React, { useEffect, useState } from \"react\";
import { getHeatmap } from \"../lib/api\";

const STATUS_COLOR = { good: \"#00FF66\", moderate: \"#FFEA00\", weak: \"#FF3333\" };
const STATUS_HALO = { good: \"halo-good\", moderate: \"halo-moderate\", weak: \"halo-weak\" };

export default function Heatmap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getHeatmap().then(setData);
  }, []);

  if (!data) {
    return <div className=\"p-8 font-mono text-sm text-[#A1A1A1]\" data-testid=\"heatmap-loading\">&gt; Generating zone map<span className=\"cursor-blink\">_</span></div>;
  }

  return (
    <div className=\"p-4 md:p-8\" data-testid=\"heatmap-page\">
      <div className=\"label-micro mb-2\">SPATIAL ANALYSIS</div>
      <h1 className=\"font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter uppercase\">Zone Mapping</h1>
      <p className=\"font-mono text-xs text-[#A1A1A1] mt-2\">// Signal propagation across your environment. Router marked [R].</p>

      <div className=\"mt-8 grid grid-cols-1 lg:grid-cols-3 gap-0 border border-[#2E2E2E]\">
        {/* Map */}
        <div className=\"lg:col-span-2 relative aspect-[4/3] border-b lg:border-b-0 lg:border-r border-[#2E2E2E] bg-[#141414] overflow-hidden\" data-testid=\"heatmap-canvas\">
          <div className=\"absolute inset-0 grid-lines opacity-40\" />

          {/* Halos */}
          {data.zones.map(z => (
            <div
              key={z.id + \"-halo\"}
              className={`absolute rounded-full ${STATUS_HALO[z.status]}`}
              style={{
                left: `${z.x}%`,
                top: `${z.y}%`,
                width: \"180px\",
                height: \"180px\",
                transform: \"translate(-50%, -50%)\",
              }}
            />
          ))}

          {/* Router */}
          <div
            className=\"absolute w-10 h-10 bg-[#FAFAFA] text-[#0A0A0A] font-mono font-bold text-sm flex items-center justify-center\"
            style={{ left: `${data.router.x}%`, top: `${data.router.y}%`, transform: \"translate(-50%, -50%)\" }}
            data-testid=\"router-marker\"
          >
            R
          </div>

          {/* Zone markers */}
          {data.zones.map(z => (
            <div
              key={z.id}
              className=\"absolute flex flex-col items-center\"
              style={{ left: `${z.x}%`, top: `${z.y}%`, transform: \"translate(-50%, -50%)\" }}
              data-testid={`zone-${z.id}`}
            >
              <div
                className=\"w-4 h-4 border-2\"
                style={{ borderColor: STATUS_COLOR[z.status], background: \"#0A0A0A\" }}
              />
              <div className=\"font-mono text-[10px] text-[#FAFAFA] mt-1 bg-[#0A0A0A] px-1 border border-[#2E2E2E] whitespace-nowrap\">
                {z.name} / {z.signal_dbm}
              </div>
            </div>
          ))}
        </div>

        {/* Legend + zone list */}
        <div className=\"p-4 md:p-6 bg-[#0A0A0A]\">
          <div className=\"label-micro mb-3\">LEGEND</div>
          <div className=\"space-y-2 mb-6\">
            {[[\"good\", \"GOOD\", \"≥ -65 dBm\"], [\"moderate\", \"MODERATE\", \"-65 to -75\"], [\"weak\", \"WEAK\", \"< -75 dBm\"]].map(([k, label, range]) => (
              <div key={k} className=\"flex items-center gap-3\">
                <div className=\"w-3 h-3\" style={{ background: STATUS_COLOR[k] }} />
                <span className=\"label-micro text-[#FAFAFA]\">{label}</span>
                <span className=\"label-micro text-[#525252] ml-auto\">{range}</span>
              </div>
            ))}
          </div>

          <div className=\"label-micro mb-3\">ZONES / {data.zones.length}</div>
          <div className=\"border border-[#2E2E2E]\">
            {data.zones.map(z => (
              <div key={z.id} className=\"flex items-center gap-3 p-3 border-b border-[#2E2E2E] last:border-b-0 hover:bg-[#141414]\">
                <div className=\"w-2 h-2\" style={{ background: STATUS_COLOR[z.status] }} />
                <span className=\"font-body text-sm flex-1\">{z.name}</span>
                <span className=\"font-mono text-xs\" style={{ color: STATUS_COLOR[z.status] }}>{z.signal_dbm}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
"
