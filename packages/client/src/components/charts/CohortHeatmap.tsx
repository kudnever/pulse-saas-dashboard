import { useMemo } from "react";

const COHORT_MONTHS = 12;
const RETENTION_MONTHS = 12;

// Seeded pseudo-random for deterministic demo data
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateCohortData() {
  const now = new Date();
  const cohorts: { label: string; retention: (number | null)[] }[] = [];

  for (let c = COHORT_MONTHS - 1; c >= 0; c--) {
    const d = new Date(now.getFullYear(), now.getMonth() - c, 1);
    const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    const seed = d.getFullYear() * 100 + d.getMonth();

    // Base SaaS retention curve with per-cohort noise
    const base = [100, 78, 68, 61, 56, 52, 49, 47, 45, 44, 43, 42];
    const noise = seededRand(seed) * 8 - 4; // ±4% cohort variation
    const stepNoise = (i: number) => seededRand(seed + i * 7) * 4 - 2;

    const retention: (number | null)[] = base.map((v, i) => {
      if (i > c) return null; // future months not yet reached
      const val = Math.round(Math.max(0, Math.min(100, v + noise + stepNoise(i))));
      return val;
    });

    cohorts.push({ label, retention });
  }

  return cohorts;
}

function retentionToColor(pct: number): string {
  if (pct >= 85) return "rgba(99,102,241,0.85)";
  if (pct >= 70) return "rgba(99,102,241,0.65)";
  if (pct >= 55) return "rgba(139,92,246,0.50)";
  if (pct >= 40) return "rgba(139,92,246,0.30)";
  if (pct >= 25) return "rgba(139,92,246,0.18)";
  return "rgba(139,92,246,0.08)";
}

export function CohortHeatmap() {
  const cohorts = useMemo(() => generateCohortData(), []);
  const monthHeaders = Array.from({ length: RETENTION_MONTHS }, (_, i) =>
    i === 0 ? "M0" : `M${i}`
  );

  return (
    <div className="card p-5">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          Retention Cohort Analysis
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          % of users still active N months after signup
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[560px]">
          <thead>
            <tr>
              <th className="text-left pb-2 pr-3 text-slate-500 font-medium w-16">Cohort</th>
              <th className="text-left pb-2 pr-3 text-slate-500 font-medium w-16 tabular-nums">Users</th>
              {monthHeaders.map((h) => (
                <th key={h} className="pb-2 px-1 text-slate-500 font-medium text-center w-10">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort, ci) => {
              // Generate a plausible cohort size (newer cohorts slightly larger = growth)
              const baseSize = 180 + ci * 12;
              const sizeNoise = Math.round(seededRand(ci * 31 + 7) * 60 - 30);
              const cohortSize = baseSize + sizeNoise;

              return (
                <tr key={cohort.label} className="group">
                  <td className="py-0.5 pr-3 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                    {cohort.label}
                  </td>
                  <td className="py-0.5 pr-3 text-slate-500 tabular-nums text-right">{cohortSize}</td>
                  {cohort.retention.map((pct, mi) => (
                    <td key={mi} className="py-0.5 px-0.5 text-center">
                      {pct !== null ? (
                        <div
                          className="rounded mx-auto flex items-center justify-center font-semibold transition-transform hover:scale-105 cursor-default"
                          style={{
                            background: retentionToColor(pct),
                            width: 34,
                            height: 22,
                            color: pct >= 55 ? "rgba(255,255,255,0.9)" : "rgba(148,163,184,0.8)",
                          }}
                          title={`${cohort.label} — Month ${mi}: ${pct}%`}
                        >
                          {pct}%
                        </div>
                      ) : (
                        <div
                          className="rounded mx-auto"
                          style={{
                            width: 34,
                            height: 22,
                            background: "rgba(255,255,255,0.02)",
                          }}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Color scale legend */}
      <div className="flex items-center gap-2 mt-5 text-xs text-slate-500">
        <span>Low</span>
        <div className="flex gap-0.5">
          {[8, 18, 30, 50, 65, 85].map((pct) => (
            <div
              key={pct}
              className="w-5 h-3 rounded-sm"
              style={{ background: retentionToColor(pct) }}
            />
          ))}
        </div>
        <span>High retention</span>
      </div>
    </div>
  );
}
