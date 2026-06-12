type EmptyStateProps = {
  title: string;
  description: string;
};

type SidebarStateProps = EmptyStateProps & {
  action?: React.ReactNode;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="max-w-sm rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Inbox Myde
        </p>
        <h2 className="mt-4 text-2xl font-semibold text-title">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}

export function SidebarState({ title, description, action }: SidebarStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-muted px-5 py-8 text-center">
      <h3 className="text-base font-semibold text-title">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
