import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, IconButton, Stack, Paper } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import useSnackbar from "../../../hooks/useSnackbar";
import tradeService from "../../../services/tradeService";
import BTLoader from "../../../components/Loader";
import { AppColors } from "../../../constant/appColors";
import { FONT_SIZE } from "../../../constant/lookUpConstant";

/** Merge common API shapes (flat user, nested stats, otherInfo, etc.) */
function mergeUserPayload(raw) {
  if (!raw || typeof raw !== "object") return {};
  const user = raw.user ? raw.user : {};
  const balances = raw.balances ? raw.balances : {};
  const stats = raw.stats ? raw.stats : {};
  const personalData = raw.personalData ? raw.personalData : {};
  const incomes = raw.incomes ? raw.incomes : {};
  const teamData = raw.teamData ? raw.teamData : {};
  return {
    ...user,
    ...balances,
    ...stats,
    ...personalData,
    ...incomes,
    ...teamData,
  };
}

const camelToSnake = (s) => s.replace(/[A-Z]/g, (ch) => `_${ch.toLowerCase()}`);

function pickStat(obj, keys) {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
    const snake = camelToSnake(k);
    if (obj[snake] !== undefined && obj[snake] !== null) return obj[snake];
  }
  return undefined;
}

/** Format numeric values and honor currency-only fields */
function formatStatValue(val, isCurrency = false) {
  if (val === undefined || val === null || val === "") return "0";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  const s = String(val).trim();
  const n = Number(s);
  if (!Number.isNaN(n) && s !== "" && /^-?\d/.test(s)) {
    if (isCurrency) {
      const fixed = n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `$ ${fixed}`;
    }
    return n;
  }
  return String(val);
}

const PERSONAL_FIELDS = [
  {
    label: "Total deposit",
    keys: ["todayDeposit", "totalDeposited"],
    isCurrency: true,
  },
  { label: "Today deposit", keys: ["todayDirect"], isCurrency: true },
  { label: "Total trade", keys: ["totalTradedVolume"] },
  { label: "Today trade", keys: ["todayTradeVolume"] },
  {
    label: "Total withdraw",
    keys: ["totalWithdraw", "totalWithdrawal"],
    isCurrency: true,
  },
  { label: "Today withdraw", keys: ["todayWithdraw"], isCurrency: true },
  { label: "Total salary", keys: ["salaryIncome"], isCurrency: true },
  { label: "Today salary", keys: ["todaySalary"], isCurrency: true },
];

const TEAM_FIELDS = [
  { label: "Total team trade", keys: ["totalTeamTrade"] },
  { label: "Today team trade", keys: ["todayTeamTrade"] },
  { label: "Total direct", keys: ["totalDirect"] },
  { label: "Today direct", keys: ["todayDirect"] },
  {
    label: "Total direct business",
    keys: ["totalDirectBusiness"],
    isCurrency: true,
  },
  {
    label: "Today direct business",
    keys: ["todayDirectBusiness"],
    isCurrency: true,
  },
  { label: "Total team", keys: ["totalTeam"] },
  { label: "Today team", keys: ["todayTeam"] },
  {
    label: "Total team business",
    keys: ["totalTeamBusiness"],
    isCurrency: true,
  },
  {
    label: "Today team business",
    keys: ["todayTeamBusiness"],
    isCurrency: true,
  },

  { label: "Total team salary", keys: ["totalTeamSalary"], isCurrency: true },
  { label: "Today team salary", keys: ["todayTeamSalary"], isCurrency: true },

  {
    label: "Total team withdrawal",
    keys: ["totalTeamWithdrawal"],
    isCurrency: true,
  },
  {
    label: "Today team withdrawal",
    keys: ["todayTeamWithdrawal"],
    isCurrency: true,
  },
  {
    label: "Total team withdrawal balance",
    keys: ["totalTeamWithdrawalBalance"],
    isCurrency: true,
  },
];

const ROW_BORDER = `1px solid rgba(255, 255, 255, 0.08)`;

