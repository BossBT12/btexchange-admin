import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
} from "@mui/material";
import { AppColors } from "../../constant/appColors";
import { CheckCircle, AccessTime } from "@mui/icons-material";

/* ---------------- PROGRESS BAR ---------------- */
function ProgressBar({ value = 0 }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: 8,
        bgcolor: AppColors.BG_CARD,
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: "100%",
          borderRadius: 4,
          bgcolor: AppColors.BG_CARD,
          "& .MuiLinearProgress-bar": {
            background: `linear-gradient(90deg, ${AppColors.GOLD_PRIMARY} 0%, ${AppColors.GOLD_LIGHT} 100%)`,
            borderRadius: 4,
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: `${value}%`,
          transform: "translate(-50%, -50%)",
          width: 16,
          height: 16,
          borderRadius: "50%",
          bgcolor: AppColors.GOLD_PRIMARY,
          border: `2px solid ${AppColors.BG_CARD}`,
          boxShadow: `0 0 8px ${AppColors.GOLD_PRIMARY}60`,
        }}
      />
    </Box>
  );
}

/* ---------------- TIMER BOX ---------------- */
function TimerBox({ value, label }) {
  return (
    <Box
      sx={{
        border: `2px solid ${AppColors.GOLD_PRIMARY}60`,
        borderRadius: 2,
        px: 3,
        py: 2,
        textAlign: "center",
        minWidth: 70,
        bgcolor: AppColors.BG_CARD,
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: AppColors.GOLD_PRIMARY,
          transform: "translateY(-2px)",
          boxShadow: `0 4px 12px ${AppColors.GOLD_PRIMARY}30`,
        },
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: AppColors.GOLD_PRIMARY,
        }}
      >
        {String(value).padStart(2, "0")}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: AppColors.TXT_SUB,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

/* ---------------- REWARD CARD ---------------- */
function RewardCard({
  amount,
  subtitle,
  title,
  description,
  progress,
  conditions = [],
  claimed = false,
  buttonLabel,
  onButtonClick,
}) {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        border: `1px solid ${claimed ? AppColors.HLT_NONE : AppColors.GOLD_PRIMARY}40`,
        borderRadius: 3,
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: AppColors.BG_CARD,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: claimed
            ? AppColors.HLT_NONE
            : `linear-gradient(90deg, ${AppColors.GOLD_PRIMARY} 0%, ${AppColors.GOLD_LIGHT} 100%)`,
        },
        "&:hover": {
          borderColor: claimed ? AppColors.HLT_NONE : AppColors.GOLD_PRIMARY,
          transform: "translateY(-4px)",
          boxShadow: claimed
            ? "none"
            : `0 12px 32px ${AppColors.GOLD_PRIMARY}25`,
        },
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: AppColors.GOLD_PRIMARY,
            mb: 0.5,
          }}
        >
          {amount}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: AppColors.GOLD_PRIMARY,
            fontWeight: 500,
          }}
        >
          {subtitle}
        </Typography>
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 1.5,
          color: AppColors.TXT_MAIN,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: AppColors.TXT_SUB, mb: 3 }}
      >
        {description}
      </Typography>

      {conditions.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {conditions.map((c, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: AppColors.GOLD_PRIMARY,
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: AppColors.TXT_SUB, fontSize: "0.813rem" }}
              >
                {c}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ mt: "auto" }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography
            variant="caption"
            sx={{ color: AppColors.TXT_SUB, fontSize: "0.813rem" }}
          >
            Task Progress:
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: AppColors.GOLD_PRIMARY,
              fontWeight: 600,
              fontSize: "0.813rem",
            }}
          >
            {progress}%
          </Typography>
        </Box>

        <ProgressBar value={progress} />

        <Button
          disabled={claimed}
          fullWidth
          className={claimed ? "" : "btn-primary"}
          onClick={() => {
            if (!claimed && onButtonClick) {
              onButtonClick();
            } else if (!claimed && buttonLabel === "Deposit Now") {
              navigate("/deposit");
            } else if (!claimed && (buttonLabel === "Trade Now" || buttonLabel === "Copy Now")) {
              navigate("/trade");
            }
          }}
          sx={{
            mt: 3,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.938rem",
            borderRadius: 2,
            ...(claimed && {
              bgcolor: AppColors.HLT_NONE,
              color: AppColors.TXT_SUB,
              opacity: 0.5,
              "&:disabled": {
                bgcolor: AppColors.HLT_NONE,
                color: AppColors.TXT_SUB,
              },
            }),
          }}
        >
          {buttonLabel}
        </Button>
      </Box>
    </Box>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function WelcomeRewards() {
  const countdownEnd = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;

  const [timeLeft, setTimeLeft] = useState(getRemainingTime());

  function getRemainingTime() {
    const now = new Date().getTime();
    const diff = Math.max(countdownEnd - now, 0);

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      mins: Math.floor((diff / (1000 * 60)) % 60),
      secs: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 0 } }}>
      {/* HEADER */}
      {/* <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 4,
          mb: { xs: 6, lg: 8 },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: AppColors.TXT_MAIN,
            background: `linear-gradient(135deg, ${AppColors.TXT_MAIN} 0%, ${AppColors.GOLD_PRIMARY} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          New User Welcome Rewards
        </Typography>

        <Box sx={{
          display: "flex",
          gap: { xs: 1, sm: 1.5, md: 2 },
          flexWrap: "wrap",
          justifyContent: { xs: "center", md: "flex-end" },
        }}>
          <TimerBox value={timeLeft.days} label="Day" />
          <TimerBox value={timeLeft.hours} label="Hour" />
          <TimerBox value={timeLeft.mins} label="Min" />
          <TimerBox value={timeLeft.secs} label="Sec" />
        </Box>
      </Box> */}

      {/* CARDS */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <RewardCard
            amount="10 USDT"
            subtitle="Trial fund coupon"
            title="Sign Up Reward"
            description="Sign up now and receive a 10 USDT Trial Fund!"
            progress={100}
            claimed
            buttonLabel="Claimed"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <RewardCard
            amount="50 USDT"
            subtitle="Mystery Box"
            title="Deposit Reward"
            description="Deposit ≥ 100 USDT & hold assets for 3 days."
            progress={0}
            conditions={["Net Deposit ≥ 100 USDT", "Hold Assets for 3 Days"]}
            buttonLabel="Deposit Now"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <RewardCard
            amount="50 USDT"
            subtitle="Mystery Box"
            title="Futures Trading Reward"
            description="Complete futures trading volume ≥ 5000 USDT."
            progress={0}
            buttonLabel="Trade Now"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <RewardCard
            amount="50 USDT"
            subtitle="Mystery Box"
            title="Copy Trade Reward"
            description="Complete 3 copy trades to receive reward."
            progress={0}
            buttonLabel="Copy Now"
          />
        </Grid>
      </Grid>
    </Container>
  );
}
