import { createTheme } from "@mui/material/styles";

// Responsive breakpoints
// xs: 0px (mobile)
// sm: 600px (large mobile/small tablet)
// md: 900px (tablet)
// lg: 1200px (laptop)
// xl: 1536px (desktop)

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: "#D4AF37", // Gold primary from AppColors
      light: "#D4AF37", // Gold light
      dark: "#D4AF37", // Gold dark
      contrastText: "#000",
    },
    secondary: {
      main: "#000", // Black
      light: "#1a1a1a", // BG_SECONDARY
      dark: "#0a0a0a", // BG_CARD
      contrastText: "#D4AF37",
    },
    background: {
      default: "#000", // BG_MAIN
      paper: "#0a0a0a", // BG_CARD
    },
    text: {
      primary: "#ffffff", // TXT_MAIN
      secondary: "#b0b0b0", // TXT_SUB
      disabled: "#666666", // HLT_NONE
    },
    success: {
      main: "#00ff88", // SUCCESS
    },
    error: {
      main: "#ff4444", // ERROR
    },
    mode: "dark",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "clamp(1.75rem, 5vw, 3.5rem)",
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: "clamp(1.25rem, 3vw, 2rem)",
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)",
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: "clamp(1rem, 2vw, 1.25rem)",
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: "clamp(0.938rem, 1.5vw, 1.125rem)",
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "clamp(0.813rem, 1.2vw, 0.875rem)",
      lineHeight: 1.6,
    },
    caption: {
      fontSize: "clamp(0.75rem, 1vw, 0.813rem)",
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
          "@media (max-width: 600px)": {
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          "@media (max-width: 600px)": {
            paddingLeft: "16px",
            paddingRight: "16px",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a", // BG_CARD
          backgroundImage: "none",
          '--Paper-overlay': "#1a1a1a !important",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a", // BG_CARD
          backgroundImage: "none",
          border: "1px solid #666666", // HLT_NONE
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a", // BG_CARD
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a", // BG_SECONDARY
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#666666", // HLT_NONE
        },
      },
    },
  },
});

export default theme;
