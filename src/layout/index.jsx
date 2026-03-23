import React, { useState } from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MainHeader from "./header/MainHeader";
import Sidebar from "./sidebar/MainSidebar";
import { AppColors } from "../constant/appColors";

const Layout = (props) => {
  const { children } = props;
  const theme = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: AppColors.BG_CARD,
        color: theme.palette.text.primary,
      }}
    >
      <MainHeader onToggleSidebar={handleToggleSidebar} />
      <Box sx={{ display: "flex", flex: 1, pt: 8 }}>
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        <Box
          component="main"
          sx={{
            height: "calc(100vh - 64px)",
            flex: 1,
            bgcolor: AppColors.BG_MAIN,
            px: { xs: 2, sm: 3, lg: 4 },
            py: 2,
            overflowY: "auto",
            borderLeft: { xs: "none", sm: `1px solid ${theme.palette.text.disabled}` },
            borderTop: `1px solid ${theme.palette.text.disabled}`,
            borderRadius: { xs: "0 0 0 0", sm: "16px 0 0 0" }
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
