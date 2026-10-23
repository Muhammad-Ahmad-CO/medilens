import { LogoMark } from "@/components/icons";

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
      <div style={{ display: "flex", justifyContent: "center" }}>
        <LogoMark size={56} />
      </div>
      <h1 style={{ fontSize: "3rem", margin: "1.2rem 0 0.6rem" }}>404</h1>
      <p className="muted" style={{ fontSize: "1.08rem", lineHeight: 1.65, margin: 0 }}>
        This page wasn&apos;t found in our database — unlike your medicines,
        which MediLens <em>can</em> verify.
      </p>
      <a className="btn" href="/" style={{ marginTop: "1.6rem" }}>
        Back to home
      </a>
    </div>
  );
}
