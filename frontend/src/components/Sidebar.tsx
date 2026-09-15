import { Activity, BarChart3, Boxes, Cpu, Fingerprint, GitCompare, LayoutDashboard, Server, Settings, ShieldCheck } from "lucide-react";

type Page = "overview" | "generate" | "workers" | "analytics" | "algorithms";

export default function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const items = [
    ["overview", "Overview", LayoutDashboard],
    ["generate", "Generate ID", Fingerprint],
    ["workers", "Workers", Server],
    ["analytics", "Analytics", BarChart3],
    ["algorithms", "Algorithms", GitCompare],
  ] as const;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><SnowflakeIcon /></div>
        <div><b>SNOW<span>GRID</span></b><small>Distributed ID Infrastructure</small></div>
      </div>
      <div className="nav-label">CONTROL CENTER</div>
      <nav>
        {items.map(([id, label, Icon]) => (
          <button key={id} className={`nav-item ${page === id ? "active" : ""}`} onClick={() => setPage(id)}>
            <Icon size={18}/><span>{label}</span>
            {id === "generate" && <i className="live-dot" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="mini-status"><ShieldCheck size={17}/><div><b>System Secure</b><small>All nodes responding</small></div></div>
        <button className="nav-item"><Settings size={18}/><span>Configuration</span></button>
        <div className="version"><Cpu size={13}/> v1.0.0 • Snowflake Engine</div>
      </div>
    </aside>
  );
}

function SnowflakeIcon() {
  return <svg viewBox="0 0 32 32" className="snow-icon"><path d="M16 2v28M4 9l24 14M4 23L28 9M9 4l14 24M23 4 9 28M2 16h28" /></svg>;
}