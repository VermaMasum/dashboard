import { useMediaQuery, Box, Drawer, useTheme } from "@mui/material";
import SidebarItems from "./SidebarItems";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { drawerWidth } from "@/store/customizer/CustomizerSlice";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { setMobileSidebar, setToggleSidebar } from "@/store/customizer/CustomizerSlice";
import { Scrollbar } from "@/app/(DashboardLayout)/components/scrollbar/Scrollbar";

const Sidebar = () => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch<AppDispatch>();

  if (lgUp) {
    return (
      <Box
        sx={{
          width: customizer.SidebarWidth,
          flexShrink: 0,
        }}
      >
        <Drawer
          anchor="left"
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: customizer.SidebarWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Box borderRadius="0 !important" sx={{ height: "100%" }}>
            <Scrollbar sx={{ height: "100%" }}>
              <SidebarItems />
            </Scrollbar>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={customizer.isMobileSidebar}
      onClose={() => dispatch(setMobileSidebar())}
      variant="temporary"
      PaperProps={{
        sx: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Box borderRadius="0 !important" sx={{ height: "100%" }}>
        <Scrollbar sx={{ height: "100%" }}>
          <SidebarItems />
        </Scrollbar>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
