'use client';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyIcon?: React.ReactNode;
  emptyText?: string;
  keyField?: keyof T;
}

export function DataTable<T extends Record<string, unknown>>({
  columns, data, isLoading, emptyIcon, emptyText = 'No data found', keyField = 'id' as keyof T,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-2"
          style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="card p-12 text-center">
        {emptyIcon && <div className="mb-3 opacity-30 flex justify-center">{emptyIcon}</div>}
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {columns.map(c => (
                <th key={c.key} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={String(row[keyField] ?? i)}
                className="transition-colors hover:bg-(--bg-subtle)"
                style={{ borderBottom: '1px solid var(--border)' }}>
                {columns.map(c => (
                  <td key={c.key} className="px-4 py-3">
                    {c.render ? c.render(row) : String(row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
