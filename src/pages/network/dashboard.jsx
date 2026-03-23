import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Grid,
  LinearProgress,
  Divider,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  TrendingUp,
  AccountBalance,
  SwapHoriz,
  MonetizationOn,
  Savings,
  Group,
  VerifiedUser,
  Block,
  ShowChart,
  Person,
} from "@mui/icons-material";
import useSnackbar from "../../hooks/useSnackbar";
import { AppColors } from "../../constant/appColors";
import networkService from "../../services/networkService";

const NetworkDashboard = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await networkService.getDashboard();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          showSnackbar("Failed to load dashboard data", "error");
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        showSnackbar(
          error.response?.data?.message || "Failed to load dashboard data",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [showSnackbar]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          bgcolor: AppColors.BG_MAIN
        }}
      >
        <CircularProgress sx={{ color: AppColors.GOLD_DARK }} />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3, bgcolor: AppColors.BG_MAIN, minHeight: "100vh" }}>
        <Typography variant="h6" sx={{ color: AppColors.TXT_MAIN, textAlign: "center" }}>
          No dashboard data available
        </Typography>
      </Box>
    );
  }

  const { users, investments, wallets, transactions } = dashboardData;

  // Calculate percentages and metrics
  const userStats = {
    activePercentage: users.total > 0 ? (users.active / users.total) * 100 : 0,
    blockedPercentage: users.total > 0 ? (users.blocked / users.total) * 100 : 0,
  };

  return (
    <Box>
      {/* MainHeader */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: AppColors.TXT_MAIN,
            mb: 1,
            background: `linear-gradient(45deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Network Admin Dashboard
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: AppColors.TXT_SUB,
            fontWeight: 400
          }}
        >
          Comprehensive overview of network platform performance and user analytics
        </Typography>
      </Box>

      {/* Key Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: { xs: 2, md: 4 } }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <MetricCard
            title="Total Users"
            value={users.total}
            icon={<Person sx={{ fontSize: { xs: 20, sm: 28 } }} />}
            trend="positive"
            subtitle={`${users.active} active`}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <MetricCard
            title="Total Investments"
            value={investments.total}
            icon={<AccountBalance sx={{ fontSize: { xs: 20, sm: 28 } }} />}
            trend="positive"
            subtitle={`$${investments.totalAmount.toLocaleString()}`}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <MetricCard
            title="Main Balance"
            value={`$${wallets.totalMainBalance.toLocaleString()}`}
            icon={<MonetizationOn sx={{ fontSize: { xs: 20, sm: 28 } }} />}
            trend="positive"
            subtitle="Total platform balance"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <MetricCard
            title="Withdrawable"
            value={`$${wallets.totalWithdrawable.toLocaleString()}`}
            icon={<Savings sx={{ fontSize: { xs: 20, sm: 28 } }} />}
            trend="positive"
            subtitle="Available for withdrawal"
          />
        </Grid>
      </Grid>

      {/* User Analytics */}
      <Grid container spacing={3} sx={{ mb: { xs: 2, md: 4 } }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <DashboardCard
            title="User Analytics"
            subtitle="Breakdown of user status and activity"
          >
            <Grid container spacing={2}>
              <Grid size={3}>
                <UserStatItem
                  label="Total"
                  value={users.total}
                  percentage={100}
                  color={AppColors.GOLD_DARK}
                  icon={<Group />}
                />
              </Grid>
              <Grid size={3}>
                <UserStatItem
                  label="Active"
                  value={users.active}
                  percentage={userStats.activePercentage}
                  color={AppColors.SUCCESS}
                  icon={<VerifiedUser />}
                />
              </Grid>
              <Grid size={3}>
                <UserStatItem
                  label="Blocked"
                  value={users.blocked}
                  percentage={userStats.blockedPercentage}
                  color={AppColors.ERROR}
                  icon={<Block />}
                />
              </Grid>
              <Grid size={3}>
                <UserStatItem
                  label="New Today"
                  value={users.newToday}
                  percentage={users.total > 0 ? (users.newToday / users.total) * 100 : 0}
                  color={AppColors.GOLD_DARK}
                  icon={<TrendingUp />}
                />
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <DashboardCard
            title="Investment Overview"
            subtitle="Platform investment statistics"
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700 }}>
                    {investments.total}
                  </Typography>
                  <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                    Total Investments
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" sx={{ color: AppColors.SUCCESS, fontWeight: 700 }}>
                    ${investments.totalAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                    Total Amount
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Financial Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <DashboardCard
            title="Financial Overview"
            subtitle="Detailed breakdown of platform finances"
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 6, md: 3 }}>
                <FinancialMetric
                  label="Total Deposits"
                  value={transactions.total.deposits.total}
                  count={transactions.total.deposits.count}
                  color={AppColors.SUCCESS}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <FinancialMetric
                  label="Total Withdrawals"
                  value={transactions.total.withdrawals.total}
                  count={transactions.total.withdrawals.count}
                  color={AppColors.ERROR}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <FinancialMetric
                  label="Today Deposits"
                  value={transactions.today.deposits.total}
                  count={transactions.today.deposits.count}
                  color={AppColors.GOLD_DARK}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <FinancialMetric
                  label="Today Withdrawals"
                  value={transactions.today.withdrawals.total}
                  count={transactions.today.withdrawals.count}
                  color={AppColors.GOLD_DARK}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: AppColors.BG_SECONDARY }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 6, md: 4 }}>
                <FinancialMetric
                  label="Main Balance"
                  value={wallets.totalMainBalance}
                  count={null}
                  color={AppColors.GOLD_DARK}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <FinancialMetric
                  label="Withdrawable"
                  value={wallets.totalWithdrawable}
                  count={null}
                  color={AppColors.SUCCESS}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <FinancialMetric
                  label="Net Balance"
                  value={wallets.totalMainBalance - wallets.totalWithdrawable}
                  count={null}
                  color={AppColors.TXT_SUB}
                />
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardCard
            title="Transaction Summary"
            subtitle="Today's transaction activity"
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TransactionItem
                label="Deposits Today"
                value={transactions.today.deposits.total}
                count={transactions.today.deposits.count}
                icon={<TrendingUp />}
                color={AppColors.SUCCESS}
              />
              <TransactionItem
                label="Withdrawals Today"
                value={transactions.today.withdrawals.total}
                count={transactions.today.withdrawals.count}
                icon={<SwapHoriz />}
                color={AppColors.ERROR}
              />
              <Divider sx={{ borderColor: AppColors.BG_SECONDARY }} />
              <Box sx={{
                p: 2,
                backgroundColor: AppColors.HLT_LIGHT,
                borderRadius: 2,
                border: `1px solid ${AppColors.GOLD_DARK}30`
              }}>
                <Typography variant="h5" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700 }}>
                  ${(transactions.today.deposits.total - transactions.today.withdrawals.total).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                  Net Flow Today
                </Typography>
              </Box>
            </Box>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardCard
            title="Quick Stats"
            subtitle="Key platform metrics at a glance"
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <QuickStatItem
                  label="Blocked Users"
                  value={users.blocked}
                  color={AppColors.ERROR}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickStatItem
                  label="New Today"
                  value={users.newToday}
                  color={AppColors.GOLD_DARK}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickStatItem
                  label="Total Deposits"
                  value={transactions.total.deposits.count}
                  color={AppColors.SUCCESS}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <QuickStatItem
                  label="Total Withdrawals"
                  value={transactions.total.withdrawals.count}
                  color={AppColors.GOLD_DARK}
                />
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardCard
            title="Wallet Summary"
            subtitle="Platform wallet balances"
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700, mb: 1 }}>
                    ${wallets.totalMainBalance.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, mb: 2 }}>
                    Main Balance
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700, mb: 1 }}>
                    ${wallets.totalWithdrawable.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, mb: 2 }}>
                    Withdrawable
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// Reusable Dashboard Card Component
const DashboardCard = ({ title, subtitle, children }) => (
  <Paper
    elevation={0}
    sx={{
      backgroundColor: AppColors.BG_CARD,
      border: `1px solid ${AppColors.BG_SECONDARY}`,
      borderRadius: 3,
      p: { xs: 2, md: 3 },
      height: '100%',
      background: `linear-gradient(135deg, ${AppColors.BG_CARD} 0%, ${AppColors.BG_SECONDARY} 100%)`,
    }}
  >
    <Box sx={{ mb: { xs: 2, md: 3 } }}>
      <Typography
        variant="h6"
        sx={{
          color: AppColors.TXT_MAIN,
          fontWeight: 600,
          mb: { xs: 0.5, md: 1 },
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: AppColors.TXT_SUB,
          fontSize: '0.875rem',
        }}
      >
        {subtitle}
      </Typography>
    </Box>
    {children}
  </Paper>
);

// Metric Card Component
const MetricCard = ({ title, value, icon, trend, subtitle }) => (
  <Paper
    elevation={0}
    sx={{
      backgroundColor: AppColors.BG_CARD,
      border: `1px solid ${AppColors.BG_SECONDARY}`,
      borderRadius: 3,
      p: { xs: 2, md: 3 },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: { xs: 1, md: 2 } }}>
      <Box>
        <Typography
          variant="h4"
          sx={{
            color: AppColors.GOLD_DARK,
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: AppColors.TXT_MAIN,
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          p: { xs: 1, md: 1.5 },
          borderRadius: 2,
          backgroundColor: `${AppColors.GOLD_DARK}20`,
          color: AppColors.GOLD_DARK,
        }}
      >
        {icon}
      </Box>
    </Box>
    <Typography
      variant="caption"
      sx={{
        color: AppColors.TXT_SUB,
        fontSize: '0.75rem',
      }}
    >
      {subtitle}
    </Typography>
  </Paper>
);

// User Statistics Item
const UserStatItem = ({ label, value, percentage, color, icon }) => (
  <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
    <Box
      sx={{
        display: 'inline-flex',
        p: { xs: 1, md: 1.5 },
        borderRadius: 3,
        backgroundColor: `${color}20`,
        color: color,
        mb: { xs: 1, md: 2 },
      }}
    >
      {icon}
    </Box>
    <Typography
      variant="h5"
      sx={{
        color: AppColors.TXT_MAIN,
        fontWeight: 700,
        mb: { xs: 0.5, md: 1 },
      }}
    >
      {value}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: AppColors.TXT_SUB,
        mb: { xs: 0.5, md: 1 },
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: AppColors.GOLD_DARK,
        fontWeight: 600,
        backgroundColor: `${AppColors.GOLD_DARK}15`,
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
      }}
    >
      {percentage.toFixed(1)}%
    </Typography>
  </Box>
);

// Financial Metric Component
const FinancialMetric = ({ label, value, count, color }) => (
  <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
    <Typography
      variant="h5"
      sx={{
        color: color,
        fontWeight: 700,
        mb: { xs: 0.5, md: 1 },
      }}
    >
      ${value.toLocaleString()}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: AppColors.TXT_SUB,
        mb: count ? { xs: 0.5, md: 1 } : 0,
      }}
    >
      {label}
    </Typography>
    {count !== null && (
      <Typography
        variant="caption"
        sx={{
          color: AppColors.TXT_SUB,
          backgroundColor: AppColors.BG_SECONDARY,
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
        }}
      >
        {count} {count === 1 ? 'transaction' : 'transactions'}
      </Typography>
    )}
  </Box>
);

// Transaction Item Component
const TransactionItem = ({ label, value, count, icon, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, backgroundColor: `${AppColors.BG_SECONDARY}50` }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 2,
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="body2"
        sx={{
          color: AppColors.TXT_SUB,
          fontSize: '0.875rem',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: AppColors.TXT_MAIN,
          fontWeight: 600,
        }}
      >
        ${value.toLocaleString()}
      </Typography>
    </Box>
    {count !== null && count > 0 && (
      <Typography
        variant="caption"
        sx={{
          color: AppColors.TXT_SUB,
          backgroundColor: AppColors.BG_SECONDARY,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
        }}
      >
        {count}
      </Typography>
    )}
  </Box>
);

// Quick Stat Item Component
const QuickStatItem = ({ label, value, color }) => (
  <Box sx={{ textAlign: 'center', p: 2 }}>
    <Typography
      variant="h4"
      sx={{
        color: color,
        fontWeight: 700,
        mb: 1,
      }}
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: AppColors.TXT_SUB,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {label}
    </Typography>
  </Box>
);

export default NetworkDashboard;
