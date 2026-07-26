import { Badge } from '../ui/Badge';

const normalizeStatus = (value = '') => String(value).toLowerCase();

export const AttendanceBadge = ({ status = 'present', isLate = false, className = '' }) => {
  const normalized = normalizeStatus(status);
  const late = isLate || normalized === 'late';

  if (normalized === 'absent') {
    return <Badge variant="danger" className={className}>Absent</Badge>;
  }

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <Badge variant="success">Present</Badge>
      {late ? (
        <Badge variant="orange" className="px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">
          Late
        </Badge>
      ) : null}
    </div>
  );
};
