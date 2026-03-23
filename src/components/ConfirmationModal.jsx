import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { AppColors } from "../constant/appColors";

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  okText = "OK",
  cancelText = "Cancel",
  confirmColor = "primary",
  loading = false,
}) => {

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (!loading) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
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
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: AppColors.TXT_MAIN,
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem", lg: "1.75rem" },
          }}
        >
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Typography
          variant="body1"
          sx={{
            color: AppColors.TXT_SUB,
          }}
        >
          {description}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={handleCancel}
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
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="btn-primary"
        >
          {okText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
