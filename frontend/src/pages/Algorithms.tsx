import { Check, CircleAlert, Database, Fingerprint, Layers3, Timer, Zap } from "lucide-react";

const rows=[
 ["64-bit numeric","✓","✕","✓"],
 ["Distributed","✕","✓","✓"],
 ["Time ordered","✓","✕","✓"],
 ["Very high throughput","✕","✓","✓"],
 ["Central dependency","Database","None","None"],
 ["Collision model","None","Extremely unlikely","None*"]
];

export default function Algorithms(){return <div className="page"><div className="page-title"><div><div className="eyebrow">DESIGN COMPARISON</div><h1>Algorithm Lab</h1><p>Compare the three approaches implemented by the backend team.</p></div></div>
 <div className="algo-cards"><Algo icon={Database} name="DB Counter" tag="CENTRALIZED" text="Simple and strongly ordered, but a central database becomes the bottleneck."/><Algo icon={Fingerprint} name="UUID" tag="DECENTRALIZED" text="Easy to generate independently, but UUIDs do not fit the 64-bit, time-ordered target." featured/><Algo icon={Layers3} name="Snowflake" tag="RECOMMENDED" text="Combines timestamp, worker identity and sequence for distributed, sortable IDs."/></div>
 <section className="panel comparison"><div className="panel-head"><div><h2>Requirement Matrix</h2><p>Use this table while explaining why Snowflake is the final design.</p></div></div><table><thead><tr><th>Requirement</th><th>DB Counter</th><th>UUID</th><th className="highlight">Snowflake</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td className="highlight">{r[3]}</td></tr>)}</tbody></table><div className="table-note"><CircleAlert size={14}/> *Assumes correct worker identity and sequence handling. Clock rollback/overflow must be handled by the generator.</div></section>
 </div>}
function Algo({icon:Icon,name,tag,text,featured=false}:{icon:any,name:string,tag:string,text:string,featured?:boolean}){return <div className={`panel algo-card ${featured?"featured":""}`}><div className="algo-icon"><Icon/></div><span className="algo-tag">{tag}</span><h2>{name}</h2><p>{text}</p><div className="algo-footer"><Timer size={14}/> Benchmark with the same workload</div></div>}