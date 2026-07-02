import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DailyBarChartProps {
  data: { day: string; amount: number }[];
}

export function DailyBarChart({ data }: DailyBarChartProps) {
  if (data.every((d) => d.amount === 0)) {
    return <p className="text-muted text-sm text-center py-8">No spending this month</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8A94A3' }} />
        <YAxis tick={{ fontSize: 10, fill: '#8A94A3' }} width={40} />
        <Tooltip
          formatter={(value) => [`$${Number(value ?? 0).toFixed(0)}`, 'Spent']}
          contentStyle={{ background: '#1C242E', border: 'none', borderRadius: 8 }}
        />
        <Bar dataKey="amount" fill="#4ADE80" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}