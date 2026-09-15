import { Clock3, Hash, Layers3 } from "lucide-react";

export default function IdBreakdown({ data }: { data: {id:string, workerId:number, timestamp:number, sequence:number} | null }) {
  if (!data) return <div className="empty-breakdown">Generate an ID to inspect its Snowflake components.</div>;
  return <div className="breakdown">
    <div className="id-hero">{data.id}</div>
    <div className="bit-label">SNOWFLAKE COMPONENTS</div>
    <div className="parts">
      <div><Clock3/><small>Timestamp</small><b>{data.timestamp}</b><span>41 bits</span></div>
      <div><Layers3/><small>Worker ID</small><b>{String(data.workerId).padStart(3,"0")}</b><span>10 bits*</span></div>
      <div><Hash/><small>Sequence</small><b>{String(data.sequence).padStart(4,"0")}</b><span>12 bits</span></div>
    </div>
    <p className="footnote">* This dashboard groups the datacenter + machine identity as a worker ID.</p>
  </div>;
}