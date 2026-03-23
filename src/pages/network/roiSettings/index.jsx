import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    InputAdornment,
    Grid,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Divider,
} from '@mui/material';
import { Percent, TrendingUp, InfoOutlined } from '@mui/icons-material';
import { AppColors } from '../../../constant/appColors';
import useSnackbar from '../../../hooks/useSnackbar';
import networkService from '../../../services/networkService';

const ROI_MIN = 0.1;
const ROI_MAX = 100;

const RoiSettingsPage = () => {
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentRoi, setCurrentRoi] = useState(null);
    const [roiRate, setRoiRate] = useState('');
    const [applyToExisting, setApplyToExisting] = useState(false);
    const [error, setError] = useState(null);

    const fetchRoiSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await networkService.getRoiSettings();
            if (response?.success && response?.data != null) {
                const rate = response.data.defaultRoiRate;
                setCurrentRoi(rate);
                if (roiRate === '') setRoiRate(String(rate));
            } else {
                setError(response?.message || 'Failed to load ROI settings');
            }
        } catch (err) {
            console.error('Error fetching ROI settings:', err);
            const msg = err.response?.data?.message || 'Failed to load ROI settings';
            setError(msg);
            showSnackbar(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoiSettings();
    }, []);

    const handleRoiChange = (e) => {
        const v = e.target.value;
        if (v === '' || /^\d*\.?\d*$/.test(v)) setRoiRate(v);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const num = parseFloat(roiRate);
        if (Number.isNaN(num) || num < ROI_MIN || num > ROI_MAX) {
            showSnackbar(`ROI rate must be between ${ROI_MIN} and ${ROI_MAX}`, 'error');
            return;
        }
        try {
            setSaving(true);
            setError(null);
            const response = await networkService.setRoiSettings({
                roiRate: num,
                applyToExistingInvestments: applyToExisting,
            });
            if (response?.success) {
                setCurrentRoi(response.data?.defaultRoiRate ?? num);
                showSnackbar(response.message || 'ROI updated successfully', 'success');
                if (applyToExisting && response.data?.updatedInvestments != null) {
                    showSnackbar(
                        `${response.data.updatedInvestments} active investment(s) updated`,
                        'info'
                    );
                }
            } else {
                showSnackbar(response?.message || 'Failed to update ROI', 'error');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update ROI';
            showSnackbar(msg, 'error');
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh',
                }}
            >
                <CircularProgress sx={{ color: AppColors.GOLD_DARK }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: AppColors.TXT_MAIN,
                        background: `linear-gradient(45deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    ROI Settings
                </Typography>
                <Typography variant="body1" sx={{ color: AppColors.TXT_SUB, fontWeight: 400 }}>
                    Set the default ROI % per day for new investments. Optionally apply to all active
                    investments.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Current rate card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card
                        elevation={0}
                        sx={{
                            bgcolor: AppColors.BG_CARD,
                            border: `1px solid ${AppColors.BG_SECONDARY}`,
                            borderRadius: 2,
                            height: '100%',
                        }}
                    >
                        <CardContent sx={{ py: 3, px: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <TrendingUp sx={{ color: AppColors.GOLD_DARK, fontSize: 28 }} />
                                <Typography
                                    variant="subtitle2"
                                    sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase' }}
                                >
                                    Current default ROI
                                </Typography>
                            </Box>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 700,
                                    color: AppColors.GOLD_DARK,
                                    lineHeight: 1.2,
                                }}
                            >
                                {currentRoi != null ? `${currentRoi}%` : '—'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, mt: 1 }}>
                                per day
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Form card */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper
                        elevation={0}
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            backgroundColor: AppColors.BG_CARD,
                            border: `1px solid ${AppColors.BG_SECONDARY}`,
                            borderRadius: 2,
                            p: 3,
                        }}
                    >
                        {error && (
                            <Alert
                                severity="error"
                                onClose={() => setError(null)}
                                sx={{
                                    mb: 2,
                                    bgcolor: `${AppColors.ERROR}14`,
                                    color: AppColors.ERROR,
                                    '& .MuiAlert-icon': { color: AppColors.ERROR },
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <Typography
                            variant="subtitle1"
                            sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mb: 2 }}
                        >
                            Update ROI rate
                        </Typography>

                        <TextField
                            fullWidth
                            label="ROI rate (% per day)"
                            type="text"
                            inputMode="decimal"
                            value={roiRate}
                            onChange={handleRoiChange}
                            placeholder={`${ROI_MIN} - ${ROI_MAX}`}
                            helperText={`Allowed range: ${ROI_MIN}% to ${ROI_MAX}%`}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Percent sx={{ color: AppColors.TXT_SUB }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    bgcolor: AppColors.BG_SECONDARY,
                                    borderRadius: 2,
                                    '& fieldset': { borderColor: AppColors.BG_SECONDARY },
                                    '&:hover fieldset': { borderColor: AppColors.GOLD_DARK },
                                    '&.Mui-focused fieldset': { borderColor: AppColors.GOLD_DARK },
                                },
                            }}
                            InputLabelProps={{ sx: { color: AppColors.TXT_SUB } }}
                            FormHelperTextProps={{ sx: { color: AppColors.TXT_SUB } }}
                            sx={{ mb: 2 }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={applyToExisting}
                                    onChange={(e) => setApplyToExisting(e.target.checked)}
                                    sx={{
                                        color: AppColors.GOLD_DARK,
                                        '&.Mui-checked': { color: AppColors.GOLD_DARK },
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ color: AppColors.TXT_MAIN }}>
                                    Apply to all active investments
                                </Typography>
                            }
                        />

                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoOutlined sx={{ fontSize: 18, color: AppColors.TXT_SUB }} />
                            <Typography variant="caption" sx={{ color: AppColors.TXT_SUB }}>
                                When enabled, every active investment will be updated to this rate.
                                Use with caution.
                            </Typography>
                        </Box>

                        <Divider sx={{ borderColor: AppColors.BG_SECONDARY, my: 3 }} />

                        <Button
                            className="btn-primary"
                            type="submit"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <CircularProgress size={20} sx={{ color: 'inherit', mr: 1 }} />
                                    Saving…
                                </>
                            ) : (
                                'Save ROI rate'
                            )}
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RoiSettingsPage;
