import { LucideIcon, ArrowUpRight } from "lucide-react";

export default function MetricCard({ label, value, unit, icon: Icon, trend, accent = "" }: {
  label: string; value: string; unit?: string; icon: LucideIcon; trend?: string; accent?: string;
}) {
  return <div className={`metric-card ${accent}`}>
    <div className="metric-top"><span>{label}</span><div className="metric-icon"><Icon size={18}/></div></div>
    <div className="metric-value">{value}<em>{unit}</em></div>
    {trend && <div className="trend"><ArrowUpRight size={13}/> {trend}</div>}
  </div>;
}