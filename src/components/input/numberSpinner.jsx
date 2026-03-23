import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import OutlinedInput from '@mui/material/OutlinedInput';
import { AppColors } from '../../constant/appColors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function NumberSpinner({ 
  id: idProp, 
  label, 
  error = false,
  errorMessage,
  success = false,
  successMessage,
  size = 'medium', 
  min,
  max,
  defaultValue = 0,
  onChange,
  disabled = false,
  required = false,
  step = 1,
  ...other 
}) {
  const id = React.useId();
  const [value, setValue] = React.useState(defaultValue || min || 0);
  const [focused, setFocused] = React.useState(false);

  // Update internal value when defaultValue changes
  React.useEffect(() => {
    setValue(defaultValue || min || 0);
  }, [defaultValue, min]);

  const handleIncrement = () => {
    const newValue = (parseFloat(value) || 0) + step;
    const finalValue = max !== undefined ? Math.min(newValue, max) : newValue;
    setValue(finalValue);
    if (onChange) {
      onChange(finalValue);
    }
  };

  const handleDecrement = () => {
    const newValue = (parseFloat(value) || 0) - step;
    const finalValue = min !== undefined ? Math.max(newValue, min) : newValue;
    setValue(finalValue);
    if (onChange) {
      onChange(finalValue);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    
    // Allow empty string for user typing
    if (inputValue === '') {
      setValue('');
      if (onChange) {
        onChange('');
      }
      return;
    }

    // Parse as float
    const numValue = parseFloat(inputValue);
    
    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      let finalValue = numValue;
      
      // Apply min constraint
      if (min !== undefined && finalValue < min) {
        finalValue = min;
      }
      
      // Apply max constraint
      if (max !== undefined && finalValue > max) {
        finalValue = max;
      }
      
      setValue(finalValue);
      if (onChange) {
        onChange(finalValue);
      }
    } else {
      // If invalid, keep the input as is (user might be typing)
      setValue(inputValue);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    // On blur, ensure value is valid
    const numValue = parseFloat(value);
    if (isNaN(numValue) || value === '') {
      const defaultValue = min !== undefined ? min : 0;
      setValue(defaultValue);
      if (onChange) {
        onChange(defaultValue);
      }
    } else {
      let finalValue = numValue;
      if (min !== undefined && finalValue < min) {
        finalValue = min;
      }
      if (max !== undefined && finalValue > max) {
        finalValue = max;
      }
      setValue(finalValue);
      if (onChange) {
        onChange(finalValue);
      }
    }
  };

  const handleKeyDown = (e) => {
    // Prevent arrow keys from changing input value directly
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  const numValue = parseFloat(value) || 0;
  const isMinDisabled = min !== undefined && numValue <= min;
  const isMaxDisabled = max !== undefined && numValue >= max;
  
  // Calculate input width based on min, max, and current value
  const minWidth = min !== undefined ? min.toString().length : 0;
  const maxWidth = max !== undefined ? max.toString().length : 0;
  const currentWidth = value.toString().length || 1;
  const inputSize = Math.max(minWidth, maxWidth, currentWidth) + 1;

  const showError = error;
  const showSuccess = success;

  return (
    <FormControl
      size={size}
      disabled={disabled}
      required={required}
      variant="outlined"
      fullWidth
      sx={{
        '& .MuiButton-root': {
          borderColor: AppColors.HLT_NONE,
          minWidth: 0,
          bgcolor: AppColors.BG_CARD,
          color: AppColors.TXT_MAIN,
          '&:hover': {
            bgcolor: `${AppColors.GOLD_PRIMARY}20`,
            borderColor: AppColors.GOLD_PRIMARY,
          },
          '&.Mui-disabled': {
            borderColor: AppColors.HLT_NONE,
            color: AppColors.TXT_SUB,
            opacity: 0.5,
          },
        },
      }}
    >
      {label && (
        <FormLabel
          htmlFor={id}
          sx={{
            display: 'inline-block',
            fontSize: '0.875rem',
            color: AppColors.TXT_MAIN,
            fontWeight: 500,
            lineHeight: 1.5,
            mb: 0.5,
          }}
        >
          {label}
        </FormLabel>
      )}
      <Box sx={{ display: 'flex' }}>
        <Button
          variant="outlined"
          aria-label="Decrease"
          size={size}
          onClick={handleDecrement}
          disabled={disabled || isMinDisabled}
          sx={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderRight: '0px',
            minWidth: { xs: 32, sm: 40 },
            px: { xs: 0.5, sm: 1 },
            '&.Mui-disabled': {
              borderRight: '0px',
            },
          }}
        >
          <RemoveIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        </Button>

        <OutlinedInput
          id={id}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          required={required}
          inputProps={{
            ...other,
            type: 'number',
            min: min,
            max: max,
            step: step,
            size: inputSize,
            style: {
              textAlign: 'center',
            },
          }}
          sx={{
            flex: 1,
            borderRadius: 0,
            pr: 0,
            bgcolor: AppColors.BG_CARD,
            color: AppColors.TXT_MAIN,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: showError 
                ? AppColors.ERROR 
                : showSuccess 
                ? AppColors.SUCCESS 
                : AppColors.HLT_NONE,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: showError 
                ? AppColors.ERROR 
                : showSuccess 
                ? AppColors.SUCCESS 
                : AppColors.GOLD_PRIMARY,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: showError 
                ? AppColors.ERROR 
                : showSuccess 
                ? AppColors.SUCCESS 
                : AppColors.GOLD_PRIMARY,
            },
            '&.Mui-disabled': {
              bgcolor: AppColors.BG_SECONDARY,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: AppColors.HLT_NONE,
              },
            },
            '& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            '& input[type=number]': {
              MozAppearance: 'textfield',
            },
          }}
        />

        <Button
          variant="outlined"
          aria-label="Increase"
          size={size}
          onClick={handleIncrement}
          disabled={disabled || isMaxDisabled}
          sx={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderLeft: '0px',
            minWidth: { xs: 32, sm: 40 },
            px: { xs: 0.5, sm: 1 },
            '&.Mui-disabled': {
              borderLeft: '0px',
            },
          }}
        >
          <AddIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        </Button>
      </Box>
    </FormControl>
  );
}

export default NumberSpinner;
