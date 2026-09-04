/**
 * Button set — ported from .btn in os/_source/outreach-os.html.
 * Variants: default, primary, ghost, danger. Sizes: default, sm.
 */
import type { ButtonHTMLAttributes } from "react";

type Variant = "default" | "primary" | "ghost" | "danger";
type Size = "default" | "sm";

export function buttonClassName(variant: Variant = "default", size: Size = "default", extra?: string) {
  return [
    "btn",
    variant === "primary" && "btn-primary",
    variant === "ghost" && "btn-ghost",
    variant === "danger" && "btn-danger",
    size === "sm" && "btn-sm",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "default",
  size = "default",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button type={type} className={buttonClassName(variant, size, className)} {...props} />
  );
}
