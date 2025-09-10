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
  PieChart as IconPieChart,
  Dashboard as IconDashboard,
  ViewModule as IconViewModule
} from "@mui/icons-material";

// Employee menu items
const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "DASHBOARD",
  },
  {
    id: uniqueId(),
    title: "Full Dashboard",
    icon: IconDashboard,
    href: "/employee/dashboard-full",
  },
  {
    id: uniqueId(),
    title: "Simple Dashboard",
    icon: IconViewModule,
    href: "/employee/dashboard-simple",
  },
];

export default Menuitems;
