"import React, { useEffect, useState } from \"react\";
import { getRecommendations, toggleBand, restartRouter } from \"../lib/api\";
import { LightningIcon, ArrowRightIcon, SparkleIcon } from \"@phosphor-icons/react\";
import { toast } from \"sonner\";

const IMPACT_COLOR = { HIGH: \"#FF3333\", MEDIUM: \"#FFEA00\", LOW: \"#3366FF\" };

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getRecommendations();
      setData(res);
    } catch {
      toast.error(\"Failed to load recommendations\");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runAction = async (rec) => {
    setActing(rec.id);
    try {
      if (rec.action === \"SWITCH_BAND_5GHZ\") {
        await toggleBand(\"5GHz\");
        toast.success(\"Switched to 5 GHz\");
      } else if (rec.action === \"RESTART_ROUTER\") {
        await restartRouter();
        toast.success(\"Router restarted\");
      } else {
        toast.success(`Action queued: ${rec.action}`);
      }
      await load();
    } catch {
      toast.error(\"Action failed\");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className=\"p-4 md:p-8\" data-testid=\"recommendations-page\">
      <div className=\"flex items-center gap-2 label-micro mb-2\">
        <SparkleIcon size={12} weight=\"fill\" color=\"#00FF66\" />
        AI ANALYSIS / {data?.source || \"loading\"}
      </div>
      <h1 className=\"font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter uppercase\">
        Smart Recommendations
      </h1>
      <p className=\"font-mono text-xs text-[#A1A1A1] mt-2\">
        // Targeted fixes derived from live network telemetry.
      </p>

      <div className=\"mt-8 border border-[#2E2E2E]\" data-testid=\"recs-list\">
        {loading && (
          <div className=\"p-8 font-mono text-sm text-[#A1A1A1]\">&gt; Compiling recommendations<span className=\"cursor-blink\">_</span></div>
        )}
        {!loading && data?.recommendations?.map((rec, idx) => (
          <div
            key={rec.id || idx}
            className=\"flex flex-col md:flex-row gap-4 md:gap-6 p-5 md:p-6 border-b border-[#2E2E2E] last:border-b-0 hover:bg-[#141414] transition-colors\"
            data-testid={`rec-${idx}`}
          >
            <div className=\"flex items-start gap-4 flex-1\">
              <div className=\"font-mono text-xs text-[#525252] w-8 shrink-0 pt-1\">
                {String(idx + 1).padStart(2, \"0\")}
              </div>
              <div className=\"flex-1\">
                <div className=\"flex items-center gap-3 mb-2\">
                  <span
                    className=\"label-micro px-2 py-1 border\"
                    style={{ color: IMPACT_COLOR[rec.impact] || \"#FAFAFA\", borderColor: IMPACT_COLOR[rec.impact] || \"#2E2E2E\" }}
                  >
                    {rec.impact} IMPACT
                  </span>
                </div>
                <div className=\"font-heading font-bold text-xl md:text-2xl\">{rec.title}</div>
                <div className=\"font-body text-sm md:text-base text-[#A1A1A1] mt-2\">{rec.detail}</div>
              </div>
            </div>
            <div className=\"flex md:flex-col md:items-end md:justify-center gap-2 shrink-0\">
              <button
                onClick={() => runAction(rec)}
                disabled={acting === rec.id}
                data-testid={`rec-action-${idx}`}
                className=\"bg-[#FAFAFA] text-[#0A0A0A] px-5 py-3 font-mono text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#00FF66] transition-colors flex items-center gap-2 disabled:opacity-40\"
              >
                <LightningIcon size={12} weight=\"fill\" />
                {acting === rec.id ? \"Running...\" : \"Apply Fix\"}
                <ArrowRightIcon size={12} weight=\"bold\" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"
