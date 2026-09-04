/**
 * Hand-drawn line icons ported from os/_source/outreach-os.html.
 * 20x20 viewBox, 1.6 stroke-width, stroke=currentColor, no fill. No emoji.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
};

export function DashboardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1" />
    </svg>
  );
}

export function ClientsIcon(props: IconProps) {
  return (
    <svg {...base} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="4" width="15" height="12" rx="1.5" />
      <path d="M2.5 8h15" />
      <circle cx="6.5" cy="12" r="1.3" />
      <path d="M9.5 12h4" />
    </svg>
  );
}

export function GroupsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="7" cy="7" r="2.6" />
      <circle cx="14" cy="8" r="2.1" />
      <path d="M2.5 17c0-2.8 2-4.6 4.5-4.6s4.5 1.8 4.5 4.6" />
      <path d="M12.8 12.9c1.9.2 3.2 1.7 3.2 4.1" />
    </svg>
  );
}

export function CreatorIcon(props: IconProps) {
  return (
    <svg {...base} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13.5 3.5l3 3L6 17H3v-3z" />
    </svg>
  );
}

export function ScheduleIcon(props: IconProps) {
  return (
    <svg {...base} strokeLinecap="round" {...props}>
      <rect x="2.5" y="4" width="15" height="13.5" rx="1.5" />
      <path d="M2.5 8h15" />
      <path d="M6.5 2.5v3" />
      <path d="M13.5 2.5v3" />
    </svg>
  );
}

export function LibraryIcon(props: IconProps) {
  return (
    <svg {...base} strokeLinejoin="round" {...props}>
      <path d="M10 2.5l7.5 3.8L10 10 2.5 6.3z" />
      <path d="M2.5 10.5L10 14l7.5-3.5" />
      <path d="M2.5 14.5L10 18l7.5-3.5" />
    </svg>
  );
}

export function TodoIcon(props: IconProps) {
  return (
    <svg {...base} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="2.5" width="15" height="15" rx="2" />
      <path d="M6 10l2.7 2.7L14 7.2" />
    </svg>
  );
}

export function PlaybookIcon(props: IconProps) {
  return (
    <svg {...base} strokeLinejoin="round" {...props}>
      <path d="M2.5 4c1.8-1 4-1.2 7 0v12c-3-1.2-5.2-1-7 0z" />
      <path d="M17.5 4c-1.8-1-4-1.2-7 0v12c3-1.2 5.2-1 7 0z" />
    </svg>
  );
}

export function AssistantIcon(props: IconProps) {
  return (
    <svg {...base} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 5.5c0-1.1.9-2 2-2h11c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H8l-3.5 3v-3H4.5c-1.1 0-2-.9-2-2z" />
      <path d="M6.5 8h7M6.5 10.5h4.5" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} strokeLinecap="round" {...props}>
      <path d="M3 6h14M3 10h14M3 14h14" />
    </svg>
  );
}
