export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-(--text-primary)">{title}</h2>
      {subtitle && <p className="text-xs text-(--text-muted) mt-0.5">{subtitle}</p>}
    </div>
  );
}
