import { Bell, CircleHelp, Radio, Wifi } from "lucide-react";

export default function Topbar({ connected, mockMode }: { connected: boolean; mockMode: boolean }) {
  return (
    <header className="topbar">
      <div className="crumb"><Radio size={16}/> SYSTEM / <strong>CONTROL CENTER</strong></div>
      <div className="top-actions">
        <div className={`connection ${connected ? "ok" : "bad"}`}><span/> {mockMode ? "DEMO MODE" : connected ? "API CONNECTED" : "API OFFLINE"}</div>
        <button className="icon-btn"><Bell size={18}/><i/></button>
        <button className="icon-btn"><CircleHelp size={18}/></button>
      </div>
    </header>
  );
}