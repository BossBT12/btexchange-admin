import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Chip,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Close,
  FileCopy,
  OpenInNew,
  Refresh,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { AppColors } from '../constant/appColors';
import tradeService from '../services/tradeService';

const AddressDetailModal = ({ isOpen, onClose, address, chain }) => {
  const [addressData, setAddressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sweepEligibility, setSweepEligibility] = useState(null);

  useEffect(() => {
    if (isOpen && address && chain) {
      loadAddressDetails();
    }
  }, [isOpen, address, chain]);

  const loadAddressDetails = async () => {
    setLoading(true);
    try {
      const [balanceResponse, eligibilityResponse] = await Promise.allSettled([
        tradeService.getAddressBalance(address, chain),
        tradeService.checkSweepEligibility(address, chain)
      ]);

      if (balanceResponse.status === 'fulfilled') {
        setAddressData(balanceResponse.value);
      }

      if (eligibilityResponse.status === 'fulfilled') {
        setSweepEligibility(eligibilityResponse.value.data);
      }
    } catch (error) {
      console.error('Error loading address details:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getExplorerUrl = () => {
    const explorers = {
      BSC: 'https://bscscan.com',
      ETH: 'https://etherscan.io',
      POLYGON: 'https://polygonscan.com'
    };
    return `${explorers[chain]}/address/${address}`;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${AppColors.BG_CARD} 0%, ${AppColors.BG_SECONDARY} 100%)`,
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: AppColors.BG_CARD,
          borderBottom: `1px solid ${AppColors.BG_SECONDARY}`,
          p: { xs: 1, md: 1.5 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: AppColors.TXT_MAIN,
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Address Details
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: AppColors.TXT_SUB,
              }}
            >
              {chain} Network
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: AppColors.TXT_SUB,
              '&:hover': {
                color: AppColors.TXT_MAIN,
                bgcolor: AppColors.BG_SECONDARY
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1, md: 1.5 } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: AppColors.GOLD_DARK }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Address Information */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: AppColors.BG_SECONDARY,
                border: `1px solid ${AppColors.BG_SECONDARY}`,
                borderRadius: 2,
                p: { xs: 1, md: 1.5 }
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: AppColors.TXT_MAIN,
                  fontWeight: 600,
                  mb: { xs: 0.5, md: 1 }
                }}
              >
                Address Information
              </Typography>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: AppColors.TXT_SUB, mb: { xs: 0.5, md: 1 } }}
                >
                  Wallet Address
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontFamily: 'monospace',
                      bgcolor: AppColors.BG_CARD,
                      p: { xs: 1, md: 1.5 },
                      borderRadius: 1,
                      flex: 1,
                      wordBreak: 'break-all'
                    }}
                  >
                    {address}
                  </Typography>
                  <IconButton
                    onClick={() => copyToClipboard(address)}
                    size="small"
                    sx={{
                      color: AppColors.TXT_SUB,
                      '&:hover': {
                        color: AppColors.GOLD_DARK,
                        bgcolor: `${AppColors.GOLD_DARK}20`
                      }
                    }}
                  >
                    <FileCopy />
                  </IconButton>
                </Box>
              </Box>
            </Paper>

            {/* Balance Information */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: AppColors.BG_SECONDARY,
                border: `1px solid ${AppColors.BG_SECONDARY}`,
                borderRadius: 2,
                p: 3
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: AppColors.TXT_MAIN,
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Balance Information
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: AppColors.TXT_SUB, mb: 1 }}
                    >
                      USDT Balance
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        bgcolor: AppColors.BG_CARD,
                        p: 2,
                        borderRadius: 2
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          color: AppColors.GOLD_DARK,
                          fontWeight: 700
                        }}
                      >
                        ${addressData?.data || '0.00'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: AppColors.TXT_SUB }}
                      >
                        USDT
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
                <Grid xs={12} md={6}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: AppColors.TXT_SUB, mb: 1 }}
                    >
                      Chain
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        bgcolor: AppColors.BG_CARD,
                        p: 2,
                        borderRadius: 2
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          color: AppColors.GOLD_DARK,
                          fontWeight: 600
                        }}
                      >
                        {chain}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Sweep Eligibility */}
            {sweepEligibility && (
              <Paper
                elevation={0}
                sx={{
                  bgcolor: AppColors.BG_SECONDARY,
                  border: `1px solid ${AppColors.BG_SECONDARY}`,
                  borderRadius: 2,
                  p: 3
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: AppColors.TXT_MAIN,
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Sweep Eligibility
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="body1" sx={{ color: AppColors.TXT_SUB }}>
                    Can Sweep:
                  </Typography>
                  <Chip
                    icon={sweepEligibility.canSweep ? <CheckCircle /> : <Cancel />}
                    label={sweepEligibility.canSweep ? 'Yes' : 'No'}
                    color={sweepEligibility.canSweep ? 'success' : 'error'}
                    sx={{
                      '& .MuiChip-icon': {
                        fontSize: '1rem'
                      }
                    }}
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{ color: AppColors.TXT_SUB, mb: 1 }}
                      >
                        USDT Balance
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          bgcolor: AppColors.BG_CARD,
                          p: 2,
                          borderRadius: 2
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}
                        >
                          ${sweepEligibility.usdtBalance}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                  
                  <Grid xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{ color: AppColors.TXT_SUB, mb: 1 }}
                      >
                        Native Balance
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          bgcolor: AppColors.BG_CARD,
                          p: 2,
                          borderRadius: 2
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}
                        >
                          {sweepEligibility.nativeBalance} {chain === 'BSC' ? 'BNB' : chain === 'ETH' ? 'ETH' : 'MATIC'}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                  
                  <Grid xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{ color: AppColors.TXT_SUB, mb: 1 }}
                      >
                        Gas Required
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          bgcolor: AppColors.BG_CARD,
                          p: 2,
                          borderRadius: 2
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}
                        >
                          {sweepEligibility.gasRequired} {chain === 'BSC' ? 'BNB' : chain === 'ETH' ? 'ETH' : 'MATIC'}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
                
                {sweepEligibility.message && (
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: sweepEligibility.canSweep 
                        ? `${AppColors.SUCCESS}20` 
                        : `${AppColors.ERROR}20`,
                      border: `1px solid ${sweepEligibility.canSweep ? AppColors.SUCCESS : AppColors.ERROR}30`
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: sweepEligibility.canSweep 
                          ? AppColors.SUCCESS 
                          : AppColors.ERROR,
                      }}
                    >
                      {sweepEligibility.message}
                    </Typography>
                  </Paper>
                )}
              </Paper>
            )}

            {/* Quick Actions */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: AppColors.BG_SECONDARY,
                border: `1px solid ${AppColors.BG_SECONDARY}`,
                borderRadius: 2,
                p: 3
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: AppColors.TXT_MAIN,
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <Button
                    onClick={() => window.open(getExplorerUrl(), '_blank')}
                    variant="outlined"
                    startIcon={<OpenInNew />}
                    fullWidth
                    sx={{
                      borderColor: AppColors.TXT_SUB,
                      color: AppColors.TXT_SUB,
                      '&:hover': {
                        borderColor: AppColors.GOLD_DARK,
                        color: AppColors.GOLD_DARK,
                        bgcolor: `${AppColors.GOLD_DARK}10`
                      },
                      py: 1.5
                    }}
                  >
                    View on Explorer
                  </Button>
                </Grid>
                
                <Grid xs={12} md={6}>
                  <Button
                    onClick={loadAddressDetails}
                    variant="contained"
                    startIcon={<Refresh />}
                    fullWidth
                    sx={{
                      bgcolor: AppColors.GOLD_DARK,
                      color: AppColors.BG_MAIN,
                      '&:hover': {
                        bgcolor: AppColors.GOLD_LIGHT,
                      },
                      py: 1.5
                    }}
                  >
                    Refresh
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: AppColors.BG_CARD,
          borderTop: `1px solid ${AppColors.BG_SECONDARY}`,
          p: 3
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: AppColors.TXT_SUB,
            color: AppColors.TXT_SUB,
            '&:hover': {
              borderColor: AppColors.TXT_MAIN,
              color: AppColors.TXT_MAIN,
              bgcolor: AppColors.BG_SECONDARY
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressDetailModal;