"import React from \"react\";

export default function HealthGauge({ value = 82, max = 100, size = 120, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(max, value));
  const pct = clamped / max;
  // 3/4 arc
  const arc = 0.78;
  const dash = c * arc;
  const progress = dash * pct;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} data-testid=\"health-gauge\">
      <defs>
        <linearGradient id=\"gaugeGrad\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">
          <stop offset=\"0%\" stopColor=\"#5fd0ff\" />
          <stop offset=\"60%\" stopColor=\"#1f86ff\" />
          <stop offset=\"100%\" stopColor=\"#0856bd\" />
        </linearGradient>
      </defs>
      <g transform={`rotate(135 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill=\"none\"
          stroke=\"#e0ecf9\"
          strokeWidth={stroke}
          strokeLinecap=\"round\"
          strokeDasharray={`${dash} ${c}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill=\"none\"
          stroke=\"url(#gaugeGrad)\"
          strokeWidth={stroke}
          strokeLinecap=\"round\"
          strokeDasharray={`${progress} ${c}`}
          style={{ transition: \"stroke-dasharray 900ms ease\" }}
        />
      </g>
      <text
        x=\"50%\"
        y=\"52%\"
        textAnchor=\"middle\"
        className=\"gauge-value\"
        style={{ fontSize: 30 }}
      >
        {Math.round(value)}
      </text>
      <text
        x=\"50%\"
        y=\"70%\"
        textAnchor=\"middle\"
        style={{ fontSize: 11, fill: \"var(--ink-500)\", fontWeight: 600 }}
      >
        {value}/{max}
      </text>
    </svg>
  );
}
"
