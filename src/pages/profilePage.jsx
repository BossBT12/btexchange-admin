import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Divider,
  Button,
  Stack,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Email,
  AccountBalanceWallet,
  CalendarMonth,
  AccountBalance,
  Lock,
  Visibility,
  VisibilityOff,
  ContentCopy,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AppColors } from "../constant/appColors";
import { useAuth } from "../hooks/useAuth";
import useSnackbar from "../hooks/useSnackbar";
import TextInput from "../components/input/textInput";
import authService from "../services/authService";

const ROW_BORDER = `1px solid rgba(255, 255, 255, 0.08)`;

function parseStoredUserData() {
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function formatDate(iso) {
  if (iso === undefined || iso === null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatBalance(val) {
  if (val === undefined || val === null || val === "") return "—";
  const n = Number(val);
  if (Number.isNaN(n)) return String(val);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
}

const passwordSchema = Yup.object({
  currentPassword: Yup.string()
    .required("Current password is required")
    .min(6, "Password must be at least 6 characters"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters")
    .notOneOf(
      [Yup.ref("currentPassword")],
      "New password must be different from current password",
    ),
  confirmPassword: Yup.string()
    .required("Confirm your new password")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

function InfoRow({ icon, label, value, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        py: 1.75,
        borderBottom: ROW_BORDER,
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Box
        sx={{
          color: AppColors.GOLD_PRIMARY,
          display: "flex",
          alignItems: "center",
          mt: 0.25,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: AppColors.TXT_SUB,
            display: "block",
            mb: 0.25,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontSize: "0.65rem",
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: AppColors.TXT_MAIN,
            wordBreak: "break-word",
            fontWeight: 500,
          }}
        >
          {value}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}

export default function ProfilePage() {
  const { userData: reduxUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const userData = useMemo(() => reduxUser ?? parseStoredUserData(), [reduxUser]);

  const email = userData?.email ?? "—";
  const balanceDisplay = formatBalance(userData?.balance);
  const walletRaw =
    userData?.walletAddress != null && String(userData.walletAddress).trim() !== ""
      ? String(userData.walletAddress).trim()
      : "";
  const createdDisplay = formatDate(userData?.createdAt);

  const initial = email !== "—" ? email.charAt(0).toUpperCase() : "?";

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const body = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };
      setSubmitting(true);
      try {
        const [tradeResult, networkResult] = await Promise.all([
            authService.changePassword(body),
            authService.changePasswordNetwork(body),
        ]);

        if (tradeResult?.success && networkResult?.success) {
          showSnackbar(
            "Password updated successfully for Trade and Network panels.",
            "success",
          );
          resetForm();
          setShowCurrent(false);
          setShowNew(false);
          setShowConfirm(false);
          return;
        }
      } catch (e) {
        showSnackbar(e?.message || e?.data?.message || "Failed to update password", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const copyWallet = async () => {
    if (!walletRaw) return;
    try {
      await navigator.clipboard.writeText(walletRaw);
      showSnackbar("Wallet address copied to clipboard.", "success");
    } catch {
      showSnackbar("Could not copy address.", "error");
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            color: AppColors.TXT_MAIN,
            fontWeight: 600,
            mb: 0.5,
            letterSpacing: "0.02em",
          }}
        >
          Profile
        </Typography>
        <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
          View your account details and update your password for both Trade and
          Network admin APIs.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: AppColors.BG_SECONDARY,
              borderRadius: 2,
              border: `1px solid ${AppColors.HLT_NONE}`,
              overflow: "hidden",
              height: "100%",
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: ROW_BORDER,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: AppColors.HLT_LIGHT,
                  color: AppColors.GOLD_PRIMARY,
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  border: `2px solid ${AppColors.GOLD_PRIMARY}`,
                }}
              >
                {initial}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}
                  noWrap
                >
                  {email}
                </Typography>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB }}>
                  Administrator account
                </Typography>
              </Box>
            </Box>
            <Box sx={{ px: 2.5, pb: 1 }}>
              <InfoRow
                icon={<Email sx={{ fontSize: 20 }} />}
                label="Email"
                value={email}
              />
              <InfoRow
                icon={<AccountBalance sx={{ fontSize: 20 }} />}
                label="Balance"
                value={balanceDisplay}
              />
              <InfoRow
                icon={<AccountBalanceWallet sx={{ fontSize: 20 }} />}
                label="Wallet address"
                value={walletRaw || "Not set"}
                action={
                  walletRaw ? (
                    <Tooltip title="Copy address">
                      <IconButton
                        size="small"
                        onClick={copyWallet}
                        aria-label="Copy wallet address"
                        sx={{
                          color: AppColors.TXT_SUB,
                          "&:hover": { color: AppColors.GOLD_PRIMARY },
                        }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null
                }
              />
              <InfoRow
                icon={<CalendarMonth sx={{ fontSize: 20 }} />}
                label="Member since"
                value={createdDisplay}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: AppColors.BG_SECONDARY,
              borderRadius: 2,
              border: `1px solid ${AppColors.HLT_NONE}`,
              p: 2.5,
              height: "100%",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: AppColors.TXT_MAIN,
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Change password
            </Typography>
            <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, mb: 2 }}>
              Updates your password on both the Trade API and Network API. Use
              your current password, then choose a new one.
            </Typography>

            <Divider sx={{ borderColor: ROW_BORDER, mb: 2.5 }} />

            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextInput
                name="currentPassword"
                type={showCurrent ? "text" : "password"}
                label="Current password"
                placeholder="Enter current password"
                value={formik.values.currentPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.currentPassword &&
                  Boolean(formik.errors.currentPassword)
                }
                helperText={
                  formik.touched.currentPassword &&
                  formik.errors.currentPassword
                }
                startIcon={
                  <Lock sx={{ color: AppColors.TXT_SUB, fontSize: 20 }} />
                }
                endIcon={
                  <IconButton
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    edge="end"
                    aria-label={
                      showCurrent ? "Hide current password" : "Show current password"
                    }
                    sx={{
                      color: AppColors.TXT_SUB,
                      "&:hover": { color: AppColors.GOLD_PRIMARY },
                    }}
                  >
                    {showCurrent ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
              />
              <TextInput
                name="newPassword"
                type={showNew ? "text" : "password"}
                label="New password"
                placeholder="Enter new password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.newPassword && Boolean(formik.errors.newPassword)
                }
                helperText={
                  formik.touched.newPassword && formik.errors.newPassword
                }
                startIcon={
                  <Lock sx={{ color: AppColors.TXT_SUB, fontSize: 20 }} />
                }
                endIcon={
                  <IconButton
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    edge="end"
                    aria-label={
                      showNew ? "Hide new password" : "Show new password"
                    }
                    sx={{
                      color: AppColors.TXT_SUB,
                      "&:hover": { color: AppColors.GOLD_PRIMARY },
                    }}
                  >
                    {showNew ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
              />
              <TextInput
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                label="Confirm new password"
                placeholder="Confirm new password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.confirmPassword &&
                  Boolean(formik.errors.confirmPassword)
                }
                helperText={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                }
                startIcon={
                  <Lock sx={{ color: AppColors.TXT_SUB, fontSize: 20 }} />
                }
                endIcon={
                  <IconButton
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    edge="end"
                    aria-label={
                      showConfirm
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    sx={{
                      color: AppColors.TXT_SUB,
                      "&:hover": { color: AppColors.GOLD_PRIMARY },
                    }}
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting}
                  className="btn-primary"
                  sx={{
                    py: 1.25,
                    minWidth: { sm: 160 },
                  }}
                >
                  {formik.isSubmitting ? "Updating…" : "Update password"}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  disabled={formik.isSubmitting}
                  onClick={() => {
                    formik.resetForm();
                    setShowCurrent(false);
                    setShowNew(false);
                    setShowConfirm(false);
                  }}
                  sx={{
                    borderColor: AppColors.HLT_NONE,
                    color: AppColors.TXT_SUB,
                    "&:hover": {
                      borderColor: AppColors.GOLD_PRIMARY,
                      color: AppColors.GOLD_PRIMARY,
                    },
                  }}
                >
                  Clear
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
