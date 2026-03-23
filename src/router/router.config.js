import { Leaderboard, Person, AccountBalanceWallet, History, MonetizationOn, CandlestickChart, Settings, Telegram, AttachMoney, NotificationsNoneOutlined, CopyAllOutlined } from "@mui/icons-material";
import asyncComponent from "../utils/asyncComponent.jsx";

export const authRouters = [
  {
    path: "/trade/login",
    component: asyncComponent(() => import("../pages/auth/LoginTrade.jsx")),
  },
  {
    path: "/trade/forgot-password",
    component: asyncComponent(() => import("../pages/auth/ForgotPassword.jsx")),
  },
  {
    path: "/network/login",
    component: asyncComponent(() => import("../pages/auth/LoginNetwork.jsx")),
  },
  {
    path: "/network/forgot-password",
    component: asyncComponent(() => import("../pages/auth/ForgotPassword2.jsx")),
  }
];

export const protectedRouters = [
  {
    path: "/",
    inSidebarMenu: true,
    label: "Dashboard",
    icon: Leaderboard,
    component: asyncComponent(() => import("../pages/trade/dashboard.jsx")),
  },
  {
    path: "/manage-users",
    inSidebarMenu: true,
    label: "Manage Users",
    icon: Person,
    component: asyncComponent(() => import("../pages/trade/manageUser/index.jsx")),
  },
  {
    path: "/manage-funds",
    inSidebarMenu: true,
    label: "Manage Funds",
    icon: AccountBalanceWallet,
    component: asyncComponent(() => import("../pages/trade/manageFund/index.jsx")),
  },
  {
    path: "/manage-history-and-logs",
    inSidebarMenu: true,
    label: "Manage History & Logs",
    icon: History,
    component: asyncComponent(() => import("../pages/trade/manageHistoryNLogs/index.jsx")),
  },
  {
    path: "/manage-copy-trade",
    inSidebarMenu: true,
    label: "Manage Copy Trade",
    icon: CandlestickChart,
    component: asyncComponent(() => import("../pages/trade/manageCopyTrade/index.jsx")),
  },
  {
    inSidebarMenu: true,
    label: "Control Center",
    icon: Settings,
  },
  {
    path: "/control-center/telegram-links",
    inSidebarMenu: true,
    parentLabel: "Control Center",
    label: "Telegram Links",
    icon: Telegram,
    component: asyncComponent(() => import("../pages/trade/telegramLinks/index.jsx")),
  },
  {
    path: "/control-center/bet-profit",
    inSidebarMenu: true,
    parentLabel: "Control Center",
    label: "Bet Profit",
    icon: AttachMoney,
    component: asyncComponent(() => import("../pages/trade/betProfit/index.jsx")),
  },
  {
    path: "/control-center/notifications",
    inSidebarMenu: true,
    parentLabel: "Control Center",
    label: "Notifications",
    icon: NotificationsNoneOutlined,
    component: asyncComponent(() => import("../pages/trade/notifications/index.jsx")),
  },
];

export const protectedRouters2 = [
  {
    path: "/network/dashboard",
    inSidebarMenu: true,
    label: "Dashboard",
    icon: Leaderboard,
    component: asyncComponent(() => import("../pages/network/dashboard.jsx")),
  },
  {
    path: "/network/manage-users",
    inSidebarMenu: true,
    label: "Manage Users",
    icon: Person,
    component: asyncComponent(() => import("../pages/network/manageUser/index.jsx")),
  },
  {
    path: "/network/manage-funds",
    inSidebarMenu: true,
    label: "Manage Funds",
    icon: AccountBalanceWallet,
    component: asyncComponent(() => import("../pages/network/manageFund/index.jsx")),
  },
  {
    path: "/network/manage-finance",
    inSidebarMenu: true,
    label: "Manage Finance",
    icon: MonetizationOn,
    component: asyncComponent(() => import("../pages/network/manageFinance/index.jsx")),
  },
  {
    path: "/network/manage-trade-history",
    inSidebarMenu: true,
    label: "Manage Trade History",
    icon: CandlestickChart,
    component: asyncComponent(() => import("../pages/network/ManageTradeHistory/index.jsx")),
  },
  {
    path: "/network/roi-settings",
    inSidebarMenu: true,
    label: "ROI Settings",
    icon: Settings,
    component: asyncComponent(() => import("../pages/network/roiSettings/index.jsx")),
  },
];

export const routers = [...authRouters, ...protectedRouters, ...protectedRouters2];
