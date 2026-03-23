import React, { useState } from "react";
import { AppColors } from "../../constant/appColors";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, Typography, Avatar, useMediaQuery, Menu, MenuItem, ListItemIcon } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../../hooks/useAuth";
import { useAuth2 } from "../../hooks/useAuth2";
import MenuIcon from "@mui/icons-material/Menu";
import WidgetsOutlined from "@mui/icons-material/WidgetsOutlined";
import BebitLogo from "../../assets/images/btLogo.webp";
import TradeGameIcon from "../../assets/images/tradeGame.png";
import NetworkGameIcon from "../../assets/images/networkGame.png";
import Logout from "@mui/icons-material/Logout";
import ConfirmationModal from "../../components/ConfirmationModal";

const MainHeader = ({ onToggleSidebar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isLoggedIn, clear, setIsSecondGame, isSecondGame } = useAuth();
  const { clear: clear2 } = useAuth2();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const [openWidgets, setOpenWidgets] = useState(false);
  const [anchorElWidgets, setAnchorElWidgets] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    clear();
    clear2();
    navigate(isSecondGame ? "/network/login" : "/trade/login");
  };

  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        background: AppColors.BG_CARD,
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3, lg: 4 },
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isLoggedIn && <IconButton
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            sx={{
              display: { lg: "none" },
              color: theme.palette.text.secondary,
              "&:hover": {
                color: theme.palette.text.primary,
                bgcolor: theme.palette.secondary.light,
              },
            }}
          >
            <MenuIcon />
          </IconButton>}
          <Box className="flex items-center gap-2 mr-2"
            onClick={() => navigate(isSecondGame ? "/network/dashboard" : "/")}
            sx={{
              cursor: "pointer",
              minWidth: 0,
            }}>
            <figure
              className="w-15 h-15"
              style={{
                width: isMobile ? "32px" : "50px",
                height: isMobile ? "32px" : "50px",
              }}
            >
              <img src={BebitLogo} className="w-full h-full object-contain" alt="BT Exchange Logo" />
            </figure>
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
                display: { xs: "none", sm: "block" },
              }}
            >
              BT EXCHANGE
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flexDirection: "column", alignItems: "flex-end" }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.primary,
                maxWidth: 160,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}
            >
              Administrator
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, lineHeight: 1 }}>
              {isSecondGame ? "Network Panel" : "Trade Panel"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isLoggedIn &&
              <React.Fragment>
                <IconButton
                  sx={{
                    color: AppColors.TXT_SUB,
                    padding: { xs: "6px", sm: "8px" },
                  }}
                  size="small"
                  onClick={(e) => { setOpen(true); setAnchorEl(e.currentTarget) }}
                >
                  <Avatar />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={open}
                  onClose={() => { setOpen(false); setAnchorEl(null) }}
                  onClick={() => { setOpen(false); setAnchorEl(null) }}
                  slotProps={{
                    paper: {
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&::before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem key="profile" onClick={() => navigate("/profile")}>
                    <ListItemIcon>
                      <Avatar />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={() => setLogoutModalOpen(true)}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </React.Fragment>
            }
            <IconButton
              onClick={(event) => { setOpenWidgets(!openWidgets); setAnchorElWidgets(event.currentTarget) }}
              sx={{
                color: AppColors.TXT_SUB,
                padding: "8px",
                transition: "all 0.3s ease",
                "&:hover": {
                  color: AppColors.GOLD_PRIMARY,
                  backgroundColor: `${AppColors.GOLD_PRIMARY}10`,
                  transform: "scale(1.05)",
                },
              }}
            >
              <WidgetsOutlined />
            </IconButton>
            <Menu
              anchorEl={anchorElWidgets}
              id="widgets-menu"
              open={openWidgets}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              onClose={() => setOpenWidgets(false)}
              onClick={() => setOpenWidgets(false)}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 4px 16px rgba(0,0,0,0.4))',
                    mt: 1.5,
                    borderRadius: 3,
                    p: 2.5,
                    minWidth: { xs: 280, sm: 320 },
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 20,
                      width: 12,
                      height: 12,
                      bgcolor: AppColors.BG_CARD,
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2.5,
                  alignItems: "flex-start",
                }}
              >
                {/* Trade Panel Profile Card */}
                <Box
                  onClick={() => {
                    navigate("/");
                    setIsSecondGame(false);
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: { xs: 1, sm: 1.5 },
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "scale(1.05)",
                      "& .profile-image": {
                        borderColor: AppColors.GOLD_PRIMARY,
                        boxShadow: `0 0 0 3px ${AppColors.GOLD_PRIMARY}40`,
                      },
                      "& .profile-name": {
                        color: AppColors.GOLD_PRIMARY,
                      },
                    },
                  }}
                >
                  <Box
                    className="profile-image"
                    sx={{
                      width: { xs: 100, sm: 120 },
                      height: { xs: 100, sm: 120 },
                      borderRadius: { xs: 1, sm: 2 },
                      overflow: "hidden",
                      border: `3px solid ${!isSecondGame ? AppColors.GOLD_PRIMARY : AppColors.HLT_LIGHT}`,
                      bgcolor: AppColors.BG_SECONDARY,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      boxShadow: !isSecondGame
                        ? `0 0 0 3px ${AppColors.GOLD_PRIMARY}40, 0 4px 12px rgba(0,0,0,0.2)`
                        : "0 4px 12px rgba(0,0,0,0.2)",
                      "& img": {
                        objectFit: "cover",
                      }
                    }}
                  >
                    <img src={TradeGameIcon} alt="Trade Game" />
                  </Box>
                  <Typography
                    className="profile-name"
                    variant="body2"
                    sx={{
                      fontSize: { xs: 13, sm: 14 },
                      fontWeight: 500,
                      color: !isSecondGame ? AppColors.GOLD_PRIMARY : AppColors.TXT_MAIN,
                      textAlign: "center",
                      transition: "color 0.3s ease",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Trade Panel
                  </Typography>
                  {!isSecondGame && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: AppColors.GOLD_PRIMARY,
                        border: `2px solid ${AppColors.BG_CARD}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: AppColors.BG_CARD,
                        }}
                      />
                    </Box>
                  )}
                </Box>

                {/* Network Panel Profile Card */}
                <Box
                  onClick={() => {
                    setIsSecondGame(true);
                    navigate("/network/dashboard");
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1.5,
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "scale(1.05)",
                      "& .profile-image": {
                        borderColor: AppColors.GOLD_PRIMARY,
                        boxShadow: `0 0 0 3px ${AppColors.GOLD_PRIMARY}40`,
                      },
                      "& .profile-name": {
                        color: AppColors.GOLD_PRIMARY,
                      },
                    },
                  }}
                >
                  <Box
                    className="profile-image"
                    sx={{
                      width: { xs: 100, sm: 120 },
                      height: { xs: 100, sm: 120 },
                      borderRadius: { xs: 1, sm: 2 },
                      overflow: "hidden",
                      border: `3px solid ${isSecondGame ? AppColors.GOLD_PRIMARY : AppColors.HLT_LIGHT}`,
                      bgcolor: AppColors.BG_SECONDARY,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      boxShadow: isSecondGame
                        ? `0 0 0 3px ${AppColors.GOLD_PRIMARY}40, 0 4px 12px rgba(0,0,0,0.2)`
                        : "0 4px 12px rgba(0,0,0,0.2)",
                      "& img": {
                        objectFit: "cover",
                      },
                    }}
                  >
                    <img src={NetworkGameIcon} alt="Network Game" />
                  </Box>
                  <Typography
                    className="profile-name"
                    variant="body2"
                    sx={{
                      fontSize: { xs: 13, sm: 14 },
                      fontWeight: 500,
                      color: isSecondGame ? AppColors.GOLD_PRIMARY : AppColors.TXT_MAIN,
                      textAlign: "center",
                      transition: "color 0.3s ease",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Network Panel
                  </Typography>
                  {isSecondGame && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: AppColors.GOLD_PRIMARY,
                        border: `2px solid ${AppColors.BG_CARD}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: AppColors.BG_CARD,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Menu>
          </Box>
        </Box>
      </Box>
      <ConfirmationModal open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} onConfirm={handleLogout} title="Logout" description="Are you sure you want to logout?" />
    </Box>
  );
};

export default MainHeader;