import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

const data = [
  { day: "Seg", value: 315 },
  { day: "Ter", value: 0 },
  { day: "Qua", value: 135 },
  { day: "Qui", value: -500 },
  { day: "Sex", value: 720 },
  { day: "Sáb", value: 0 },
  { day: "Dom", value: 200 },
];

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

export default function BalanceChart() {
  const maxVal = Math.max(...data.map(d => Math.abs(d.value)));

  return (
    <div className="h-[140px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={24} barGap={4} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="barPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="barNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="barZero" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
            strokeOpacity={0.4}
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 500 }}
            dy={6}
          />
          <YAxis hide domain={[-maxVal * 1.1, maxVal * 1.1]} />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="value" radius={[6, 6, 2, 2]} animationDuration={800} animationEasing="ease-out">
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.value > 0
                    ? "url(#barPositive)"
                    : entry.value < 0
                    ? "url(#barNegative)"
                    : "url(#barZero)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
