/** Thrown for bad form input; server actions catch it and show the message. */
export class ValidationError extends Error {}

/** Shared return shape for server actions used with `useActionState`. */
export type FormState = { ok?: boolean; error?: string };

export function messageFor(err: unknown): string {
  if (err instanceof ValidationError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}
