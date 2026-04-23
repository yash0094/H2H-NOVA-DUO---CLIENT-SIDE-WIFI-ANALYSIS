"import React, { useEffect, useState } from \"react\";
import { useNavigate } from \"react-router-dom\";
import MobileLayout from \"../components/MobileLayout\";
import { runScan } from \"../lib/api\";
import { AlertTriangle, CheckCircle2, ChevronRight, ArrowLeft, Wifi, Gauge, Radio } from \"lucide-react\";

const STEPS = [
  { key: \"scan\", label: \"Checking WiFi\", subtitle: \"Scanning network performance...\" },
  { key: \"analyze\", label: \"Analyzing Network\", subtitle: \"Please wait while we analyze your network...\" },
  { key: \"detect\", label: \"Problem Detected!\", subtitle: \"\" },
  { key: \"solutions\", label: \"Solutions\", subtitle: \"\" },
];

const CHECKS = [
  { key: \"signal\", label: \"Signal Strength\", icon: Wifi },
  { key: \"speed\", label: \"Speed Test\", icon: Gauge },
  { key: \"channel\", label: \"Channel 36 (Best)\", icon: Radio },
];

export default function Scan() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [checkIdx, setCheckIdx] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let timers = [];
    (async () => {
      // Step 0 - scanning (simulate 3 checks)
      setStep(0);
      for (let i = 0; i < 3; i++) {
        await new Promise(r => timers.push(setTimeout(r, 650)));
        if (cancelled) return;
        setCheckIdx(i + 1);
      }
      // Step 1 - analyzing
      setStep(1);
      const [, res] = await Promise.all([
        new Promise(r => timers.push(setTimeout(r, 1400))),
        runScan(),
      ]);
      if (cancelled) return;
      setResult(res);
      // Step 2 - problem detected
      setStep(2);
    })();
    return () => { timers.forEach(clearTimeout); };
     
  }, []);

  const onCancel = () => { setCancelled(true); nav(\"/\"); };

  return (
    <MobileLayout title=\"Diagnostics Scan\" showTopBar={false}>
      {/* Top bar with back */}
      <div className=\"flex items-center justify-between py-3 px-1\" data-testid=\"scan-topbar\">
        <button className=\"w-9 h-9 rounded-full flex items-center justify-center\" style={{ background: \"#eaf2fc\", color: \"var(--blue-700)\" }} onClick={() => nav(-1)} data-testid=\"scan-back\">
          <ArrowLeft size={18} />
        </button>
        <div className=\"text-[15px] font-extrabold\" style={{ color: \"var(--ink-900)\" }}>
          {STEPS[step].label}
        </div>
        <div className=\"w-9 h-9\" />
      </div>

      <div className=\"step-track\" data-testid=\"step-track\">
        {STEPS.map((s, i) => (
          <span key={s.key} className={`step-dot ${step === i ? \"active\" : step > i ? \"done\" : \"\"}`} />
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <section className=\"glass-card p-6 mt-5 fade-in\" data-testid=\"scanning-card\">
          <div className=\"text-center text-[14px] font-semibold\" style={{ color: \"var(--ink-500)\" }}>
            {STEPS[0].subtitle}
          </div>
          <div className=\"flex justify-center mt-4\">
            <div className=\"scan-ring\">
              <div className=\"scan-dot\" />
              <div className=\"text-center\">
                <div className=\"text-[12px] font-bold\" style={{ color: \"var(--ink-500)\" }}>Scanning</div>
                <div className=\"text-[22px] font-extrabold mt-1\" style={{ color: \"var(--blue-700)\" }}>{Math.min(100, checkIdx * 33)}%</div>
              </div>
            </div>
          </div>

          <ul className=\"mt-6 space-y-2\">
            {CHECKS.map((c, i) => {
              const Icon = c.icon;
              const done = i < checkIdx;
              return (
                <li key={c.key} className=\"row\" data-testid={`check-${c.key}`}>
                  <div className=\"icon-circle\">
                    <Icon size={16} />
                  </div>
                  <div className=\"flex-1 text-[13px] font-semibold\" style={{ color: \"var(--ink-900)\" }}>{c.label}</div>
                  <div style={{ color: done ? \"#22c55e\" : \"#b7c8dd\" }}>
                    {done ? <CheckCircle2 size={18} /> : <span className=\"text-[12px] font-bold\">...</span>}
                  </div>
                </li>
              );
            })}
          </ul>

          <button className=\"btn-ghost w-full mt-6\" onClick={onCancel} data-testid=\"scan-cancel\">CANCEL</button>
        </section>
      )}

      {step === 1 && (
        <section className=\"glass-card p-6 mt-5 fade-in\" data-testid=\"analyzing-card\">
          <div className=\"text-center text-[14px] font-semibold\" style={{ color: \"var(--ink-500)\" }}>
            {STEPS[1].subtitle}
          </div>
          <div className=\"flex justify-center mt-6\">
            <div className=\"scan-ring\">
              <div className=\"scan-dot\" />
              <Wifi size={46} style={{ color: \"var(--blue-600)\" }} />
            </div>
          </div>
          <div className=\"text-center mt-5 text-[13px] font-bold\" style={{ color: \"var(--ink-700)\" }}>
            Cross-checking signal, bandwidth, interference and channels...
          </div>
        </section>
      )}

      {step === 2 && result && (
        <ProblemDetected result={result} onSolutions={() => setStep(3)} onBack={() => nav(\"/\")} />
      )}

      {step === 3 && result && (
        <Solutions result={result} onDone={() => nav(\"/diagnostics\")} onBack={() => setStep(2)} />
      )}
    </MobileLayout>
  );
}

function ProblemDetected({ result, onSolutions, onBack }) {
  const problem = result.problems?.[0];
  return (
    <>
      <section className=\"glass-card p-6 mt-5 fade-in\" data-testid=\"problem-card\">
        <div className=\"flex flex-col items-center text-center\">
          <div
            className=\"w-16 h-16 rounded-2xl flex items-center justify-center mb-3\"
            style={{ background: \"linear-gradient(180deg, #fff1e6, #ffd8c2)\" }}
          >
            <AlertTriangle size={30} style={{ color: \"#d97706\" }} />
          </div>
          <div className=\"text-[18px] font-extrabold\" style={{ color: \"var(--ink-900)\" }}>
            {problem?.title || \"Problem Detected\"}
          </div>
          <div className=\"text-[13px] font-medium mt-2\" style={{ color: \"var(--ink-500)\" }}>
            {problem?.description}
          </div>
          <span className={`pill ${problem?.severity === \"high\" ? \"danger\" : problem?.severity === \"medium\" ? \"warn\" : \"info\"} mt-3`}>
            {problem?.severity?.toUpperCase()} PRIORITY
          </span>
        </div>
      </section>

      <section className=\"soft-card p-4 mt-3 fade-in-2\" data-testid=\"solution-summary\">
        <div className=\"section-title mb-2\">Solution Summary</div>
        <ul className=\"space-y-2\">
          {result.solutions.map((s) => (
            <li key={s.id} className=\"flex items-start gap-2 text-[13px] font-semibold\" style={{ color: \"var(--ink-700)\" }}>
              <CheckCircle2 size={17} style={{ color: \"#22c55e\", flexShrink: 0, marginTop: 1 }} />
              <span>{s.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <button className=\"btn-primary w-full mt-5\" onClick={onSolutions} data-testid=\"tap-solutions\">
        TAP FOR SOLUTIONS
      </button>
    </>
  );
}

function Solutions({ result, onDone, onBack }) {
  return (
    <>
      <div className=\"flex items-center gap-2 mt-2\" data-testid=\"solutions-header\">
        <button className=\"w-9 h-9 rounded-full flex items-center justify-center\" style={{ background: \"#eaf2fc\", color: \"var(--blue-700)\" }} onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <div className=\"text-[15px] font-extrabold\" style={{ color: \"var(--ink-900)\" }}>Solutions</div>
      </div>

      <div className=\"mt-3 text-[14px] font-semibold\" style={{ color: \"var(--ink-700)\" }}>
        Here's how you can fix your {result.problems?.[0]?.title?.toLowerCase() || \"issue\"}.
      </div>

      <ul className=\"mt-4 space-y-3\">
        {result.solutions.map((s) => (
          <li key={s.id} className=\"soft-card p-4 flex items-center gap-3\" data-testid={`solution-${s.id}`}>
            <div className=\"icon-circle\" style={{ background: \"linear-gradient(180deg, #e7f7ee, #c8f0d5)\", color: \"#15803d\" }}>
              <CheckCircle2 size={18} />
            </div>
            <div className=\"flex-1\">
              <div className=\"text-[14px] font-extrabold\" style={{ color: \"var(--ink-900)\" }}>{s.title}</div>
              <div className=\"text-[12px] font-medium mt-0.5\" style={{ color: \"var(--ink-500)\" }}>{s.description}</div>
            </div>
            <ChevronRight size={16} style={{ color: \"var(--ink-400)\" }} />
          </li>
        ))}
      </ul>

      <button className=\"btn-primary w-full mt-6\" onClick={onDone} data-testid=\"solutions-done\">
        DONE
      </button>
    </>
  );
}
"
