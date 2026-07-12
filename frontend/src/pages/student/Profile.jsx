import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange">Profile</p>
            <h1 className="mt-3 text-3xl font-black text-text">{user?.full_name || user?.fullName || 'Student Profile'}</h1>
            <p className="mt-2 text-sm text-slate-500">Your account and enrollment snapshot.</p>
          </div>
          <Badge variant="success">Active Account</Badge>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ['Email', user?.email || '-'],
            ['Phone', user?.phone || '-'],
            ['Role', user?.role || '-'],
            ['Account Status', user?.is_active ? 'Active' : 'Inactive']
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
              <p className="mt-2 text-sm font-bold text-text">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => navigate('/student/attendance')}>Open Attendance</Button>
        </div>
      </Card>
    </div>
  );
}