function SectionTitle({ title }) {
  return (
    <Typography
      component="h2"
      sx={{
        color: AppColors.TXT_MAIN,
        fontWeight: 600,
        fontSize: { xs: "1.05rem", sm: "1.15rem", md: "1.2rem" },
        mb: 1.5,
        letterSpacing: "0.02em",
      }}
    >
      {title}
    </Typography>
  );
}

function InfoList({ fields, merged }) {
  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {fields.map(({ label, keys, isCurrency }, index) => (
        <Box
          key={label}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            py: { xs: 1.25, sm: 1.4 },
            px: { xs: 1.5, sm: 2 },
            borderBottom: index < fields.length - 1 ? ROW_BORDER : "none",
          }}
        >
          <Typography
            sx={{
              color: AppColors.TXT_SUB,
              fontWeight: 400,
              fontSize: FONT_SIZE.BODY,
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              color: AppColors.TXT_MAIN,
              fontWeight: 500,
              fontSize: FONT_SIZE.BODY,
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {formatStatValue(pickStat(merged, keys), isCurrency)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

const UserData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalLoading, setModalLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const { showSnackbar } = useSnackbar();

  const fetchUserDetails = useCallback(async () => {
    try {
      setModalLoading(true);
      const params = { id };
      const response = await tradeService.getUserDetails(params);

      if (response.success) {
        const userData = response.data;
        console.log("userData: ", userData);
        const merged = mergeUserPayload(userData);
        console.log("merged: ", merged);
        setUserDetails(merged);
      } else {
        showSnackbar("Failed to fetch user details", "error");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      showSnackbar("Error fetching user details", "error");
    } finally {
      setModalLoading(false);
    }
  }, [id, showSnackbar]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const displayName = useMemo(() => {
    const n =
      userDetails?.fullName ||
      userDetails?.name ||
      userDetails?.username ||
      userDetails?.email ||
      "";
    return n || "User";
  }, [userDetails]);

  const displayUid = userDetails?.UID || userDetails?.uid || id || "—";

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 2 }}>
        <IconButton
          onClick={() => navigate("/manage-users")}
          aria-label="Back to manage users"
          sx={{
            color: AppColors.GOLD_DARK,
            border: `1px solid ${AppColors.BG_SECONDARY}`,
            bgcolor: AppColors.BG_CARD,
            "&:hover": {
              bgcolor: `${AppColors.GOLD_DARK}14`,
              borderColor: `${AppColors.GOLD_DARK}66`,
            },
          }}
        >
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h5"
            sx={{
              color: AppColors.TXT_MAIN,
              fontWeight: 700,
              fontSize: { xs: "1.15rem", sm: FONT_SIZE.HEADER },
              mb: 0.5,
            }}
          >
            User overview
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: AppColors.TXT_SUB, fontSize: FONT_SIZE.CAPTION }}
          >
            {displayName}
            <Box component="span" sx={{ color: AppColors.TXT_SUB, mx: 1 }}>
              ·
            </Box>
            <Box component="span" sx={{ color: AppColors.GOLD_DARK }}>
              UID {displayUid}
            </Box>
          </Typography>
        </Box>
      </Stack>
      {modalLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <BTLoader />
        </Box>
      ) : userDetails ? (
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              bgcolor: AppColors.BG_CARD,
              border: `1px solid ${AppColors.BG_SECONDARY}`,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <SectionTitle title="Personal data" />
            <InfoList fields={PERSONAL_FIELDS} merged={userDetails} />
          </Paper>
          <Paper
            elevation={2}
            sx={{
              bgcolor: AppColors.BG_CARD,
              border: `1px solid ${AppColors.BG_SECONDARY}`,
              borderRadius: 2,
              overflow: "hidden",
              p: 2,
            }}
          >
            <SectionTitle title="Personal team data" />
            <InfoList fields={TEAM_FIELDS} merged={userDetails} />
          </Paper>
        </Stack>
      ) : (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography sx={{ color: AppColors.TXT_SUB }}>
            No user data loaded.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UserData;
