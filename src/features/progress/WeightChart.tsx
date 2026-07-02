import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import dayjs from 'dayjs';

interface WeightChartProps {
  data: { date: string; weight: number }[];
}

export function WeightChart({ data }: WeightChartProps) {
  if (data.length === 0) {
    return <p className="text-muted text-sm text-center py-8">Log weight to see trends</p>;
  }

  const chartData = data.map((d) => ({
    date: dayjs(d.date).format('M/D'),
    weight: d.weight,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8A94A3' }} />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10, fill: '#8A94A3' }} width={40} />
        <Tooltip
          formatter={(value) => [`${value} kg`, 'Weight']}
          contentStyle={{ background: '#1C242E', border: 'none', borderRadius: 8 }}
        />
        <Line type="monotone" dataKey="weight" stroke="#4ADE80" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}