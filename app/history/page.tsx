"use client";
/**
 * Scan history — verdict pills, filters and confidence bars from Supabase,
 * with friendly empty + unavailable states.
 */
import { useEffect, useMemo, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { Camera, CloudOff, SearchX } from "@/components/icons";

interface ScanRow {
  id: string;
  created_at: string;
  drug_name: string | null;
  verdict: string;
  confidence: number | null;
}

type Filter = "all" | "green" | "amber" | "red";

const PILL_LABEL: Record<string, string> = {
  green: "Genuine",
  amber: "Attention",
  red: "High risk",
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
      <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "2rem" }}>
        <div className="page-head" style={{ paddingTop: 0 }}>
          <span className="eyebrow">Your record</span>
          <h2>Scan history</h2>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" />
        ))}
      </div>
    );

  if (state === "unconfigured")
    return (
      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "2rem", maxWidth: 640 }}>
        <div className="empty-state">
          <div className="es-ico">
            <CloudOff size={28} />
          </div>
          <h2>History is unavailable right now</h2>
          <p>
            Your scan history could not be loaded. Scanning still works
            normally — verdicts are checked live on the scan page.
          </p>
          <a className="btn" href="/scan" style={{ marginTop: "1.2rem" }}>
            <Camera size={17} /> Scan anyway
          </a>
        </div>
      </div>
    );

  if (state === "empty")
    return (
      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "2rem", maxWidth: 640 }}>
        <div className="empty-state">
          <div className="es-ico">
            <SearchX size={28} />
          </div>
          <h2>No scans yet</h2>
          <p>
            Your verified medicines will appear here with their verdicts.
          </p>
          <a className="btn" href="/scan" style={{ marginTop: "1.2rem" }}>
            <Camera size={17} /> Scan your first medicine
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
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "2rem" }}>
      <div className="page-head" style={{ paddingTop: 0 }}>
        <span className="eyebrow">Your record</span>
        <h2>Scan history</h2>
      </div>

      <div className="filter-row" style={{ marginTop: "1.4rem" }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={filter === f.id ? "btn" : "btn btn-secondary"}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p className="muted" style={{ margin: 0 }}>
            No scans with this verdict yet.
          </p>
        </div>
      ) : (
        <div className="hist-list">
          {filtered.map((r) => {
            const level = PILL_LABEL[r.verdict] ? r.verdict : "amber";
            return (
              <div key={r.id} className="hist-row">
                <span className={`pill-v ${level}`}>
                  <i aria-hidden /> {PILL_LABEL[level]}
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
                  <div className="hist-conf">
                    <div className="small muted">
                      {Math.round(r.confidence * 100)}%
                    </div>
                    <div className="track">
                      <div
                        className="fill"
                        style={{ width: `${Math.round(r.confidence * 100)}%` }}
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
