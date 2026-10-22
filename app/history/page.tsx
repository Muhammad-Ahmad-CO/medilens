"use client";
/**
 * Scan history — premium redesign: verdict pills, filters, confidence bars,
 * beautiful empty + unconfigured states.
 */
import { useEffect, useMemo, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

interface ScanRow {
  id: string;
  created_at: string;
  drug_name: string | null;
  verdict: string;
  confidence: number | null;
}

type Filter = "all" | "green" | "amber" | "red";

const PILL: Record<string, { emoji: string; label: string; style: React.CSSProperties }> = {
  green: {
    emoji: "🟢",
    label: "Genuine",
    style: { background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.4)", color: "#6ee7b7" },
  },
  amber: {
    emoji: "🟡",
    label: "Attention",
    style: { background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.4)", color: "#fcd34d" },
  },
  red: {
    emoji: "🔴",
    label: "High risk",
    style: { background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.4)", color: "#fca5a5" },
  },
};

export default function HistoryPage() {
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [state, setState] = useState<"loading" | "ready" | "unconfigured" | "empty">("loading");

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState("unconfigured");
      return;
    }
    (async () => {
      try {
        const { data, error } = await getSupabase()
          .from("scans")
          .select("id,created_at,drug_name,verdict,confidence")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) setState("unconfigured");
        else if (!data || data.length === 0) setState("empty");
        else {
          setRows(data as ScanRow[]);
          setState("ready");
        }
      } catch {
        setState("unconfigured");
      }
    })();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.verdict === filter)),
    [rows, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { green: 0, amber: 0, red: 0 };
    rows.forEach((r) => {
      if (c[r.verdict] !== undefined) c[r.verdict]++;
    });
    return c;
  }, [rows]);

  if (state === "loading")
    return (
      <div className="container" style={{ paddingTop: "2.5rem" }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Scan history</h2>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 64,
                borderRadius: 12,
                marginBottom: 10,
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
              }}
            />
          ))}
          <style>{`@keyframes shimmer { to { background-position: -200% 0; } }`}</style>
        </div>
      </div>
    );

  if (state === "unconfigured")
    return (
      <div className="container" style={{ paddingTop: "2.5rem", maxWidth: 640 }}>
        <div className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{ fontSize: "3rem" }}>☁️</div>
          <h2>Cloud history not connected</h2>
          <p className="muted" style={{ lineHeight: 1.65 }}>
            Copy <code>.env.example</code> to <code>.env.local</code>, add your
            free Supabase URL + anon key, run{" "}
            <code>supabase/schema.sql</code> once in the Supabase SQL editor,
            and restart the dev server.
          </p>
          <a className="btn" href="/scan" style={{ marginTop: "1rem" }}>
            Scan anyway
          </a>
        </div>
      </div>
    );

  if (state === "empty")
    return (
      <div className="container" style={{ paddingTop: "2.5rem", maxWidth: 640 }}>
        <div className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{ fontSize: "3rem" }}>🔍</div>
          <h2>No scans yet</h2>
          <p className="muted">
            Your verified medicines will appear here with their verdicts.
          </p>
          <a className="btn" href="/scan" style={{ marginTop: "1rem" }}>
            📷 Scan your first medicine
          </a>
        </div>
      </div>
    );

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: `All (${rows.length})` },
    { id: "green", label: `Genuine (${counts.green})` },
    { id: "amber", label: `Attention (${counts.amber})` },
    { id: "red", label: `High risk (${counts.red})` },
  ];

  return (
    <div className="container" style={{ paddingTop: "2.5rem" }}>
      <span className="eyebrow">Your record</span>
      <h2 style={{ margin: "0.5rem 0 1.4rem", letterSpacing: "-0.02em", fontSize: "2rem" }}>
        Scan history
      </h2>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={filter === f.id ? "btn" : "btn btn-secondary"}
            style={{ padding: "0.55rem 1.1rem", fontSize: "0.9rem" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p className="muted">No scans with this verdict yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.7rem" }}>
          {filtered.map((r) => {
            const pill = PILL[r.verdict] ?? PILL.amber;
            return (
              <div
                key={r.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.2rem",
                  marginBottom: 0,
                }}
              >
                <span
                  style={{
                    ...pill.style,
                    borderRadius: 999,
                    padding: "0.35rem 0.85rem",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {pill.emoji} {pill.label}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: "1.02rem" }}>
                    {r.drug_name ?? "Unknown drug"}
                  </b>
                  <span className="muted small">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
                {r.confidence != null && (
                  <div style={{ textAlign: "right", minWidth: 90 }}>
                    <div className="small muted">
                      {Math.round(r.confidence * 100)}%
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 99,
                        background: "rgba(255,255,255,0.08)",
                        marginTop: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.round(r.confidence * 100)}%`,
                          background:
                            "linear-gradient(90deg, var(--brand), var(--emerald))",
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
