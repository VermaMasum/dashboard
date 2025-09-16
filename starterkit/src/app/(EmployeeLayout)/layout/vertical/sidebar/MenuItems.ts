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
  Dashboard as IconDashboard,
  Work as IconWork,
  Assessment as IconAssessment,
  Person as IconPerson,
  AccessTime as IconTime
} from "@mui/icons-material";

// Employee menu items
const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "DASHBOARD",
  },
  {
    id: uniqueId(),
    title: "Overview",
    icon: IconDashboard,
    href: "/employee/overview",
  },
  {
    id: uniqueId(),
    title: "Projects",
    icon: IconWork,
    href: "/employee/projects",
  },
  {
    id: uniqueId(),
    title: "Reports",
    icon: IconAssessment,
    href: "/employee/reports",
  },
  {
    id: uniqueId(),
    title: "Time Tracker",
    icon: IconTime,
    href: "/employee/time-tracker",
  },
];

export default Menuitems;
