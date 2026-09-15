import { Activity, Copy, Gauge, Hash, Server, ShieldCheck, Sparkles, Zap } from "lucide-react";
import MetricCard from "../components/MetricCard";
import Architecture from "../components/Architecture";
import { GeneratedId, SystemStatus } from "../services/api";

export default function Overview({status,lastId,workers,onGenerate,setPage}:{status:SystemStatus,lastId:GeneratedId|null,workers:any[],onGenerate:()=>void,setPage:(p:any)=>void}) {
 return <div className="page">
   <div className="page-title"><div><div className="eyebrow">DISTRIBUTED SYSTEM • CHAPTER 7</div><h1>Control Center</h1><p>Observe, generate and understand globally unique IDs in real time.</p></div><button className="primary-btn" onClick={onGenerate}><Sparkles size={17}/> Generate ID</button></div>
   <div className="metrics-grid">
    <MetricCard label="Active Workers" value={String(status.activeServers)} icon={Server} trend="+1 this session"/>
    <MetricCard label="Requests / sec" value={status.requestsPerSecond.toLocaleString()} icon={Activity} trend="+12.4% vs last min" accent="cyan"/>
    <MetricCard label="IDs Generated" value={status.idsGenerated.toLocaleString()} icon={Hash} trend="Live counter"/>
    <MetricCard label="Duplicate IDs" value={String(status.duplicateIds)} icon={ShieldCheck} trend="Zero collisions" accent="success"/>
    <MetricCard label="Avg Latency" value={status.avgLatencyMs.toFixed(1)} unit=" ms" icon={Gauge} trend="-0.8 ms"/>
    <MetricCard label="Peak Throughput" value={status.peakThroughput.toLocaleString()} unit=" /s" icon={Zap} trend="Session peak"/>
   </div>
   <Architecture workers={workers}/>
   <div className="two-col">
     <section className="panel recent"><div className="panel-head"><div><h2>Latest Generated ID</h2><p>Most recent response from the generator.</p></div><button className="text-btn" onClick={()=>setPage("generate")}>Open explorer →</button></div>
       {lastId ? <div className="recent-id"><div><span>GENERATED ID</span><strong>{lastId.id}</strong></div><div className="tag"><span>WORKER</span><b>G-{String(lastId.workerId).padStart(3,"0")}</b></div><div className="tag"><span>SEQUENCE</span><b>{lastId.sequence}</b></div></div> : <div className="empty">No IDs yet. Hit <b>Generate ID</b> to start the stream.</div>}
     </section>
     <section className="panel philosophy"><div className="panel-head"><div><h2>Why Snowflake?</h2><p>The design keeps generation decentralized.</p></div></div>
       <div className="principles"><div><b>01</b><span>Unique</span><small>Worker identity prevents collisions across nodes.</small></div><div><b>02</b><span>Ordered</span><small>Timestamp keeps IDs time-sortable.</small></div><div><b>03</b><span>Scalable</span><small>Sequence bits support high throughput.</small></div></div>
     </section>
   </div>
 </div>;
}