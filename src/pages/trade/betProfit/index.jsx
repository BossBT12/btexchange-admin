import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Percent, AttachMoney, InfoOutlined } from '@mui/icons-material';
import { AppColors } from '../../../constant/appColors';
import useSnackbar from '../../../hooks/useSnackbar';
import tradeService from '../../../services/tradeService';

const PERCENT_MIN = 0;
const PERCENT_MAX = 1000;

const BetProfitPage = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [betProfitPercent, setBetProfitPercent] = useState('');
  const [feePercent, setFeePercent] = useState('');
  const [error, setError] = useState(null);

  const fetchBetConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tradeService.getBetConfig();
      if (response?.success && response?.data != null) {
        const { betProfitPercent: bp, feePercent: fp } = response.data;
        setConfig(response.data);
        setBetProfitPercent(String(bp ?? ''));
        setFeePercent(String(fp ?? ''));
      } else {
        setError(response?.message || 'Failed to load bet config');
      }
    } catch (err) {
      console.error('Error fetching bet config:', err);
      const msg = err?.message || err?.data?.message || 'Failed to load bet config';
      setError(msg);
      showSnackbar(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBetConfig();
  }, []);

  const handlePercentChange = (setter) => (e) => {
    const v = e.target.value;
    if (v === '' || /^\d*\.?\d*$/.test(v)) setter(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bp = parseFloat(betProfitPercent);
    const fp = parseFloat(feePercent);
    if (Number.isNaN(bp) || bp < PERCENT_MIN || bp > PERCENT_MAX) {
      showSnackbar(`Bet profit % must be between ${PERCENT_MIN} and ${PERCENT_MAX}`, 'error');
      return;
    }
    if (Number.isNaN(fp) || fp < PERCENT_MIN || fp > 100) {
      showSnackbar(`Fee % must be between ${PERCENT_MIN} and 100`, 'error');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const response = await tradeService.setBetProfit({
        betProfitPercent: bp,
        feePercent: fp,
      });
      if (response?.success) {
        setConfig(response.data ?? { betProfitPercent: bp, feePercent: fp });
        showSnackbar(response.message || 'Bet config updated successfully', 'success');
      } else {
        showSnackbar(response?.message || 'Failed to update bet config', 'error');
      }
    } catch (err) {
      const msg = err?.message || err?.data?.message || 'Failed to update bet config';
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
          Bet Profit
        </Typography>
        <Typography variant="body1" sx={{ color: AppColors.TXT_SUB, fontWeight: 400 }}>
          Set bet profit percentage and fee. Payout = net amount × (1 + betProfitPercent/100) after
          fee deduction.
        </Typography>
      </Box>

      <Grid container spacing={3}>
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
                <AttachMoney sx={{ color: AppColors.GOLD_DARK, fontSize: 28 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase' }}
                >
                  Current config
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                Bet profit
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: AppColors.GOLD_DARK, lineHeight: 1.2 }}
              >
                {config?.betProfitPercent != null ? `${config.betProfitPercent}%` : '—'}
              </Typography>
              <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, mt: 2 }}>
                Fee
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: AppColors.TXT_MAIN, lineHeight: 1.2 }}
              >
                {config?.feePercent != null ? `${config.feePercent}%` : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

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
              Update bet config
            </Typography>

            <TextField
              fullWidth
              label="Bet profit (%)"
              type="text"
              inputMode="decimal"
              value={betProfitPercent}
              onChange={handlePercentChange(setBetProfitPercent)}
              placeholder={`${PERCENT_MIN} - ${PERCENT_MAX}`}
              helperText="Profit % on net trade amount (e.g. 100 = 2× payout)"
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

            <TextField
              fullWidth
              label="Fee (%)"
              type="text"
              inputMode="decimal"
              value={feePercent}
              onChange={handlePercentChange(setFeePercent)}
              placeholder="0 - 100"
              helperText="Fee deducted from trade amount before profit calculation"
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

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlined sx={{ fontSize: 18, color: AppColors.TXT_SUB }} />
              <Typography variant="caption" sx={{ color: AppColors.TXT_SUB }}>
                netTradeAmount = amount × (1 − feePercent/100). totalPayoutIfWin = netTradeAmount ×
                (1 + betProfitPercent/100).
              </Typography>
            </Box>

            <Divider sx={{ borderColor: AppColors.BG_SECONDARY, my: 3 }} />

            <Button className="btn-primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <CircularProgress size={20} sx={{ color: 'inherit', mr: 1 }} />
                  Saving…
                </>
              ) : (
                'Save bet config'
              )}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BetProfitPage;
