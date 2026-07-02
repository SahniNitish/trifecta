import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryDonutProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#4ADE80', '#F87171', '#FBBF24', '#8A94A3', '#60A5FA', '#A78BFA', '#F472B6'];

export function CategoryDonut({ data }: CategoryDonutProps) {
  if (data.length === 0) {
    return <p className="text-muted text-sm text-center py-8">No spending this month</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          dataKey="value"
          nameKey="name"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`$${Number(value ?? 0).toFixed(0)}`, '']}
          contentStyle={{ background: '#1C242E', border: 'none', borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}