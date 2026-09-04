import { GROUP_STATUSES } from "@/lib/data/types";
import type { GroupStatus } from "@/lib/data/types";
import { ValidationError } from "@/lib/data/errors";
import { isIsoDate } from "@/lib/data/validate";

export type GroupWritable = {
  name: string;
  status: GroupStatus;
  rulesNotes: string | null;
  rulesUrl: string | null;
  lastPostDate: string | null;
};

export type ParsedGroupForm = Partial<GroupWritable>;

function raw(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return v == null ? undefined : String(v);
}

function nullableText(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function parseGroupForm(
  fd: FormData,
  opts: { mode: "create" | "update" },
): ParsedGroupForm {
  const out: ParsedGroupForm = {};
  const isCreate = opts.mode === "create";

  const nameRaw = raw(fd, "name");
  if (isCreate) {
    const name = (nameRaw ?? "").trim();
    if (!name) throw new ValidationError("A group needs a name.");
    out.name = name;
  } else if (nameRaw !== undefined) {
    const name = nameRaw.trim();
    if (!name) throw new ValidationError("Name cannot be empty.");
    out.name = name;
  }

  const status = raw(fd, "status");
  if (status !== undefined && status !== "") {
    if (!GROUP_STATUSES.includes(status as GroupStatus)) {
      throw new ValidationError("Invalid status.");
    }
    out.status = status as GroupStatus;
  } else if (isCreate) {
    out.status = "active";
  }

  const rulesNotes = nullableText(raw(fd, "rulesNotes"));
  if (rulesNotes !== undefined) out.rulesNotes = rulesNotes;

  const rulesUrl = nullableText(raw(fd, "rulesUrl"));
  if (rulesUrl !== undefined) out.rulesUrl = rulesUrl;

  const lastPostDate = raw(fd, "lastPostDate");
  if (lastPostDate !== undefined) {
    const v = lastPostDate.trim();
    if (v === "") out.lastPostDate = null;
    else if (!isIsoDate(v)) throw new ValidationError("Last-post date must be a valid date.");
    else out.lastPostDate = v;
  }

  return out;
}
