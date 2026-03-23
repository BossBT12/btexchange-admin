import React from 'react'
import { Box, Typography, TextField, InputAdornment } from '@mui/material'
import { AppColors } from '../../constant/appColors'

const TextInput = ({ label, name, placeholder, value, onChange, onBlur, error, helperText, startIcon, endIcon, ...rest }) => {
  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          sx={{
            mb: 1.5,
            color: AppColors.TXT_MAIN,
            fontWeight: 600,
            fontSize: { xs: "0.813rem", sm: "0.875rem" },
          }}
        >
          {label}
        </Typography>
      )}
      <TextField
        {...rest}
        fullWidth
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error && Boolean(error)}
        helperText={helperText}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {startIcon}
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {endIcon}
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: AppColors.BG_SECONDARY,
            color: AppColors.TXT_MAIN,
            height: { xs: "52px", sm: "54px" },
            borderRadius: 2,
            transition: "all 0.2s ease",
            "& fieldset": {
              borderColor: error && Boolean(error)
                ? AppColors.ERROR
                : AppColors.HLT_NONE,
              borderWidth: 1,
            },
            "&:hover fieldset": {
              borderColor: AppColors.GOLD_PRIMARY,
            },
            "&.Mui-focused fieldset": {
              borderColor: AppColors.GOLD_PRIMARY,
              borderWidth: 2,
            },
            "&.Mui-error fieldset": {
              borderColor: AppColors.ERROR,
            },
          },
          "& .MuiInputBase-input": {
            fontSize: { xs: "0.875rem", sm: "1rem" },
            py: { xs: 1.25, sm: 1.5 },
          },
          "& .MuiFormHelperText-root": {
            color: AppColors.ERROR,
            fontSize: { xs: "0.688rem", sm: "0.75rem" },
            mt: 0.75,
            mx: 0,
          },
        }}
      />
    </Box>
  )
}

export default TextInput