import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useContent } from "@/contexts/ContentContext";
import Menuitems from "./MenuItems";
import NavGroup from "@/app/(DashboardLayout)/layout/vertical/sidebar/NavGroup/NavGroup";
import NavItem from "@/app/(DashboardLayout)/layout/vertical/sidebar/NavItem/NavItem";

const SidebarItems = () => {
  const { currentContent, setCurrentContent } = useContent();
  const pathname = usePathname();
  const router = useRouter();
  const customizer = useSelector((state: AppState) => state.customizer);

  const handleClick = (item: any) => {
    console.log('🔗 Employee menu item clicked:', item.title);
    if (item.href) {
      if (item.href === '/employee/dashboard') {
        setCurrentContent('EmployeeDashboard');
      } else {
        router.push(item.href);
      }
    }
  };

  const lastMenu = Menuitems.slice().reverse();

  const lastMenuItems = lastMenu.map((item) => {
    const submenus = item.children?.map((submenu) => {
      return (
        <NavItem
          item={submenu}
          key={submenu.id}
          onClick={() => handleClick(submenu)}
        />
      );
    });
    return (
      <NavGroup
        item={item}
        key={item.id}
        onClick={() => handleClick(item)}
      >
        {submenus}
      </NavGroup>
    );
  });

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {lastMenuItems}
      </List>
    </Box>
  );
};

export default SidebarItems;
