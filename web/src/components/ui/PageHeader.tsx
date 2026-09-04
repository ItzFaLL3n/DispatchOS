/**
 * Ticket page header — ported from pageHeader() in os/_source/outreach-os.html.
 * Every page opens with this: "Form No. 0XX · date" eyebrow, condensed uppercase
 * title, a double hairline rule, a subtitle.
 */

function today(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function PageHeader({
  formNo,
  title,
  sub,
}: {
  formNo: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="ticket-head">
      <div className="ticket-meta">
        Form No. {formNo} &middot; {today()}
      </div>
      <h1 className="page-title">{title}</h1>
      <div className="ticket-rule" />
      <div className="page-sub">{sub}</div>
    </div>
  );
}
