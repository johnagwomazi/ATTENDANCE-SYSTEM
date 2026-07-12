import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAdminStore } from '../../store/adminStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const colors = ['#272A73', '#F58220', '#8FC6E8'];

const SummaryCard = ({ title, value }) => (
  <Card className="p-5">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="mt-2 text-3xl font-black text-text">{value}</p>
  </Card>
);

export default function Reports() {
  const { reports, fetchReports } = useAdminStore();
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const selected = reports[period]?.summary || reports.today?.summary || {};
  const chartData = useMemo(() => ([
    { name: 'Present', value: selected.presentCount || 0 },
    { name: 'Late', value: selected.lateCount || 0 },
    { name: 'Absent', value: selected.absentCount || 0 }
  ]), [selected]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Reports</p>
            <h1 className="mt-3 text-3xl font-black text-text">Attendance analytics</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {['today', 'weekly', 'monthly'].map((item) => (
              <Button key={item} variant={period === item ? 'primary' : 'secondary'} onClick={() => setPeriod(item)}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <SummaryCard title="Present" value={selected.presentCount || 0} />
        <SummaryCard title="Late" value={selected.lateCount || 0} />
        <SummaryCard title="Absent" value={selected.absentCount || 0} />
        <SummaryCard title="Attendance %" value={`${selected.attendancePercentage || 0}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-text">Attendance breakdown</h3>
            <Badge variant="primary">{period}</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-lg font-extrabold text-text">Trend view</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
