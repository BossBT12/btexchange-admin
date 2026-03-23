import { Box, Typography, Grid, Card } from "@mui/material";
import { AppColors } from "../../constant/appColors";
import { AccountBalance, TrendingUp, AccountBalanceWallet } from "@mui/icons-material";

export default function AccountSummary() {
  const summaryData = [
    { label: "Total Equity", value: "0.00 USDT", icon: AccountBalance, color: AppColors.GOLD_PRIMARY },
    { label: "Available Balance", value: "0.00 USDT", icon: AccountBalanceWallet, color: AppColors.SUCCESS },
    { label: "Unrealized PNL", value: "0.00 USDT", icon: TrendingUp, color: AppColors.TXT_SUB },
  ];

  return (
    <Card
      sx={{
        bgcolor: AppColors.BG_SECONDARY,
        border: `1px solid ${AppColors.HLT_NONE}30`,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Grid container spacing={2}>
        {summaryData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Grid size={{ xs: 12, sm: 4 }} key={index}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                  bgcolor: AppColors.BG_CARD,
                  borderRadius: 2,
                  border: `1px solid ${AppColors.HLT_NONE}30`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: AppColors.GOLD_PRIMARY,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: `${item.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconComponent sx={{ color: item.color, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: AppColors.TXT_SUB,
                      fontSize: "0.75rem",
                      display: "block",
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      fontSize: "0.938rem",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
}
