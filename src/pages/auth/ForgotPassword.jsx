import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  IconButton,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import BtParalex from "../../components/heroBetBit/BtParalex";
import TextInput from "../../components/input/textInput";
import { AppColors } from "../../constant/appColors";
import authService from "../../services/authService";
import useSnackbar from "../../hooks/useSnackbar";
import OTPInput from "../../components/input/otpInput";

const steps = {
  request: "request",
  verify: "verify",
  reset: "reset",
};

const OTP_LENGTH = 4;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || "";
  const [step, setStep] = useState(steps.request);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  const validationSchema = Yup.object({
    email: step === steps.request || step === steps.verify || step === steps.reset
      ? Yup.string()
        .required("Email is required")
        .email("Please enter a valid email address")
        .max(100, "Email must be less than 100 characters")
      : Yup.string(),
    otp: step === steps.verify || step === steps.reset
      ? Yup.string()
        .required("OTP is required")
        .matches(`^\\d{${OTP_LENGTH}}$`, `OTP must be exactly ${OTP_LENGTH} digits`)
        .length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`)
      : Yup.string(),
    newPassword: step === steps.reset
      ? Yup.string()
        .required("New password is required")
        .min(6, "Password must be at least 6 characters")
      : Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      email,
      otp: "",
      newPassword: "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (step === steps.request) {
          const trimmedEmail = values.email.trim();
          await authService.forgotPassword({ email: trimmedEmail });
          setEmail(trimmedEmail);
          formik.setFieldValue("email", trimmedEmail);
          setStep(steps.verify);
          showSnackbar("OTP sent to your email.", "success");
        } else if (step === steps.verify) {
          await authService.verifyForgotPasswordOtp({
            email,
            otp: values.otp,
          });
          setOtp(values.otp);
          setStep(steps.reset);
          showSnackbar("OTP verified. Please set a new password.", "success");
        } else if (step === steps.reset) {
          await authService.resetPassword({
            email,
            newPassword: values.newPassword,
          });
          showSnackbar("Password reset successfully. Please log in.", "success");
          navigate("/login", { state: { email } });
        }
      } catch (err) {
        console.error("Forgot password flow failed:", err);
        showSnackbar(
          err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const renderDescription = () => {
    if (step === steps.request) {
      return "Enter your email to receive a verification code.";
    }
    if (step === steps.verify) {
      return `Enter the ${OTP_LENGTH}-digit code sent to ${email}.`;
    }
    return "Enter a new password to complete the reset.";
  };

  const submitLabel = () => {
    if (step === steps.request) return "Send OTP";
    if (step === steps.verify) return "Verify OTP";
    return loading ? "Updating..." : "Reset Password";
  };

  return (
    <BtParalex>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1.5, sm: 2, md: 3 },
          pt: { xs: 10, sm: 12, md: 14 },
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: "500px", md: "600px" },
          }}
        >
          <Box
            sx={{
              p: { xs: 0, sm: 3, md: 4 },
            }}
          >
            <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: "center" }}>
              <Typography
                variant="h2"
                sx={{
                  color: AppColors.TXT_MAIN,
                  mb: 0.5,
                }}
              >
                Forgot Password
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: AppColors.TXT_SUB,
                }}
              >
                {renderDescription()}
              </Typography>
            </Box>

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(step === steps.request) && (
                <TextInput
                  name="email"
                  placeholder="Enter email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  startIcon={<Email sx={{ color: AppColors.TXT_SUB, fontSize: 20 }} />}
                  disabled={step !== steps.request}
                />
              )}

              {(step === steps.verify) && (
                <OTPInput name="otp" value={formik.values.otp} onChange={formik.handleChange} length={OTP_LENGTH} />
              )}

              {step === steps.reset && (
                <TextInput
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                  helperText={formik.touched.newPassword && formik.errors.newPassword}
                  startIcon={<Lock sx={{ color: AppColors.TXT_SUB, fontSize: 20 }} />}
                  endIcon={
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: AppColors.TXT_SUB, "&:hover": { color: AppColors.GOLD_PRIMARY } }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  }
                />
              )}

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                className="btn-primary"
                sx={{
                  mb: { xs: 3, sm: 4 },
                  py: { xs: 1.5, sm: 1.75 },
                  fontSize: { xs: "0.938rem", sm: "1rem" },
                  fontWeight: 600,
                }}
              >
                {loading ? "Please wait..." : submitLabel()}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Button
                  variant="text"
                  onClick={() => navigate("/login")}
                  sx={{
                    color: AppColors.GOLD_PRIMARY,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: { xs: "0.813rem", sm: "0.875rem" },
                    "&:hover": {
                      textDecoration: "underline",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  Back to Sign In
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </BtParalex>
  );
}
