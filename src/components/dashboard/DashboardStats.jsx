import { Box, Container, Typography, Grid, Chip, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppColors } from "../../constant/appColors";
import BTLoader from "../Loader";
import {
  AccountBalanceWallet,
  TrendingUp,
  Lock,
  People,
  Layers,
  AttachMoney,
  ShowChart,
  CheckCircle,
  Cancel,
  FormatListBulleted,
} from "@mui/icons-material";

/* ---------------- STAT CARD COMPONENT ---------------- */
function StatCard({ icon: Icon, title, value, subtitle, iconColor, gradient, navigateIcon: NavigateIcon, navigatePath }) {
  const navigate = useNavigate();

  return (
    <Box className="container-card-charts">
      <Box className="card-charts" sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "space-between" }, alignItems: { xs: "flex-start", sm: "center" }, gap: 1, mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, gap: 1, flexWrap: "wrap" }}>
            <Box
              sx={{
                width: { xs: 26, sm: 36 },
                height: { xs: 26, sm: 36 },
                borderRadius: 2,
                bgcolor: `${iconColor || AppColors.GOLD_PRIMARY}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon sx={{ fontSize: { xs: 20, sm: 28 }, color: iconColor || AppColors.GOLD_PRIMARY }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: AppColors.TXT_SUB,
              }}
            >
              {title}
            </Typography>
          </Box>
          {navigatePath &&
            <IconButton onClick={() => navigate(navigatePath)}>
              {NavigateIcon ? <NavigateIcon sx={{ fontSize: { xs: 20, sm: 28 } }} /> : <FormatListBulleted sx={{ fontSize: { xs: 20, sm: 28 } }} />}
            </IconButton>
          }
        </Box>

        <Typography
          variant="h6"
          sx={{
            color: AppColors.TXT_MAIN,
            mb: 0.5,
            background: gradient || `linear-gradient(135deg, ${AppColors.TXT_MAIN} 0%, ${iconColor || AppColors.GOLD_PRIMARY} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: AppColors.TXT_SUB,
              opacity: 0.7,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ---------------- STATUS BADGE COMPONENT ---------------- */
function StatusBadge({ label, isActive, icon: Icon, loading }) {
  return (
    <Chip
      icon={loading ? <Box sx={{ display: "flex", alignItems: "center" }}><BTLoader /></Box> : <Icon sx={{ fontSize: 18 }} />}
      label={loading ? "Loading..." : label}
      sx={{
        bgcolor: isActive ? `${AppColors.SUCCESS}20` : `${AppColors.ERROR}20`,
        color: isActive ? AppColors.SUCCESS : AppColors.ERROR,
        border: `1px solid ${isActive ? AppColors.SUCCESS : AppColors.ERROR}40`,
        height: 32,
        "& .MuiChip-icon": {
          color: isActive ? AppColors.SUCCESS : AppColors.ERROR,
        },
      }}
    />
  );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function DashboardStats({ data, loading }) {
  const { balances = {}, incomes = {}, stats = {} } = data || {};

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  return (
    <Container maxWidth="lg">
      <Box className="mb-4">
        <Typography
          variant="h2"
          sx={{
            mb: 2,
            color: AppColors.TXT_MAIN,
            textTransform: "none",
          }}
        >
          Funds Overview
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <StatusBadge
            label={stats?.isActive ? "Active Account" : "Inactive Account"}
            isActive={stats?.isActive}
            icon={stats?.isActive ? CheckCircle : Cancel}
            loading={loading}
          />
          <StatusBadge
            label={stats?.withdrawUnlocked ? "Withdraw Unlocked" : "Withdraw Locked"}
            isActive={stats?.withdrawUnlocked}
            icon={stats?.withdrawUnlocked ? CheckCircle : Lock}
            loading={loading}
          />
        </Box>
      </Box>

      {/* BALANCES SECTION */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            color: AppColors.GOLD_PRIMARY,
            mb: 2,
            textTransform: "none",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AccountBalanceWallet sx={{ fontSize: { xs: 20, sm: 28 } }} />
          Balances
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              icon={AccountBalanceWallet}
              title="Total Balance"
              value={loading ? "Loading..." : `${formatCurrency(balances?.totalAvailableForTrading)} USDT`}
              subtitle="Available for trading"
              iconColor={AppColors.GOLD_PRIMARY}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              icon={TrendingUp}
              title="Winning Balance"
              value={loading ? "Loading..." : `${formatCurrency(balances?.winningBalance + balances?.withdrawableWinnings)} USDT`}
              subtitle="From successful trades"
              iconColor={AppColors.SUCCESS}
              gradient={`linear-gradient(135deg, ${AppColors.SUCCESS} 0%, ${AppColors.GOLD_PRIMARY} 100%)`}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              icon={Lock}
              title="Locked Balance"
              value={loading ? "Loading..." : `${formatCurrency(balances?.lockedBalance)} USDT`}
              subtitle="Currently locked"
              iconColor={AppColors.ERROR}
              gradient={`linear-gradient(135deg, ${AppColors.ERROR} 0%, ${AppColors.GOLD_PRIMARY} 100%)`}
            />
          </Grid>
        </Grid>
      </Box>

      {/* INCOMES SECTION */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            color: AppColors.GOLD_PRIMARY,
            mb: 2,
            textTransform: "none",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AttachMoney sx={{ fontSize: { xs: 20, sm: 28 } }} />
          Income Sources
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              icon={People}
              title="Referral Income"
              value={loading ? "Loading..." : `${formatCurrency(incomes?.referralIncome)} USDT`}
              subtitle="From referrals"
              iconColor={AppColors.GOLD_PRIMARY}
              navigateIcon={FormatListBulleted}
              navigatePath={"/history/income?type=REFERRAL_BONUS"}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              icon={Layers}
              title="Level Income"
              value={loading ? "Loading..." : `${formatCurrency(incomes?.levelIncome)} USDT`}
              subtitle="Multi-level earnings"
              iconColor={AppColors.GOLD_LIGHT}
              navigateIcon={FormatListBulleted}
              navigatePath={"/history/income?type=LEVEL_INCOME"}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              icon={AttachMoney}
              title="Salary Income"
              value={loading ? "Loading..." : `${formatCurrency(incomes?.salaryIncome)} USDT`}
              subtitle="Regular salary"
              iconColor={AppColors.GOLD_PRIMARY}
              navigateIcon={FormatListBulleted}
              navigatePath={"/history/income?type=SALARY_INCOME"}
            />
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Typography
          variant="h6"
          sx={{
            color: AppColors.GOLD_PRIMARY,
            mb: 2,
            textTransform: "none",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ShowChart sx={{ fontSize: { xs: 20, sm: 28 } }} />
          Trading Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              icon={AccountBalanceWallet}
              title="Total Deposited"
              value={loading ? "Loading..." : `${formatCurrency(stats?.totalDeposited)} USDT`}
              subtitle="All-time deposits"
              iconColor={AppColors.GOLD_PRIMARY}
              navigateIcon={FormatListBulleted}
              navigatePath={"/history/totalDeposit"}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              icon={ShowChart}
              title="Total Traded Volume"
              value={loading ? "Loading..." : `${formatCurrency(stats?.totalTradedVolume)} USDT`}
              subtitle="All-time trading volume"
              iconColor={AppColors.GOLD_LIGHT}
              navigateIcon={FormatListBulleted}
              navigatePath={"/history/totaltradeVolume"}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
