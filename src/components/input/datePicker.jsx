import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AppColors } from "../../constant/appColors";
import { FONT_SIZE } from "../../constant/lookUpConstant";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

/**
 * MUI DatePicker wrapper. Value and onChange use string format "YYYY-MM-DD" for compatibility.
 * @param {string} [label]
 * @param {string} [id]
 * @param {string} [value] - Date string "YYYY-MM-DD" or empty
 * @param {function(string): void} [onChange] - Called with "YYYY-MM-DD" or ""
 * @param {string} [placeholder]
 * @param {object} [sx] - MUI sx for the field container
 * @param {boolean} [disabled]
 * @param {object} [slotProps] - Passed to MUI DatePicker slotProps
 */
const DatePicker = ({
  label,
  id,
  value = "",
  onChange,
  placeholder = "Pick a date",
  sx = {},
  isDateTimePicker = false,
  disabled = false,
  slotProps,
  ...rest
}) => {
  const dateValue = value && dayjs(value).isValid() ? dayjs(value) : null;

  const handleChange = (newValue) => {
    if (!onChange) return;
    onChange(newValue ? newValue.format("YYYY-MM-DD") : "");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {isDateTimePicker ? (
        <DateTimePicker
          id={id}
          label={label}
          value={dateValue}
          onChange={handleChange}
          disabled={disabled}
          slotProps={{
            textField: {
              fullWidth: true,
              sx: sx,
            },
          }}
          {...rest}
        />) : (
        <MuiDatePicker
          id={id}
          label={label}
          value={dateValue}
          onChange={handleChange}
          disabled={disabled}
          slotProps={{
            textField: {
              fullWidth: true,
              sx: sx,
            },
          }}
          {...rest}
        />
      )}
    </LocalizationProvider>
  );
};

export default DatePicker;
