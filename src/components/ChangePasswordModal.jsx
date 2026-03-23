import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Lock,
  Visibility,
  VisibilityOff,
  Close,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AppColors } from "../constant/appColors";
import authService from "../services/authService";
import useSnackbar from "../hooks/useSnackbar";
import TextInput from "./input/textInput";

// Validation schema for change password
const changePasswordSchema = Yup.object({
  currentPassword: Yup.string()
    .required("Current password is required")
    .min(6, "Password must be at least 6 characters"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters")
    .notOneOf(
      [Yup.ref("currentPassword")],
      "New password must be different from current password"
    ),
  confirmPassword: Yup.string()
    .required("Please confirm your new password")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

const ChangePasswordModal = ({ open, onClose }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: changePasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await authService.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });

        if (response.success) {
          showSnackbar(
            response.message || "Password changed successfully",
            "success"
          );
          formik.resetForm();
          onClose();
        } else {
          throw new Error(response.message || "Failed to change password");
        }
      } catch (err) {
        console.error("❌ Change password failed:", err);
        showSnackbar(
          err.response?.data?.message ||
            err.message ||
            "Failed to change password. Please try again.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleClose = () => {
    if (!loading) {
      formik.resetForm();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          background: `radial-gradient(ellipse at center, #1b1b1b, #0a0a0a)`,
          borderRadius: { xs: 2, sm: 2.5, md: 3 },
          border: `1px solid #ffffff20`,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Lock sx={{ fontSize: "1.5rem", color: AppColors.GOLD_PRIMARY }} />
          <Typography
            variant="subtitle1"
            sx={{
              color: AppColors.TXT_MAIN,
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem", lg: "1.75rem" },
            }}
          >
            Change Password
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: AppColors.TXT_SUB,
            "&:hover": {
              color: AppColors.TXT_MAIN,
              bgcolor: AppColors.BG_CARD,
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: AppColors.HLT_NONE }} />

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {/* Current Password */}
          <TextInput
            name="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
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
            startIcon={<Lock sx={{ color: AppColors.TXT_SUB, fontSize: 20 }} />}
            endIcon={
              <IconButton
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                edge="end"
                sx={{
                  color: AppColors.TXT_SUB,
                  "&:hover": { color: AppColors.GOLD_PRIMARY },
                }}
              >
                {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
          />

          {/* New Password */}
          <TextInput
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.newPassword &&
              Boolean(formik.errors.newPassword)
            }
            helperText={
              formik.touched.newPassword &&
              formik.errors.newPassword
            }
            startIcon={<Lock sx={{ color: AppColors.TXT_SUB, fontSize: 20 }} />}
            endIcon={
              <IconButton
                onClick={() => setShowNewPassword(!showNewPassword)}
                edge="end"
                sx={{
                  color: AppColors.TXT_SUB,
                  "&:hover": { color: AppColors.GOLD_PRIMARY },
                }}
              >
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
          />

          {/* Confirm Password */}
          <TextInput
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
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
            startIcon={<Lock sx={{ color: AppColors.TXT_SUB, fontSize: 20 }} />}
            endIcon={
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
                sx={{
                  color: AppColors.TXT_SUB,
                  "&:hover": { color: AppColors.GOLD_PRIMARY },
                }}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: AppColors.TXT_SUB,
            textTransform: "none",
            px: 3,
            "&:hover": {
              bgcolor: AppColors.BG_CARD,
              color: AppColors.TXT_MAIN,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={formik.handleSubmit}
          disabled={loading}
          className="btn-primary"
          sx={{
            px: 3,
          }}
        >
          {loading ? "Changing Password..." : "Change Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordModal;
