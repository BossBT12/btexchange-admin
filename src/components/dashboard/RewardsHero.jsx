import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { AppColors } from "../../constant/appColors";
import { CardGiftcard, ShoppingCart, LocalOffer } from "@mui/icons-material";

export default function RewardsHero() {
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: AppColors.BG_SECONDARY,
        position: "relative",
        overflow: "hidden",
        py: { xs: 6, md: 10 },
        mb: { xs: 4, md: 6 },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 50%, ${AppColors.GOLD_PRIMARY}15 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, ${AppColors.GOLD_PRIMARY}10 0%, transparent 50%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, lg: 7 }}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: AppColors.GOLD_PRIMARY,
                  fontWeight: 600,
                  mb: 2,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                New User Exclusive Rewards
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 4,
                  lineHeight: 1.2,
                  color: AppColors.TXT_MAIN,
                  background: `linear-gradient(135deg, ${AppColors.TXT_MAIN} 0%, ${AppColors.GOLD_PRIMARY} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Deposit, trade, and
                <br />
                claim your rewards!
              </Typography>

              {/* Stats Cards */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: 1.5, sm: 2 },
                  mt: { xs: 3, sm: 4 },
                }}
              >
                {/* Total FreeU */}
                <Box
                  sx={{
                    bgcolor: AppColors.BG_CARD,
                    border: `1px solid ${AppColors.HLT_NONE}`,
                    borderRadius: 2,
                    px: { xs: 2, sm: 2.5, md: 3 },
                    py: { xs: 2, sm: 2.25, md: 2.5 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: { xs: 1.5, sm: 2 },
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: AppColors.GOLD_PRIMARY,
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 24px ${AppColors.GOLD_PRIMARY}20`,
                    },
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: AppColors.TXT_SUB }}
                    >
                      Total FreeU Earned
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mt: 0.5 }}
                    >
                      0 FreeU
                    </Typography>
                  </Box>
                  <Button
                    className="btn-primary"
                    size="small"
                    sx={{
                      textTransform: "none",
                      px: 2,
                    }}
                  >
                    Exchange USDT
                  </Button>
                </Box>

                {/* Mystery Box */}
                <Box
                  sx={{
                    bgcolor: AppColors.BG_CARD,
                    border: `1px solid ${AppColors.HLT_NONE}`,
                    borderRadius: 2,
                    px: 3,
                    py: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: AppColors.GOLD_PRIMARY,
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 24px ${AppColors.GOLD_PRIMARY}20`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: `${AppColors.GOLD_PRIMARY}20`,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CardGiftcard sx={{ color: AppColors.GOLD_PRIMARY, fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: AppColors.TXT_SUB }}
                    >
                      Open Mystery Box
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mt: 0.5 }}
                    >
                      0 available
                    </Typography>
                  </Box>
                </Box>

                {/* Coupons */}
                <Box
                  sx={{
                    bgcolor: AppColors.BG_CARD,
                    border: `1px solid ${AppColors.HLT_NONE}`,
                    borderRadius: 2,
                    px: 3,
                    py: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: AppColors.GOLD_PRIMARY,
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 24px ${AppColors.GOLD_PRIMARY}20`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: `${AppColors.GOLD_PRIMARY}20`,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LocalOffer sx={{ color: AppColors.GOLD_PRIMARY, fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: AppColors.TXT_SUB }}
                    >
                      My Coupons
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mt: 0.5 }}
                    >
                      1 available
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Visual */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box
              sx={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: { xs: 4, lg: 0 },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 400,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: -20,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${AppColors.GOLD_PRIMARY}30 0%, transparent 70%)`,
                    filter: "blur(40px)",
                    animation: "pulse 3s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
                      "50%": { opacity: 1, transform: "scale(1.1)" },
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: { xs: 300, md: 400 },
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `2px solid ${AppColors.GOLD_PRIMARY}30`,
                    boxShadow: `0 8px 32px ${AppColors.GOLD_PRIMARY}20`,
                    background: `linear-gradient(135deg, ${AppColors.BG_CARD} 0%, ${AppColors.BG_SECONDARY} 100%)`,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `radial-gradient(circle at center, ${AppColors.GOLD_PRIMARY}15 0%, transparent 70%)`,
                    }}
                  >
                    <CardGiftcard
                      sx={{
                        fontSize: { xs: 120, md: 160 },
                        color: AppColors.GOLD_PRIMARY,
                        opacity: 0.3,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
