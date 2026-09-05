import Link from "next/link";
import { resolveMistakeAction } from "@/lib/data/eventActions";
import type { RecentMistake } from "@/lib/data/events";

export function MistakesList({ mistakes }: { mistakes: RecentMistake[] }) {
  if (mistakes.length === 0) {
    return <div className="empty-state">No open mistakes logged.</div>;
  }

  return (
    <ul className="mistake-list">
      {mistakes.map((m) => (
        <li key={m.id} className="mistake-item">
          <div className="mistake-item-head">
            <Link href={`/clients/${m.clientId}`}>{m.businessName}</Link>
            <span className="mistake-item-when">
              {new Date(m.at).toLocaleDateString()}
            </span>
          </div>
          <div className="mistake-item-body">{m.body}</div>
          <form action={resolveMistakeAction} className="timeline-resolve">
            <input type="hidden" name="clientId" value={m.clientId} />
            <input type="hidden" name="eventId" value={m.id} />
            <button type="submit" className="btn btn-ghost btn-sm">
              Mark addressed
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
