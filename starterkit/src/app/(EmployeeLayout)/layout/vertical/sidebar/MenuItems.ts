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

import { 
  Home as IconHome, 
  Assignment as IconClipboardList, 
  Assessment as IconReportAnalytics, 
  Person as IconUser,
  PieChart as IconPieChart
} from "@mui/icons-material";

// Employee menu items
const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "HOME",
  },
  {
    id: uniqueId(),
    title: "Starter Page",
    icon: IconPieChart,
    href: "/employee/dashboard",
  },
  {
    navlabel: true,
    subheader: "DASHBOARD",
  },
  {
    id: uniqueId(),
    title: "Project Details",
    icon: IconClipboardList,
    href: "tab=1",
  },
  {
    id: uniqueId(),
    title: "Daily Reports",
    icon: IconReportAnalytics,
    href: "tab=2",
  },
];

export default Menuitems;
