import {
  BUILD_STATUSES,
  CLIENT_SOURCES,
  OFFER_TYPES,
  RETAINER_STATUSES,
} from "@/lib/data/types";
import type {
  BuildStatus,
  ClientSource,
  OfferType,
  RetainerStatus,
} from "@/lib/data/types";

/** Thrown for bad form input; server actions catch it and show the message. */
export class ValidationError extends Error {}

export function slugify(input: string): string {
  const s = input
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "") // drop combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return s || "client";
}

/**
 * Client fields a person can edit on the record in ticket 05. Phase, dates and
 * the bridge-gate flags belong to ticket 06 and are not handled here.
 */
export type ClientWritable = {
  businessName: string;
  contactName: string | null;
  location: string | null;
  timezone: string | null;
  contactHours: string | null;
  source: ClientSource | null;
  offerType: OfferType | null;
  buildStatus: BuildStatus;
  retainerStatus: RetainerStatus;
  retainerTier: string | null;
  mrr: number;
  siteUrl: string | null;
  domain: string | null;
  paypalPlanUrl: string | null;
  notes: string | null;
  briefMd: string | null;
};

export type ParsedClientForm = Partial<ClientWritable> & { slug?: string };

const NULLABLE_TEXT_FIELDS: (keyof ClientWritable)[] = [
  "contactName",
  "location",
  "timezone",
  "contactHours",
  "retainerTier",
  "siteUrl",
  "domain",
  "paypalPlanUrl",
  "notes",
  "briefMd",
];

function raw(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return v == null ? undefined : String(v);
}

/** undefined = field absent (leave alone); null = present but blank (clear it). */
function nullableText(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function enumValue<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  label: string,
): T | null | undefined {
  if (value === undefined) return undefined;
  if (value.trim() === "") return null;
  if (!allowed.includes(value as T)) {
    throw new ValidationError(`Invalid ${label}.`);
  }
  return value as T;
}

export function parseClientForm(
  fd: FormData,
  opts: { mode: "create" | "update" },
): ParsedClientForm {
  const out: ParsedClientForm = {};
  const isCreate = opts.mode === "create";

  // business name
  const nameRaw = raw(fd, "businessName");
  if (isCreate) {
    const name = (nameRaw ?? "").trim();
    if (!name) throw new ValidationError("Business name is required.");
    out.businessName = name;
    out.slug = slugify(name);
  } else if (nameRaw !== undefined) {
    const name = nameRaw.trim();
    if (!name) throw new ValidationError("Business name cannot be empty.");
    out.businessName = name;
  }

  // nullable free-text fields (all typed string | null on ClientWritable)
  const writable = out as Record<string, string | null>;
  for (const field of NULLABLE_TEXT_FIELDS) {
    const parsed = nullableText(raw(fd, field));
    if (parsed !== undefined) writable[field] = parsed;
  }

  // enums
  const source = enumValue(raw(fd, "source"), CLIENT_SOURCES, "source");
  if (source !== undefined) out.source = source;
  const offerType = enumValue(raw(fd, "offerType"), OFFER_TYPES, "offer type");
  if (offerType !== undefined) out.offerType = offerType;

  const buildStatus = enumValue(raw(fd, "buildStatus"), BUILD_STATUSES, "build status");
  if (buildStatus) out.buildStatus = buildStatus;

  const retainerStatus = enumValue(
    raw(fd, "retainerStatus"),
    RETAINER_STATUSES,
    "retainer status",
  );
  if (retainerStatus) out.retainerStatus = retainerStatus;

  // mrr
  const mrrRaw = raw(fd, "mrr");
  if (mrrRaw !== undefined && mrrRaw.trim() !== "") {
    const n = Number(mrrRaw);
    if (!Number.isFinite(n) || n < 0) {
      throw new ValidationError("MRR must be a number of 0 or more.");
    }
    out.mrr = n;
  } else if (isCreate) {
    out.mrr = 0;
  }

  if (isCreate) {
    if (!out.source) throw new ValidationError("Source is required.");
    if (!out.offerType) throw new ValidationError("Offer type is required.");
    if (!out.buildStatus) throw new ValidationError("Build status is required.");
  }

  return out;
}
