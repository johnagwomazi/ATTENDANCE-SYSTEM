import { Card } from './Card';
import { EmptyState } from '../shared/EmptyState';

export const Table = ({ columns = [], rows = [], rowKey = 'id', renderRow, emptyMessage = 'No records found.' }) => {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={row[rowKey] ?? index} className="transition hover:bg-slate-50/60">
                  {renderRow(row)}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10">
                  <EmptyState title="Nothing to show" description={emptyMessage} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
