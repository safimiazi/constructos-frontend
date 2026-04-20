const COLORS: Record<string, { bg: string; text: string }> = {
  active:     { bg: 'rgba(34,197,94,0.12)',  text: '#16a34a' },
  inactive:   { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' },
  pending:    { bg: 'rgba(245,158,11,0.12)',  text: '#d97706' },
  approved:   { bg: 'rgba(34,197,94,0.12)',  text: '#16a34a' },
  rejected:   { bg: 'rgba(239,68,68,0.12)',  text: '#dc2626' },
  cancelled:  { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' },
  draft:      { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' },
  sent:       { bg: 'rgba(59,130,246,0.12)',  text: '#2563eb' },
  paid:       { bg: 'rgba(34,197,94,0.12)',  text: '#16a34a' },
  overdue:    { bg: 'rgba(239,68,68,0.12)',  text: '#dc2626' },
  planning:   { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' },
  on_hold:    { bg: 'rgba(245,158,11,0.12)',  text: '#d97706' },
  completed:  { bg: 'rgba(59,130,246,0.12)',  text: '#2563eb' },
  trial:      { bg: 'rgba(168,85,247,0.12)',  text: '#9333ea' },
  suspended:  { bg: 'rgba(239,68,68,0.12)',  text: '#dc2626' },
  todo:       { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' },
  in_progress:{ bg: 'rgba(59,130,246,0.12)',  text: '#2563eb' },
  done:       { bg: 'rgba(34,197,94,0.12)',  text: '#16a34a' },
  blocked:    { bg: 'rgba(239,68,68,0.12)',  text: '#dc2626' },
  received:   { bg: 'rgba(34,197,94,0.12)',  text: '#16a34a' },
  on_leave:   { bg: 'rgba(245,158,11,0.12)',  text: '#d97706' },
  terminated: { bg: 'rgba(239,68,68,0.12)',  text: '#dc2626' },
};

export function StatusBadge({ status }: { status: string }) {
  const c = COLORS[status] ?? { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: c.bg, color: c.text }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
