import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Telegram, Groups as GroupsIcon, InfoOutlined } from '@mui/icons-material';
import { AppColors } from '../../../constant/appColors';
import useSnackbar from '../../../hooks/useSnackbar';
import tradeService from '../../../services/tradeService';

const TELEGRAM_FIELDS = [
  { key: 'telegramUrl', label: 'Telegram channel / bot', placeholder: 'https://t.me/your_channel', Icon: Telegram },
  { key: 'groupTelegramUrl', label: 'Telegram group', placeholder: 'https://t.me/your_group', Icon: GroupsIcon },
  { key: 'facebookUrl', label: 'Promotional Telegram URL 1', placeholder: 'https://t.me/your_channel', Icon: Telegram, promotional: true },
  { key: 'instagramUrl', label: 'Promotional Telegram URL 2', placeholder: 'https://t.me/your_channel', Icon: Telegram, promotional: true },
];

const TelegramLinksPage = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({});
  const [form, setForm] = useState({
    telegramUrl: '',
    groupTelegramUrl: '',
    // promotionalUrl: '',
    facebookUrl: '',
    instagramUrl: '',
  });
  const [error, setError] = useState(null);

  const fetchSocialConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tradeService.getSocialConfig();
      if (response?.success && response?.data != null) {
        const data = response.data;
        setConfig(data);
        setForm({
          telegramUrl: data.telegramUrl ?? '',
          groupTelegramUrl: data.groupTelegramUrl ?? '',
        });
      } else {
        setError(response?.message || 'Failed to load social config');
      }
    } catch (err) {
      console.error('Error fetching social config:', err);
      const msg = err?.message || err?.data?.message || 'Failed to load social config';
      setError(msg);
      showSnackbar(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialConfig();
  }, []);

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const body = {
        telegramUrl: form.telegramUrl?.trim() || '',
        groupTelegramUrl: form.groupTelegramUrl?.trim() || '',
        facebookUrl: form.facebookUrl?.trim() || '',
        instagramUrl: form.instagramUrl?.trim() || '',
      };
      const response = await tradeService.updateSocialConfig(body);
      if (response?.success) {
        setConfig(response.data ?? body);
        showSnackbar(response.message || 'Telegram links updated successfully', 'success');
      } else {
        showSnackbar(response?.message || 'Failed to update', 'error');
      }
    } catch (err) {
      const msg = err?.message || err?.data?.message || 'Failed to update Telegram links';
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
            background: `linear-gradient(90deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          Telegram Links
        </Typography>
        <Typography variant="body1" sx={{ color: AppColors.TXT_SUB, fontWeight: 400, mt: 0.5 }}>
          Set your official Telegram channel and group URLs. Leave empty to hide a link.
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
              transition: 'border-color 0.2s ease',
              '&:hover': { borderColor: AppColors.HLT_LIGHT },
            }}
          >
            <CardContent sx={{ py: 3, px: 3 }}>
              <Typography
                variant="overline"
                sx={{
                  color: AppColors.GOLD_DARK,
                  fontWeight: 600,
                  letterSpacing: 1.2,
                  display: 'block',
                  mb: 2,
                }}
              >
                Current links
              </Typography>
              {TELEGRAM_FIELDS?.filter(({ promotional }) => promotional !== true).map(({ key, label, Icon }) => (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: AppColors.HLT_LIGHT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ color: AppColors.GOLD_DARK, fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, fontSize: '0.75rem' }}>
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: config[key] ? AppColors.TXT_MAIN : AppColors.TXT_SUB,
                        fontWeight: config[key] ? 500 : 400,
                      }}
                      noWrap
                    >
                      {config[key] ? 'Configured' : 'Not set'}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ borderColor: AppColors.BG_SECONDARY }} orientation="horizontal" textAlign="left" >
                <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, fontSize: '0.75rem' }}>Promotional links</Typography>
              </Divider>
              {TELEGRAM_FIELDS?.filter(({ promotional }) => promotional === true).map(({ key, label, Icon }) => (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: AppColors.HLT_LIGHT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ color: AppColors.GOLD_DARK, fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, fontSize: '0.75rem' }}>
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: config[key] ? AppColors.TXT_MAIN : AppColors.TXT_SUB,
                        fontWeight: config[key] ? 500 : 400,
                      }}
                      noWrap
                    >
                      {config[key] ? 'Configured' : 'Not set'}
                    </Typography>
                  </Box>
                </Box>
              ))}
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
              transition: 'border-color 0.2s ease',
              '&:hover': { borderColor: AppColors.HLT_LIGHT },
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
                  borderRadius: 1.5,
                  '& .MuiAlert-icon': { color: AppColors.ERROR },
                }}
              >
                {error}
              </Alert>
            )}

            <Typography
              variant="subtitle1"
              sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mb: 2.5 }}
            >
              Update Telegram links
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {TELEGRAM_FIELDS?.filter(({ promotional }) => promotional !== true).map(({ key, label, placeholder, Icon }) => (
                <TextField
                  key={key}
                  fullWidth
                  label={label}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={handleChange(key)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon sx={{ color: AppColors.GOLD_DARK, fontSize: 22 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: AppColors.BG_SECONDARY,
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'transparent' },
                      '&:hover fieldset': { borderColor: AppColors.GOLD_DARK + '40' },
                      '&.Mui-focused fieldset': { borderColor: AppColors.GOLD_DARK, borderWidth: 1 },
                    },
                  }}
                  InputLabelProps={{ sx: { color: AppColors.TXT_SUB } }}
                />
              ))}
            </Box>
            <Divider sx={{ borderColor: AppColors.BG_SECONDARY, my: 2 }} orientation="horizontal" textAlign="left" >
              <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, fontSize: '0.75rem' }}>Promotional links</Typography>
            </Divider>
            {TELEGRAM_FIELDS?.filter(({ promotional }) => promotional === true).map(({ key, label, placeholder, Icon }) => (
              <TextField
                key={key}
                fullWidth
                label={label}
                placeholder={placeholder}
                value={form[key]}
                onChange={handleChange(key)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon sx={{ color: AppColors.GOLD_DARK, fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: AppColors.BG_SECONDARY,
                    borderRadius: 2,
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: AppColors.GOLD_DARK + '40' },
                    '&.Mui-focused fieldset': { borderColor: AppColors.GOLD_DARK, borderWidth: 1 },
                  },
                }}
                InputLabelProps={{ sx: { color: AppColors.TXT_SUB } }}
                sx={{ mb: 2 }}
              />
            ))}
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: AppColors.BG_SECONDARY + '80',
              }}
            >
              <InfoOutlined sx={{ fontSize: 18, color: AppColors.TXT_SUB, mt: 0.25, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, lineHeight: 1.5 }}>
                Use full URLs (e.g. https://t.me/your_channel). Empty fields will not be shown to users.
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button className="btn-primary" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <CircularProgress size={20} sx={{ color: 'inherit', mr: 1 }} />
                    Saving…
                  </>
                ) : (
                  'Save Telegram links'
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TelegramLinksPage;
