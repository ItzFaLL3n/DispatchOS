import type { ComponentType, SVGProps } from "react";
import {
  ClientsIcon,
  CreatorIcon,
  DashboardIcon,
  GroupsIcon,
  LibraryIcon,
  PlaybookIcon,
  ScheduleIcon,
  TodoIcon,
} from "@/components/icons";

export type NavItem = {
  href: string;
  label: string;
  /** Ticket-style "Form No." shown in the page header. */
  formNo: string;
  /** Two-digit sequence number in the Workflow group, if any. */
  num?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard", formNo: "000", icon: DashboardIcon }],
  },
  {
    label: "Workflow",
    items: [
      { href: "/clients", label: "Clients", formNo: "001", num: "01", icon: ClientsIcon },
      { href: "/groups", label: "Groups", formNo: "002", num: "02", icon: GroupsIcon },
      { href: "/creator", label: "Creator", formNo: "003", num: "03", icon: CreatorIcon },
      { href: "/schedule", label: "Schedule", formNo: "004", num: "04", icon: ScheduleIcon },
      { href: "/library", label: "Library", formNo: "005", num: "05", icon: LibraryIcon },
      { href: "/todo", label: "Todo", formNo: "006", num: "06", icon: TodoIcon },
    ],
  },
  {
    label: "Reference",
    items: [{ href: "/playbook", label: "Playbook", formNo: "REF", icon: PlaybookIcon }],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
