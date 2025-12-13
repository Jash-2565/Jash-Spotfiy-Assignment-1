import React, { useMemo } from "react";

// -----------------------------
// Lightweight SVG charts (no Chart.js)
// -----------------------------

function SvgBarChart({ labels, values }: { labels: string[]; values: number[] }) {
  const max = Math.max(...values, 1);

  const height = 300;
  const width = 640;
  const padL = 80; // left gutter for rotated Y title + ticks
  const padR = 40; // right gutter so last bar/labels never clip
  const padT = 60; // top gutter for value labels above bars
  const padB = 58; // bottom gutter for X tick labels + title

  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const n = labels.length;
  const gap = 10;
  const barW = Math.max(10, (innerW - gap * (n - 1)) / n);

  // Keep Y-axis title readable while not stealing plot width.
  const axisLabelX = padL / 2 - 6;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" overflow="hidden">
      {/* Y-axis label */}
      <g>
        <rect x={0} y={0} width={padL} height={height} fill="transparent" />
        <text
          x={axisLabelX}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(-90 ${axisLabelX} ${height / 2})`}
          fontSize={14}
          fontWeight={600}
          fill="rgba(255,255,255,0.9)"
        >
          Listening Hours
        </text>
      </g>

      {/* background grid + Y ticks */}
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = padT + innerH * (1 - t);
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="rgba(255,255,255,0.08)" />
            <text x={padL - 8} y={y + 4} textAnchor="end" fontSize={11} fill="rgba(255,255,255,0.55)">
              {Math.round(max * t)}
            </text>
          </g>
        );
      })}

      {/* bars */}
      {values.map((v, i) => {
        const x = padL + i * (barW + gap);
        const h = (v / max) * innerH;
        const y = padT + (innerH - h);

        // Always place label ABOVE the bar.
        const labelY = Math.max(14, y - 10);

        return (
          <g key={`${labels[i]}-${i}`}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={10}
              ry={10}
              fill="rgba(29, 185, 84, 0.55)"
              stroke="rgba(29, 185, 84, 0.9)"
              strokeWidth={1}
            />

            {/* value label above each bar */}
            <text
              x={x + barW / 2}
              y={labelY}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill="rgba(255,255,255,0.92)"
            >
              {Math.round(v)}
            </text>

            {/* X tick labels (years) */}
            <text
              x={x + barW / 2}
              y={height - padB + 14}
              textAnchor="middle"
              fontSize={11}
              fill="rgba(255,255,255,0.65)"
            >
              {labels[i]}
            </text>
          </g>
        );
      })}

      {/* axis lines */}
      <line x1={padL} y1={padT} x2={padL} y2={height - padB} stroke="rgba(255,255,255,0.10)" />
      <line
        x1={padL}
        y1={height - padB}
        x2={width - padR}
        y2={height - padB}
        stroke="rgba(255,255,255,0.10)"
      />

      {/* X-axis title */}
      <text
        x={padL + innerW / 2}
        y={height - padB + 40}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fill="rgba(255,255,255,0.9)"
      >
        Years
      </text>
    </svg>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
}

function SvgPieChart({ labels, values }: { labels: string[]; values: number[] }) {
  const total = values.reduce((a, b) => a + b, 0) || 1;

  const size = 260;
  const cx = 130;
  const cy = 130;
  const r = 100;

  const fills = [
    "rgba(29, 185, 84, 0.80)",
    "rgba(29, 185, 84, 0.62)",
    "rgba(29, 185, 84, 0.48)",
    "rgba(29, 185, 84, 0.36)",
    "rgba(29, 185, 84, 0.28)",
  ];

  let angle = 0;
  const slices = values.map((v, i) => {
    const sweep = (v / total) * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return { i, v, start, end };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start print:items-start">

      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-[260px]">
        <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
        {slices.map((s) => (
          <path
            key={`${labels[s.i]}-${s.i}`}
            d={describeArc(cx, cy, r, s.start, s.end)}
            fill={fills[s.i % fills.length]}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        ))}
        <circle cx={cx} cy={cy} r={58} fill="#121212" stroke="rgba(255,255,255,0.08)" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={12} fill="rgba(255,255,255,0.60)">
          Total Hours
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize={18} fontWeight={700} fill="rgba(255,255,255,0.92)">
          {Math.round(total)}
        </text>
      </svg>

      {/* Legend: normal color dots (match slice colors) */}
      <div className="space-y-2">
        {labels.map((name, i) => {
          const v = values[i];
          const pct = (v / total) * 100;
          return (
            <div
              key={`${name}-${i}`}
              className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2"
            >
              <div className="flex items-start gap-2 min-w-0">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: fills[i % fills.length] }} />
                <span className="text-sm text-white/80 break-words leading-snug">{name}</span>
              </div>
              <div className="text-sm text-white/70 tabular-nums whitespace-nowrap">
                {Math.round(v)} <span className="text-white/45">({Math.round(pct)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------
// Data
// -----------------------------

type HeatPoint = { day: string; hour: number; v: number };

type AnalyticsData = {
  yearlyData: { labels: string[]; values: number[] };
  top5Data: { labels: string[]; values: number[] };
  heatmapData: { data: HeatPoint[]; max_hours: number; day_names: string[] };
};

const ANALYTICS_DATA: AnalyticsData = (() => {
  return {
    yearlyData: {
      labels: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      values: [126.97, 586.63, 560.69, 784.13, 773.77, 798.86, 938.3],
    },
    top5Data: {
      labels: ["Post Malone", "The Weeknd", "Ed Sheeran", "5 Seconds of Summer", "Coldplay"],
      values: [329.74, 263.43, 261.96, 135.37, 135.14],
    },
    heatmapData: {
      data: [
        { day: "Monday", hour: 0, v: 3.19 },
        { day: "Tuesday", hour: 0, v: 1.39 },
        { day: "Wednesday", hour: 0, v: 2.35 },
        { day: "Thursday", hour: 0, v: 0.55 },
        { day: "Friday", hour: 0, v: 3.51 },
        { day: "Saturday", hour: 0, v: 1.8 },
        { day: "Sunday", hour: 0, v: 0.05 },

        { day: "Monday", hour: 1, v: 15.03 },
        { day: "Tuesday", hour: 1, v: 8.65 },
        { day: "Wednesday", hour: 1, v: 10.61 },
        { day: "Thursday", hour: 1, v: 8.82 },
        { day: "Friday", hour: 1, v: 14.96 },
        { day: "Saturday", hour: 1, v: 8.45 },
        { day: "Sunday", hour: 1, v: 1.46 },

        { day: "Monday", hour: 2, v: 8.0 },
        { day: "Tuesday", hour: 2, v: 8.88 },
        { day: "Wednesday", hour: 2, v: 9.46 },
        { day: "Thursday", hour: 2, v: 9.31 },
        { day: "Friday", hour: 2, v: 11.09 },
        { day: "Saturday", hour: 2, v: 15.3 },
        { day: "Sunday", hour: 2, v: 6.5 },

        { day: "Monday", hour: 3, v: 23.36 },
        { day: "Tuesday", hour: 3, v: 20.23 },
        { day: "Wednesday", hour: 3, v: 21.78 },
        { day: "Thursday", hour: 3, v: 19.56 },
        { day: "Friday", hour: 3, v: 19.3 },
        { day: "Saturday", hour: 3, v: 23.02 },
        { day: "Sunday", hour: 3, v: 20.89 },

        { day: "Monday", hour: 4, v: 33.2 },
        { day: "Tuesday", hour: 4, v: 37.67 },
        { day: "Wednesday", hour: 4, v: 29.59 },
        { day: "Thursday", hour: 4, v: 36.07 },
        { day: "Friday", hour: 4, v: 37.32 },
        { day: "Saturday", hour: 4, v: 42.03 },
        { day: "Sunday", hour: 4, v: 31.05 },

        { day: "Monday", hour: 5, v: 36.39 },
        { day: "Tuesday", hour: 5, v: 40.63 },
        { day: "Wednesday", hour: 5, v: 54.13 },
        { day: "Thursday", hour: 5, v: 41.4 },
        { day: "Friday", hour: 5, v: 40.79 },
        { day: "Saturday", hour: 5, v: 43.22 },
        { day: "Sunday", hour: 5, v: 37.4 },

        { day: "Monday", hour: 6, v: 41.31 },
        { day: "Tuesday", hour: 6, v: 38.89 },
        { day: "Wednesday", hour: 6, v: 46.86 },
        { day: "Thursday", hour: 6, v: 42.91 },
        { day: "Friday", hour: 6, v: 46.43 },
        { day: "Saturday", hour: 6, v: 53.09 },
        { day: "Sunday", hour: 6, v: 30.29 },

        { day: "Monday", hour: 7, v: 42.85 },
        { day: "Tuesday", hour: 7, v: 43.76 },
        { day: "Wednesday", hour: 7, v: 46.23 },
        { day: "Thursday", hour: 7, v: 37.07 },
        { day: "Friday", hour: 7, v: 40.19 },
        { day: "Saturday", hour: 7, v: 53.56 },
        { day: "Sunday", hour: 7, v: 40.49 },

        { day: "Monday", hour: 8, v: 43.76 },
        { day: "Tuesday", hour: 8, v: 45.15 },
        { day: "Wednesday", hour: 8, v: 38.57 },
        { day: "Thursday", hour: 8, v: 41.5 },
        { day: "Friday", hour: 8, v: 42.98 },
        { day: "Saturday", hour: 8, v: 45.84 },
        { day: "Sunday", hour: 8, v: 43.46 },

        { day: "Monday", hour: 9, v: 35.4 },
        { day: "Tuesday", hour: 9, v: 27.1 },
        { day: "Wednesday", hour: 9, v: 34.59 },
        { day: "Thursday", hour: 9, v: 31.32 },
        { day: "Friday", hour: 9, v: 40.11 },
        { day: "Saturday", hour: 9, v: 40.04 },
        { day: "Sunday", hour: 9, v: 37.28 },

        { day: "Monday", hour: 10, v: 44.22 },
        { day: "Tuesday", hour: 10, v: 37.6 },
        { day: "Wednesday", hour: 10, v: 42.65 },
        { day: "Thursday", hour: 10, v: 44.84 },
        { day: "Friday", hour: 10, v: 42.79 },
        { day: "Saturday", hour: 10, v: 49.42 },
        { day: "Sunday", hour: 10, v: 46.61 },

        { day: "Monday", hour: 11, v: 43.54 },
        { day: "Tuesday", hour: 11, v: 38.94 },
        { day: "Wednesday", hour: 11, v: 37.22 },
        { day: "Thursday", hour: 11, v: 39.53 },
        { day: "Friday", hour: 11, v: 38.09 },
        { day: "Saturday", hour: 11, v: 38.24 },
        { day: "Sunday", hour: 11, v: 41.68 },

        { day: "Monday", hour: 12, v: 44.3 },
        { day: "Tuesday", hour: 12, v: 40.18 },
        { day: "Wednesday", hour: 12, v: 45.92 },
        { day: "Thursday", hour: 12, v: 40.1 },
        { day: "Friday", hour: 12, v: 47.09 },
        { day: "Saturday", hour: 12, v: 41.97 },
        { day: "Sunday", hour: 12, v: 40.43 },

        { day: "Monday", hour: 13, v: 49.62 },
        { day: "Tuesday", hour: 13, v: 51.07 },
        { day: "Wednesday", hour: 13, v: 55.1 },
        { day: "Thursday", hour: 13, v: 49.02 },
        { day: "Friday", hour: 13, v: 57.07 },
        { day: "Saturday", hour: 13, v: 41.03 },
        { day: "Sunday", hour: 13, v: 32.63 },

        { day: "Monday", hour: 14, v: 45.67 },
        { day: "Tuesday", hour: 14, v: 45.57 },
        { day: "Wednesday", hour: 14, v: 41.52 },
        { day: "Thursday", hour: 14, v: 50.4 },
        { day: "Friday", hour: 14, v: 47.31 },
        { day: "Saturday", hour: 14, v: 34.31 },
        { day: "Sunday", hour: 14, v: 27.19 },

        { day: "Monday", hour: 15, v: 34.84 },
        { day: "Tuesday", hour: 15, v: 38.3 },
        { day: "Wednesday", hour: 15, v: 34.64 },
        { day: "Thursday", hour: 15, v: 40.24 },
        { day: "Friday", hour: 15, v: 36.03 },
        { day: "Saturday", hour: 15, v: 29.41 },
        { day: "Sunday", hour: 15, v: 35.0 },

        { day: "Monday", hour: 16, v: 39.73 },
        { day: "Tuesday", hour: 16, v: 32.49 },
        { day: "Wednesday", hour: 16, v: 41.1 },
        { day: "Thursday", hour: 16, v: 34.32 },
        { day: "Friday", hour: 16, v: 32.59 },
        { day: "Saturday", hour: 16, v: 37.37 },
        { day: "Sunday", hour: 16, v: 28.76 },

        { day: "Monday", hour: 17, v: 28.45 },
        { day: "Tuesday", hour: 17, v: 32.29 },
        { day: "Wednesday", hour: 17, v: 35.18 },
        { day: "Thursday", hour: 17, v: 29.32 },
        { day: "Friday", hour: 17, v: 25.46 },
        { day: "Saturday", hour: 17, v: 32.81 },
        { day: "Sunday", hour: 17, v: 28.39 },

        { day: "Monday", hour: 18, v: 22.28 },
        { day: "Tuesday", hour: 18, v: 21.61 },
        { day: "Wednesday", hour: 18, v: 29.6 },
        { day: "Thursday", hour: 18, v: 22.16 },
        { day: "Friday", hour: 18, v: 21.07 },
        { day: "Saturday", hour: 18, v: 20.31 },
        { day: "Sunday", hour: 18, v: 19.07 },

        { day: "Monday", hour: 19, v: 10.97 },
        { day: "Tuesday", hour: 19, v: 10.14 },
        { day: "Wednesday", hour: 19, v: 17.75 },
        { day: "Thursday", hour: 19, v: 18.15 },
        { day: "Friday", hour: 19, v: 16.09 },
        { day: "Saturday", hour: 19, v: 18.67 },
        { day: "Sunday", hour: 19, v: 9.62 },

        { day: "Monday", hour: 20, v: 6.29 },
        { day: "Tuesday", hour: 20, v: 6.16 },
        { day: "Wednesday", hour: 20, v: 9.3 },
        { day: "Thursday", hour: 20, v: 11.67 },
        { day: "Friday", hour: 20, v: 8.11 },
        { day: "Saturday", hour: 20, v: 11.32 },
        { day: "Sunday", hour: 20, v: 3.7 },

        { day: "Monday", hour: 21, v: 4.9 },
        { day: "Tuesday", hour: 21, v: 3.71 },
        { day: "Wednesday", hour: 21, v: 3.07 },
        { day: "Thursday", hour: 21, v: 4.31 },
        { day: "Friday", hour: 21, v: 3.1 },
        { day: "Saturday", hour: 21, v: 6.32 },
        { day: "Sunday", hour: 21, v: 2.97 },

        { day: "Monday", hour: 22, v: 0.93 },
        { day: "Tuesday", hour: 22, v: 2.49 },
        { day: "Wednesday", hour: 22, v: 0.55 },
        { day: "Thursday", hour: 22, v: 1.3 },
        { day: "Friday", hour: 22, v: 0.9 },
        { day: "Saturday", hour: 22, v: 2.9 },
        { day: "Sunday", hour: 22, v: 1.72 },

        { day: "Monday", hour: 23, v: 0.03 },
        { day: "Tuesday", hour: 23, v: 0.65 },
        { day: "Wednesday", hour: 23, v: 0.0 },
        { day: "Thursday", hour: 23, v: 1.87 },
        { day: "Friday", hour: 23, v: 0.12 },
        { day: "Saturday", hour: 23, v: 1.65 },
        { day: "Sunday", hour: 23, v: 2.84 },
      ],
      max_hours: 57.07,
      day_names: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
  };
})();

// -----------------------------
// UI bits
// -----------------------------

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-sm">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-semibold tracking-tight text-white">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="print-card rounded-3xl border border-white/10 bg-[#121212]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="text-base font-semibold text-white">{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Heatmap({
  data,
  dayNames,
  maxValue,
}: {
  data: HeatPoint[];
  dayNames: string[];
  maxValue: number;
}) {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const map = useMemo(() => {
    const m = new Map<string, number>();
    for (const item of data) m.set(`${item.day}-${item.hour}`, item.v);
    return m;
  }, [data]);

  const cellColor = (v: number) => {
    const t = maxValue > 0 ? Math.max(0, Math.min(1, v / maxValue)) : 0;
    const g = 185;
    const r = Math.round(29 + (80 - 29) * t);
    const b = Math.round(84 + (120 - 84) * t);
    const a = 0.10 + 0.75 * t;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-white">Listening intensity</div>
        <div className="text-xs text-white/60">0–{Math.round(maxValue)} (max)</div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="grid" style={{ gridTemplateColumns: `120px repeat(24, 1fr)` }}>
            <div />
            {hours.map((h) => (
              <div key={h} className="px-1 py-2 text-center text-[11px] text-white/50">
                {h}
              </div>
            ))}

            {dayNames.map((day) => (
              <React.Fragment key={day}>
                <div className="flex items-center pr-3 text-sm text-white/70">{day}</div>
                {hours.map((h) => {
                  const v = map.get(`${day}-${h}`) ?? 0;
                  return (
                    <div
                      key={`${day}-${h}`}
                      className="heat-cell group relative m-[2px] h-7 rounded-lg ring-1 ring-white/5"
                      style={{ backgroundColor: cellColor(v) }}
                      title={`${day} @ ${h}:00 — ${Math.round(v)}`}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition group-hover:opacity-100"
                        style={{
                          boxShadow:
                            "0 0 0 1px rgba(255,255,255,0.12), 0 8px 24px rgba(29,185,84,0.22)",
                        }}
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <div className="text-xs text-white/60">Less</div>
        <div className="flex items-center gap-1">
          {[0.1, 0.25, 0.4, 0.6, 0.85].map((t) => (
            <div
              key={t}
              className="h-3 w-6 rounded-md ring-1 ring-white/10"
              style={{
                backgroundColor: `rgba(${Math.round(29 + (80 - 29) * t)}, 185, ${Math.round(
                  84 + (120 - 84) * t
                )}, ${0.10 + 0.75 * t})`,
              }}
            />
          ))}
        </div>
        <div className="text-xs text-white/60">More</div>
      </div>
    </div>
  );
}

// -----------------------------
// "Test"-like checks (runtime assertions)
// -----------------------------

function validateData(d: AnalyticsData) {
  if (!d?.yearlyData?.labels?.length || !d?.yearlyData?.values?.length) return false;
  if (d.yearlyData.labels.length !== d.yearlyData.values.length) return false;
  if (!d?.top5Data?.labels?.length || !d?.top5Data?.values?.length) return false;
  if (d.top5Data.labels.length !== d.top5Data.values.length) return false;
  if (!Array.isArray(d?.heatmapData?.data)) return false;
  if (!Array.isArray(d?.heatmapData?.day_names)) return false;
  return true;
}

function runDevTests() {
  const d = ANALYTICS_DATA;
  if (!validateData(d)) return { ok: false, msg: "validateData failed" };

  const totalYears = d.yearlyData.values.reduce((a, b) => a + b, 0);
  if (!(totalYears > 0)) return { ok: false, msg: "yearly total must be > 0" };

  const totalTop5 = d.top5Data.values.reduce((a, b) => a + b, 0);
  if (!(totalTop5 > 0)) return { ok: false, msg: "top5 total must be > 0" };

  const maxHeat = Math.max(...d.heatmapData.data.map((x) => x.v));
  if (!(maxHeat >= 0)) return { ok: false, msg: "heatmap max must be >= 0" };

  // extra check: day_names should include the peak day
  const peak = d.heatmapData.data.reduce((best, it) => (it.v > best.v ? it : best), d.heatmapData.data[0]);
  if (!d.heatmapData.day_names.includes(peak.day)) return { ok: false, msg: "peak day missing from day_names" };

  return { ok: true };
}

// -----------------------------
// App
// -----------------------------

export default function App() {
  const { yearlyData, top5Data, heatmapData } = ANALYTICS_DATA;

  const ok = useMemo(() => validateData(ANALYTICS_DATA), []);
  const dev = useMemo(() => runDevTests(), []);

  const totalAcrossYears = useMemo(() => yearlyData.values.reduce((a, b) => a + b, 0), [yearlyData.values]);

  const bestYearIdx = useMemo(() => {
    let idx = 0;
    for (let i = 1; i < yearlyData.values.length; i++) {
      if (yearlyData.values[i] > yearlyData.values[idx]) idx = i;
    }
    return idx;
  }, [yearlyData.values]);

  const peakCell = useMemo(() => {
    let best = heatmapData.data[0];
    for (const it of heatmapData.data) {
      if (it.v > best.v) best = it;
    }
    return best;
  }, [heatmapData.data]);

  return (
    <div className="w-full bg-[#0b0b0b] text-white print-root">
      {/* Spotify-ish background */}
      <div className="pointer-events-none fixed inset-0 print-hide">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#1DB954]/18 blur-3xl" />
        <div className="absolute -bottom-48 right-[-120px] h-[560px] w-[560px] rounded-full bg-[#1DB954]/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0b] via-[#0b0b0b] to-[#050505]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-10 print-frame print-fit">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#1DB954]/20 ring-1 ring-[#1DB954]/30" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Jash&apos;s Spotify Listening Habits</h1>
              <div className="mt-1 text-sm text-white/60">Yearly trend • Top artists • Day &amp; hour heatmap</div>
              {!ok ? (
                <div className="mt-2 text-xs text-red-300">Data validation failed — check labels/values lengths.</div>
              ) : null}
              {dev.ok ? null : <div className="mt-2 text-xs text-amber-300">Dev tests: {dev.msg}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatPill label="Total (2019–2025)" value={`${Math.round(totalAcrossYears)} hrs`} />
            <StatPill
              label="Best year"
              value={`${yearlyData.labels[bestYearIdx]} (${Math.round(yearlyData.values[bestYearIdx])} hrs)`}
            />
            <StatPill
              label="Peak listening"
              value={`${peakCell.day} @ ${String(peakCell.hour).padStart(2, "0")}:00 (${Math.round(peakCell.v)} hrs)`}
            />
          </div>
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 print-grid">
          <Card title="Yearly listening trend">
            <div className="h-[320px] print-chart">
              <SvgBarChart labels={yearlyData.labels} values={yearlyData.values} />
            </div>
          </Card>

          <Card title="Top 5 artists">
            <div className="h-[320px] print-chart">
              <SvgPieChart labels={top5Data.labels} values={top5Data.values} />
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Card title="When you listen">
              <Heatmap data={heatmapData.data} dayNames={heatmapData.day_names} maxValue={heatmapData.max_hours} />
            </Card>
          </div>
        </div>

        <div className="mt-8 print:mt-3 text-xs text-white/45">Jash Bhatt.  230790.   Source Spotify Listening History (personal data export)</div>
      </div>
      {/* Print footer */}
        <div className="print-footer">
          Created by <strong>Jash Bhatt</strong>, 230790 • 
          Source: Spotify listening history (personal data export)
        </div>

    </div>
  );
}
