import { uniqueId } from "lodash";

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}

import { IconHome, IconClipboardList, IconReportAnalytics, IconUser, IconLogout } from "@tabler/icons-react";

// Employee menu items
const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "Dashboard",
  },
  {
    id: uniqueId(),
    title: "My Dashboard",
    icon: IconHome,
    href: "/employee/dashboard",
  },
  {
    navlabel: true,
    subheader: "Work",
  },
  {
    id: uniqueId(),
    title: "My Daily Reports",
    icon: IconReportAnalytics,
    href: "/employee/reports",
  },
  {
    id: uniqueId(),
    title: "My Projects",
    icon: IconClipboardList,
    href: "/employee/projects",
  },
  {
    navlabel: true,
    subheader: "Profile",
  },
  {
    id: uniqueId(),
    title: "My Profile",
    icon: IconUser,
    href: "/employee/profile",
  },
];

export default Menuitems;
