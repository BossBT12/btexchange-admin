import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Container,
  Typography,
  Button,
} from "@mui/material";
import { AppColors } from "../constant/appColors";
import authService from "../services/authService";
import userService from "../services/secondGameServices/userService";
import useSnackbar from "../hooks/useSnackbar";
import OTPInput from "./input/otpInput";
import BTLoader from "./Loader";

const OTP_LENGTH = 4;
const OTP_LENGTH_2 = 6; // Second game uses 6-digit OTP

const OtpVerification = ({ email, onVerificationSuccess, onBack, isSecondGame = false }) => {
  const otpLength = isSecondGame ? OTP_LENGTH_2 : OTP_LENGTH;
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const validationSchema = Yup.object({
    otp: Yup.string()
      .required("OTP is required")
      .matches(`^\\d{${otpLength}}$`, `OTP must be exactly ${otpLength} digits`)
      .length(otpLength, `OTP must be ${otpLength} digits`),
  });

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        const response = isSecondGame
          ? await userService.verifyEmail({
              email: email,
              otp: values.otp,
            })
          : await authService.verifyOtp({
              email: email,
              otp: values.otp,
            });

        if (!response?.success) {
          showSnackbar(response?.message || "OTP verification failed", "error");
          return;
        }

        showSnackbar("OTP verification successful", "success");

        setSuccess(true);

        if (onVerificationSuccess) {
          onVerificationSuccess(response);
        } else {
          setTimeout(() => {
            navigate(isSecondGame ? "/network/login" : "/login", { state: { email } });
          }, 1000);
        }
      } catch (err) {
        console.error("❌ OTP verification failed:", err);
        showSnackbar(err.response?.data?.message || err.message || "Invalid OTP. Please try again.", "error");
        formik.setFieldValue("otp", "");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer((time) => time - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const response = isSecondGame
        ? await userService.resendOtp({ email })
        : await authService.resendOtp({ email });
      if (!response?.success) {
        showSnackbar(response?.message || "Failed to resend OTP. Please try again.", "error");
        return;
      }
      showSnackbar(response?.message || "OTP sent successfully.", "success");
      setResendTimer(30);
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.message || "Failed to resend OTP. Please try again.", "error");
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, otpLength);
    formik.setFieldValue("otp", value);
    formik.setFieldTouched("otp", true);

    if (value.length === otpLength) {
      setTimeout(() => {
        formik.handleSubmit();
      }, 100);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          width: "100%",
        }}
      >
        <Box
          sx={{
            p: { xs: 0, sm: 3, md: 4 },
          }}
        >
          <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                color: AppColors.TXT_MAIN,
                mb: 1,
              }}
            >
              Verify Your Email
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: AppColors.TXT_SUB,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                mb: 2,
              }}
            >
              We've sent a {otpLength}-digit verification code to
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: AppColors.GOLD_PRIMARY,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 600,
              }}
            >
              {email}
            </Typography>
          </Box>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Box sx={{ mb: { xs: 3, sm: 4 } }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 1.5,
                  color: AppColors.TXT_MAIN,
                  fontWeight: 600,
                  fontSize: { xs: "0.813rem", sm: "0.875rem" },
                }}
              >
                Enter Verification Code
              </Typography>
              <OTPInput name="otp" value={formik.values.otp} onChange={handleOtpChange} length={otpLength} />
            </Box>
            <Button
              type="submit"
              fullWidth
              disabled={loading || success || formik.values.otp.length !== otpLength}
              className="btn-primary"
              sx={{
                mb: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 1.75 },
                fontSize: { xs: "0.938rem", sm: "1rem" },
                fontWeight: 600,
              }}
            >
              {loading ? (
                <>
                  <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                    <BTLoader />
                  </Box>
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: { xs: 2, sm: 3 },
              }}
            >
              <Button
                variant="text"
                disabled={resendTimer > 0 || resendLoading}
                onClick={handleResend}
                sx={{
                  color: AppColors.GOLD_PRIMARY,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.813rem", sm: "0.875rem" },
                  p: 0,
                  minWidth: "auto",
                  "&:hover": {
                    textDecoration: "underline",
                    backgroundColor: "transparent",
                  },
                }}
              >
                {resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : "Resend OTP"}
              </Button>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: AppColors.TXT_SUB,
                    fontSize: { xs: "0.813rem", sm: "0.875rem" },
                  }}
                >
                  Wrong email?{" "}
                  <Button
                    onClick={onBack}
                    sx={{
                      color: AppColors.GOLD_PRIMARY,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "inherit",
                      p: 0,
                      minWidth: "auto",
                      "&:hover": {
                        textDecoration: "underline",
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    Go back
                  </Button>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default OtpVerification;
