import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from "@mui/icons-material";
import { AppColors } from "../../constant/appColors";
import authService from "../../services/authService";
import useSnackbar from "../../hooks/useSnackbar";
import TextInput from "../../components/input/textInput";
import Cookies from "js-cookie";
import BtParalex from '../../components/heroBetBit/BtParalex';
import { useAuth } from "../../hooks/useAuth";

const validationSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function LoginTrade() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { setUser } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        const response = await authService.loginTrade({
          email: values.email.trim(),
          password: values.password,
        });

        const { Data, message } = response || {};

        if (Data?.token) {
          Cookies.set("token", Data.token);
          setUser(Data.user, Data.token);
          showSnackbar(message || "Login successful", "success");
          navigate("/");
        }else{
          showSnackbar(message || "Login failed. Please try again.", "error");
        }
      } catch (err) {
        console.error("❌ Admin login failed:", err);
        showSnackbar(
          err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <BtParalex>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", lg: "600px" },
          }}
        >
          <Box
            sx={{
              p: { xs: 0, lg: 4 },
            }}
          >
            <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{
                  color: AppColors.TXT_MAIN,
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                Admin Trade Login
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: AppColors.TXT_SUB,
                }}
              >
                Trading Trade Panel
              </Typography>
            </Box>

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextInput
                name="email"
                placeholder="Enter trade email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                startIcon={<Email sx={{ color: AppColors.TXT_SUB, fontSize: 20 }} />}
              />

              <TextInput
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
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

              <Button
                type="submit"
                disabled={loading}
                className="btn-primary"
                sx={{
                  mb: { xs: 1, sm: 3 },
                  py: { xs: 1, lg: 1.5 },
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </BtParalex>
  );
}
