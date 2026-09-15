import { ArrowDown, Globe2, Network, Server, Zap } from "lucide-react";

export default function Architecture({ workers }: { workers: {id:string,status:"online"|"offline",dc:string}[] }) {
  return <section className="panel architecture">
    <div className="panel-head"><div><h2>Live Architecture</h2><p>Requests flow through the load balancer to independent Snowflake workers.</p></div><div className="live-pill"><span/> LIVE</div></div>
    <div className="arch-flow">
      <Node icon={<Globe2/>} title="CLIENT" sub="HTTP / REST"/>
      <ArrowDown className="arch-arrow"/>
      <Node icon={<Network/>} title="NGINX" sub="LOAD BALANCER" main/>
      <div className="worker-lines">{workers.map(w => <div className="worker-line" key={w.id}><span/></div>)}</div>
      <div className="worker-row">{workers.map(w =>
        <div className={`worker-node ${w.status}`} key={w.id}>
          <div className="worker-icon"><Server size={21}/><span/></div>
          <b>{w.id}</b><small>{w.dc} • {w.status === "online" ? "HEALTHY" : "OFFLINE"}</small>
          <div className="worker-chip"><Zap size={11}/> Snowflake</div>
        </div>
      )}</div>
    </div>
  </section>;
}
function Node({icon,title,sub,main=false}:{icon:React.ReactNode,title:string,sub:string,main?:boolean}) {
 return <div className={`arch-node ${main ? "main" : ""}`}><div>{icon}</div><b>{title}</b><small>{sub}</small></div>
}