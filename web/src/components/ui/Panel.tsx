/**
 * Panel / card surface — ported from .panel in os/_source/outreach-os.html.
 */

export function Panel({
  title,
  actions,
  children,
  className,
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className ? `panel ${className}` : "panel"}>
      {title ? (
        <div className="panel-title">
          <span>{title}</span>
          {actions ? <span>{actions}</span> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
