import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Inbox } from "lucide-react";

interface BalanceChartProps {
  data?: { day: string; value: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="bg-foreground/90 backdrop-blur-md text-background px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium">
      <span className="text-muted/70">{label}</span>
      <span className="ml-2">
        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)}
      </span>
    </div>
  );
};

export default function BalanceChart({ data }: BalanceChartProps) {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const chartData = data || days.map(d => ({ day: d, value: 0 }));
  const hasData = chartData.some(d => d.value !== 0);

  if (!hasData) {
    return (
      <div className="h-[140px] w-full flex flex-col items-center justify-center">
        <Inbox className="h-6 w-6 text-muted-foreground/30 mb-1" />
        <p className="text-[11px] text-muted-foreground">Sem movimentação recente</p>
      </div>
    );
  }

  return (
    <div className="h-[140px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
              <stop offset="40%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.3} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 500 }} dy={6} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#areaFill)" dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 5, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }} animationDuration={800} animationEasing="ease-out" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
