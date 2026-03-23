import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Box, Drawer, IconButton, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Close from "@mui/icons-material/Close";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { AppColors } from "../../constant/appColors";
import { protectedRouters } from "../../router/router.config";
import { protectedRouters2 } from "../../router/router.config";
import useAuth from "../../hooks/useAuth";

const Sidebar = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const location = useLocation();
  const [controlCenterOpen, setControlCenterOpen] = useState(false);

  const { isSecondGame } = useAuth();

  const asideItems = isSecondGame ? protectedRouters2 : protectedRouters;
  const menuItems = asideItems?.filter((item) => item?.inSidebarMenu) ?? [];
  const groupHeaders = menuItems.filter((i) => !i.path);
  const linkItems = menuItems.filter((i) => i.path);

  const drawerContent = (
    <Box sx={{ width: 256, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: { xs: "flex", lg: "none" },
          height: 64,
          px: 2,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.text.disabled}`,
        }}
      >
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            background: `radial-gradient(ellipse farthest-corner at right bottom, #FEDB37 0%, #FDB931 8%, #9f7928 20%, #8A6E2F 30%, transparent 80%),
              radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #FFFFAC 8%, #D1B464 25%,  #FDB931 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          BT EXCHANGE
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": {
              color: theme.palette.text.primary,
              bgcolor: theme.palette.secondary.light,
            },
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <List sx={{ mt: 2, px: 1.5, flex: 1, overflowY: "auto" }}>
        {menuItems.map((item) => {
          if (!item.path) {
            const children = linkItems.filter((l) => l.parentLabel === item.label);
            const ParentIcon = item.icon;
            return (
              <React.Fragment key={`group-${item.label}`}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => setControlCenterOpen((o) => !o)}
                    sx={{
                      borderRadius: 1,
                      py: 1,
                      color: theme.palette.text.secondary,
                      "&:hover": { color: AppColors.GOLD_DARK, bgcolor: `${AppColors.GOLD_DARK}12` },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                      <ParentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
                    />
                    {controlCenterOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={controlCenterOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {children.map((child) => {
                      const isActive = location.pathname === child.path;
                      return (
                        <ListItem key={child.path} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            component={NavLink}
                            to={child.path}
                            onClick={onClose}
                            className={isActive ? "btn-primary" : ""}
                            sx={{ borderRadius: 1, py: 0.75 }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 36,
                                color: isActive ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                              }}
                            >
                              <child.icon />
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{ fontSize: "0.8125rem", fontWeight: 500 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }
          if (item.parentLabel) return null;
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={onClose}
                className={isActive ? "btn-primary" : ""}
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.secondary,
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          display: { lg: "none" },
          position: "fixed",
          inset: 0,
          zIndex: 30,
          bgcolor: theme.palette.background.default + "66",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s",
        }}
        onClick={onClose}
      />
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { lg: "none" },
          "& .MuiDrawer-paper": {
            width: 257,
            bgcolor: AppColors.BG_CARD,
            borderRight: `1px solid ${theme.palette.text.disabled}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box
        component="aside"
        sx={{
          display: { xs: "none", lg: "block" },
          width: 256,
          bgcolor: AppColors.BG_CARD,
        }}
      >
        {drawerContent}
      </Box>
    </>
  );
};

export default Sidebar;