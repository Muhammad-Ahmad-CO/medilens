export default function NotFound() {
  return (
    <div
      className="container"
      style={{
        paddingTop: "5rem",
        paddingBottom: "5rem",
        textAlign: "center",
        maxWidth: 560,
      }}
    >
      <div style={{ fontSize: "4rem" }}>🔍</div>
      <h1 style={{ fontSize: "3rem", letterSpacing: "-0.03em", margin: "1rem 0" }}>
        404
      </h1>
      <p className="muted" style={{ fontSize: "1.1rem", lineHeight: 1.6 }}>
        This page wasn&apos;t found in our database — unlike your medicines,
        which MediLens <em>can</em> verify.
      </p>
      <a className="btn" href="/" style={{ marginTop: "1.5rem" }}>
        ← Back to home
      </a>
    </div>
  );
}
