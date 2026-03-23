import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Grid,
  LinearProgress,
  Divider,
  Paper,
  Button,
} from "@mui/material";
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
  Add,
} from "@mui/icons-material";
import useSnackbar from "../../hooks/useSnackbar";
import { AppColors } from "../../constant/appColors";
import tradeService from "../../services/tradeService";
import BTLoader from "../../components/Loader";

const AdminDashboard = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await tradeService.getDashboard();
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
  }, [showSnackbar]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const { users, balances, trades, deposits, withdrawals, incomes } = dashboardData || {};

  // Calculate percentages and metrics
  const userStats = {
    activePercentage: users?.totalUsers > 0 ? (users.activeUsers / users.totalUsers) * 100 : 0,
    verifiedPercentage: users?.totalUsers > 0 ? (users.verifiedUsers / users.totalUsers) * 100 : 0,
    blockedPercentage: users?.totalUsers > 0 ? (users.blockedUsers / users.totalUsers) * 100 : 0,
  };

  const tradeStats = {
    winRate: trades?.totalTrades > 0 ? (trades.winTrades / trades.totalTrades) * 100 : 0,
    lossRate: trades?.totalTrades > 0 ? (trades.lossTrades / trades.totalTrades) * 100 : 0,
  };

  return (
    <Box >
      {/* MainHeader */}
      <Box
        sx={{
          mb: { xs: 1, md: 1.5 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: AppColors.TXT_MAIN,
              background: `linear-gradient(45deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: AppColors.TXT_SUB,
              fontWeight: 400,
            }}
          >
            Comprehensive overview of trading platform performance and user analytics
          </Typography>
        </Box>
      </Box>

      {loading ?
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            bgcolor: AppColors.BG_MAIN
          }}
        >
          <BTLoader />
        </Box> :
        !dashboardData ?
          <Box sx={{ p: { xs: 1, md: 1.5 }, bgcolor: AppColors.BG_MAIN, minHeight: "100vh" }}>
            <Typography variant="h6" sx={{ color: AppColors.TXT_MAIN, textAlign: "center" }}>
              No dashboard data available
            </Typography>
          </Box> :
          <>
            {/* Key Metrics Overview */}
            <Grid container spacing={{ xs: 1, md: 1.5 }} sx={{ mb: { xs: 1, md: 1.5 } }}>
              <Grid size={{ xs: 6, md: 3 }}>
                <MetricCard
                  title="Total Users"
                  value={users?.totalUsers}
                  icon={<Person sx={{ fontSize: { xs: 20, sm: 28 } }} />}
                  trend="positive"
                  subtitle={`${users?.activeUsers} active`}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <MetricCard
                  title="Total Balance"
                  value={`$${balances?.totalBalance.toLocaleString()}`}
                  icon={<AccountBalance sx={{ fontSize: { xs: 20, sm: 28 } }} />}
                  trend="positive"
                  subtitle={`$${balances?.totalDeposited.toLocaleString()} deposited`}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <MetricCard
                  title="Total Trades"
                  value={trades?.totalTrades}
                  icon={<SwapHoriz sx={{ fontSize: { xs: 20, sm: 28 } }} />}
                  trend="neutral"
                  subtitle={`${trades?.openTrades} open`}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <MetricCard
                  title="Trading Volume"
                  value={`$${balances?.totalTradedVolume.toLocaleString()}`}
                  icon={<ShowChart sx={{ fontSize: { xs: 20, sm: 28 } }} />}
                  trend="positive"
                  subtitle="All time volume"
                />
              </Grid>
            </Grid>

            {/* User Analytics */}
            <Grid container spacing={{ xs: 1, md: 1.5 }} sx={{ mb: { xs: 1, md: 1.5 } }}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <DashboardCard
                  title="User Analytics"
                  subtitle="Breakdown of user status and verification"
                >
                  <Grid container spacing={{ xs: 1, md: 1.5 }}>
                    <Grid size={3}>
                      <UserStatItem
                        label="Total"
                        value={users.totalUsers}
                        percentage={100}
                        color={AppColors.GOLD_DARK}
                        icon={<Group />}
                      />
                    </Grid>
                    <Grid size={3}>
                      <UserStatItem
                        label="Active"
                        value={users.activeUsers}
                        percentage={userStats.activePercentage}
                        color={AppColors.SUCCESS}
                        icon={<VerifiedUser />}
                      />
                    </Grid>
                    <Grid size={3}>
                      <UserStatItem
                        label="Verified"
                        value={users.verifiedUsers}
                        percentage={userStats.verifiedPercentage}
                        color={AppColors.SUCCESS}
                        icon={<VerifiedUser />}
                      />
                    </Grid>
                    <Grid size={3}>
                      <UserStatItem
                        label="Blocked"
                        value={users.blockedUsers}
                        percentage={userStats.blockedPercentage}
                        color={AppColors.ERROR}
                        icon={<Block />}
                      />
                    </Grid>
                  </Grid>
                </DashboardCard>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <DashboardCard
                  title="Trading Performance"
                  subtitle="Win/Loss ratio and trade statistics"
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h3" sx={{ color: AppColors.SUCCESS, fontWeight: 700 }}>
                          {trades.winTrades}
                        </Typography>
                        <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                          Winning Trades
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700 }}>
                          {tradeStats.winRate.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                          Win Rate
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h3" sx={{ color: AppColors.ERROR, fontWeight: 700 }}>
                          {trades.lossTrades}
                        </Typography>
                        <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                          Losing Trades
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={tradeStats.winRate}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: AppColors.BG_SECONDARY,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: AppColors.SUCCESS,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                </DashboardCard>
              </Grid>
            </Grid>

            {/* Financial Overview */}
            <Grid container spacing={{ xs: 1, md: 1.5 }} sx={{ mb: { xs: 1, md: 1.5 } }}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <DashboardCard
                  title="Financial Overview"
                  subtitle="Detailed breakdown of platform finances"
                >
                  <Grid container spacing={{ xs: 1, md: 1.5 }}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <FinancialMetric
                        label="Total Deposited"
                        value={balances.totalDeposited}
                        count={deposits.count}
                        color={AppColors.SUCCESS}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <FinancialMetric
                        label="Winning Balance"
                        value={balances.totalWinningBalance}
                        count={null}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <FinancialMetric
                        label="Withdrawable"
                        value={balances.totalWithdrawableWinnings}
                        count={null}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <FinancialMetric
                        label="Lock Balance"
                        value={balances.totalLockBalance}
                        count={null}
                        color={AppColors.TXT_SUB}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: { xs: 1, md: 1.5 }, borderColor: AppColors.BG_SECONDARY }} />

                  <Grid container spacing={{ xs: 1, md: 1.5 }}>
                    <Grid size={{ xs: 6, md: 4 }}>
                      <FinancialMetric
                        label="Gross Trade Amount"
                        value={trades.totalGrossAmount}
                        count={trades.totalTrades}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
                      <FinancialMetric
                        label="Net Trade Amount"
                        value={trades.totalNetTradeAmount}
                        count={null}
                        color={AppColors.SUCCESS}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
                      <FinancialMetric
                        label="Fee Amount"
                        value={trades.totalFeeAmount}
                        count={null}
                        color={AppColors.TXT_SUB}
                      />
                    </Grid>
                  </Grid>
                </DashboardCard>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <DashboardCard
                  title="Income Breakdown"
                  subtitle="Platform revenue sources"
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 1.5 } }}>
                    <IncomeItem
                      label="Referral Income"
                      value={balances.totalReferralIncome}
                      count={incomes.referralBonus.count}
                      icon={<Person />}
                    />
                    <IncomeItem
                      label="Level Income"
                      value={balances.totalLevelIncome}
                      count={incomes.levelIncome.count}
                      icon={<TrendingUp />}
                    />
                    <IncomeItem
                      label="Working Income"
                      value={balances.totalWorkingIncome}
                      count={null}
                      icon={<MonetizationOn />}
                    />
                    <IncomeItem
                      label="Salary Income"
                      value={balances.totalSalaryIncome}
                      count={incomes.salaryIncome.count}
                      icon={<Savings />}
                    />
                    <Divider sx={{ borderColor: AppColors.BG_SECONDARY }} />
                    <Box sx={{
                      p: { xs: 1, md: 1.5 },
                      backgroundColor: AppColors.HLT_LIGHT,
                      borderRadius: 2,
                      border: `1px solid ${AppColors.GOLD_DARK}30`
                    }}>
                      <Typography variant="h5" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700 }}>
                        ${incomes.totalIncomeAmount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                        Total Platform Income
                      </Typography>
                    </Box>
                  </Box>
                </DashboardCard>
              </Grid>
            </Grid>

            {/* Withdrawal Statistics */}
            <Grid container spacing={{ xs: 1, md: 1.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DashboardCard
                  title="Withdrawal Statistics"
                  subtitle="Winnings and working capital withdrawals"
                >
                  <Grid container spacing={{ xs: 1, md: 1.5 }}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', px: { xs: 1, md: 1.5 } }}>
                        <Typography variant="h4" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700, mb: 0.5 }}>
                          ${withdrawals.withdrawWinnings.totalAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, mb: { xs: 1, md: 1.5 } }}>
                          Winnings Withdrawn
                        </Typography>
                        <Typography variant="caption" sx={{
                          color: AppColors.TXT_SUB,
                          backgroundColor: AppColors.BG_SECONDARY,
                          px: { xs: 1, md: 1.5 },
                          py: 0.5,
                          borderRadius: 1
                        }}>
                          {withdrawals.withdrawWinnings.count} transactions
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', px: { xs: 1, md: 1.5 } }}>
                        <Typography variant="h4" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700, mb: 0.5 }}>
                          ${withdrawals.withdrawWorking.totalAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, mb: { xs: 1, md: 1.5 } }}>
                          Working Capital
                        </Typography>
                        <Typography variant="caption" sx={{
                          color: AppColors.TXT_SUB,
                          backgroundColor: AppColors.BG_SECONDARY,
                          px: { xs: 1, md: 1.5 },
                          py: 0.5,
                          borderRadius: 1
                        }}>
                          {withdrawals.withdrawWorking.count} transactions
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </DashboardCard>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DashboardCard
                  title="Quick Stats"
                  subtitle="Key platform metrics at a glance"
                >
                  <Grid container spacing={{ xs: 1, md: 1.5 }}>
                    <Grid size={{ xs: 3 }}>
                      <QuickStatItem
                        label="Deleted Users"
                        value={users.deletedUsers}
                        color={AppColors.ERROR}
                      />
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <QuickStatItem
                        label="Open Trades"
                        value={trades.openTrades}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <QuickStatItem
                        label="Deposit Count"
                        value={deposits.count}
                        color={AppColors.SUCCESS}
                      />
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <QuickStatItem
                        label="Total Income Events"
                        value={incomes.referralBonus.count + incomes.levelIncome.count + incomes.salaryIncome.count}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                  </Grid>
                </DashboardCard>
              </Grid>
            </Grid>
          </>
      }
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
      p: { xs: 1, md: 1.5 },
      height: '100%',
      background: `linear-gradient(135deg, ${AppColors.BG_CARD} 0%, ${AppColors.BG_SECONDARY} 100%)`,
    }}
  >
    <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
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
      p: { xs: 1, md: 1.5 },
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
  <Box sx={{ textAlign: 'left', px: { xs: 1, md: 1.5 }, py: { xs: 0.5, md: 1 } }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 0.5, md: 1 }, mb: { xs: 0.5, md: 1 } }}>
      <Box
        sx={{
          display: 'inline-flex',
          p: { xs: 0.5, md: 1 },
          borderRadius: 3,
          backgroundColor: `${color}20`,
          color: color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: AppColors.TXT_SUB,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: AppColors.TXT_MAIN,
            fontWeight: 700,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>

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
  <Box sx={{ textAlign: 'center', px: { xs: 1, md: 1.5 }, py: { xs: 0.5, md: 1 } }}>
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

// Income Item Component
const IncomeItem = ({ label, value, count, icon }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 }, px: { xs: 1, md: 1.5 }, py: { xs: 0.5, md: 1 }, borderRadius: 2, backgroundColor: `${AppColors.BG_SECONDARY}50` }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: { xs: 25, md: 35 },
        height: { xs: 25, md: 35 },
        borderRadius: 2,
        backgroundColor: `${AppColors.GOLD_DARK}20`,
        color: AppColors.GOLD_DARK,
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
  <Box sx={{ textAlign: 'center', px: { xs: 1, md: 1.5 } }}>
    <Typography
      variant="h4"
      sx={{
        color: color,
        fontWeight: 700,
        mb: 0.5,
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

export default AdminDashboard;