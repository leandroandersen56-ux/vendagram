import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const data = [
  { day: "Seg", value: 315 },
  { day: "Ter", value: 0 },
  { day: "Qua", value: 135 },
  { day: "Qui", value: -500 },
  { day: "Sex", value: 720 },
  { day: "Sáb", value: 0 },
  { day: "Dom", value: 200 },
];

export default function BalanceChart() {
  return (
    <div className="h-[120px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={20}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: 12,
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number) =>
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
            }
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.value > 0 ? "#FFD700" : entry.value < 0 ? "hsl(var(--destructive))" : "hsl(var(--muted))"}
                opacity={entry.value === 0 ? 0.3 : 0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
