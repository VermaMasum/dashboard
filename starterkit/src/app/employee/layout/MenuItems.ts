import { uniqueId } from "lodash";
import { IconChartPie, IconReportAnalytics, IconUser } from "@tabler/icons-react";

export interface MenuitemsType {
  navlabel?: boolean;
  subheader?: string;
  id?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}

export const getEmployeeMenuItems = (): MenuitemsType[] => {
  return [
    { navlabel: true, subheader: "Employee Dashboard" },
    { 
      id: uniqueId(), 
      title: "Dashboard", 
      icon: IconChartPie, 
      href: "/employee/dashboard" 
    },
    { navlabel: true, subheader: "Reports" },
    { 
      id: uniqueId(), 
      title: "Submit Report", 
      icon: IconReportAnalytics, 
      href: "/employee/dashboard" 
    },
    { 
      id: uniqueId(), 
      title: "My Reports", 
      icon: IconUser, 
      href: "/employee/dashboard" 
    },
  ];
};

const Menuitems: MenuitemsType[] = getEmployeeMenuItems();
export default Menuitems;
