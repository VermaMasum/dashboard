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
import { IconBoxMultiple, IconPoint, IconChartPie, IconClipboardList, IconReportAnalytics, IconUsers, IconCalendar, IconChevronDown, IconChevronRight, IconReport, IconClock } from "@tabler/icons-react";

// Function to get menu items based on user role
export const getMenuItems = (userRole?: string): MenuitemsType[] => {
  console.log('🔍 getMenuItems - User role received:', userRole);
  const baseItems: MenuitemsType[] = [
    {
      navlabel: true,
      subheader: "Home",
    },
    {
      id: uniqueId(),
      title: "Dashboard",
      icon: IconChartPie,
      href: "/admin/dashboard",
    },
    {
      navlabel: true,
      subheader: "Reports",
    },
    {
      id: uniqueId(),
      title: "Reports",
      icon: IconReport,
      href: "/admin/reports",
    },
    {
      navlabel: true,
      subheader: "Projects",
    },
    {
      id: uniqueId(),
      title: "Project Details",
      icon: IconClipboardList,
      href: "/admin/project-details",
    },
    {
      id: uniqueId(),
      title: "Project History",
      icon: IconReportAnalytics,
      href: "/admin/project-history",
      external: false,
    },
    {
      id: uniqueId(),
      title: "Time Tracker",
      icon: IconClock,
      href: "/admin/time-tracker",
    },
  ];

  // Both Admin and SuperAdmin can see Employee Management
  console.log('🔍 getMenuItems - Checking if userRole is admin or superAdmin:', userRole === 'admin' || userRole === 'superAdmin');
  if (userRole === 'admin' || userRole === 'superAdmin') {
    console.log('🔍 getMenuItems - Adding Employee Management menu item for:', userRole);
    baseItems.push({
      id: uniqueId(),
      title: "Employee Management",
      icon: IconUsers,
      href: "/admin/employees",
    });
    // Employee List removed as requested - commented for future use
    // baseItems.push({
    //   id: uniqueId(),
    //   title: "Employee List",
    //   icon: IconUsers,
    //   href: "/admin/employee-list",
    // });
  } else {
    console.log('🔍 getMenuItems - Not admin or superAdmin, not adding employee menu items');
  }

  return baseItems;
};

// Default export for backward compatibility
const Menuitems: MenuitemsType[] = getMenuItems();

export default Menuitems;
