import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Divider
} from '@mui/material';
import {
  AccountBalanceWallet,
  Refresh,
  GetApp,
  Visibility,
  FileCopy,
  OpenInNew,
  SwapHoriz,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  MonetizationOn
} from '@mui/icons-material';
import networkService from '../../../services/networkService';
import { AppColors } from '../../../constant/appColors';
import AddressDetailModal from '../../../components/AddressDetailModal';
import useSnackbar from '../../../hooks/useSnackbar';
import {
  formatAddress,
  formatBalance,
  formatCurrency,
  getChainConfig,
  getExplorerUrl,
  validateAddress,
  getBalanceStatus,
  generateSweepRecommendations,
  exportToCSV
} from '../../../utils/fundUtils';
import BTLoader from '../../../components/Loader';

const NetworkManageFunds = () => {
  const { showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [activeChain, setActiveChain] = useState('BSC');
  const [loading, setLoading] = useState(false);
  const [chainBalances, setChainBalances] = useState({
    BSC: {},
    ETH: {},
    POLYGON: {}
  });
  const [addressSearch, setAddressSearch] = useState('');
  const [sweepStatus, setSweepStatus] = useState({});
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedChain, setSelectedChain] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minSweepAmount, setMinSweepAmount] = useState(10);

  const chains = ['BSC', 'ETH', 'POLYGON'];

  useEffect(() => {
    loadChainBalances();
  }, []);

  const loadChainBalances = async () => {
    setLoading(true);
    try {
      const response = await networkService.getAllFunds();
      if (response.success && response.data) {
        const newBalances = {};

        // Process the response data which is grouped by chain
        Object.entries(response.data).forEach(([chain, chainData]) => {
          if (chainData.details && Array.isArray(chainData.details)) {
            const addressMap = {};
            chainData.details.forEach(detail => {
              if (detail.address && detail.balance !== undefined) {
                addressMap[detail.address] = detail.balance;
              }
            });
            newBalances[chain] = addressMap;
          }
        });

        setChainBalances(newBalances);
      }
    } catch (error) {
      console.error('Error loading chain balances:', error);
      showSnackbar('Failed to load chain balances', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTotalBalance = (chain) => {
    const balances = chainBalances[chain] || {};
    return Object.values(balances).reduce((sum, balance) => sum + parseFloat(balance || 0), 0);
  };

  const getGrandTotalBalance = () => {
    return chains.reduce((total, chain) => total + getTotalBalance(chain), 0);
  };

  const handleSweepAddress = async (address, chain) => {
    setLoading(true);
    setSweepStatus(prev => ({ ...prev, [`${address}-${chain}`]: 'processing' }));

    try {
      const response = await networkService.sweepAddress({
        userAddress: address,
        chain: chain
      });

      if (response.success) {
        setSweepStatus(prev => ({ ...prev, [`${address}-${chain}`]: 'success' }));
        showSnackbar(`Successfully swept funds from ${address.substring(0, 10)}...`, 'success');
        await loadChainBalances();
      } else {
        throw new Error(response.message || 'Sweep failed');
      }
    } catch (error) {
      setSweepStatus(prev => ({ ...prev, [`${address}-${chain}`]: 'error' }));
      showSnackbar(`Failed to sweep from ${address.substring(0, 10)}...`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSweepAll = async (chain) => {
    setLoading(true);
    try {
      const response = await networkService.sweepAll({
        chain: chain,
        minAmount: minSweepAmount || undefined
      });

      if (response.success) {
        showSnackbar(`Successfully swept all funds from ${chain}`, 'success');
        await loadChainBalances();
      } else {
        throw new Error(response.message || 'Sweep failed');
      }
    } catch (error) {
      showSnackbar(`Failed to sweep all funds from ${chain}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (address, chain) => {
    setSelectedAddress(address);
    setSelectedChain(chain);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAddress(null);
    setSelectedChain(null);
  };

  const handleExportData = () => {
    const exportData = [];
    exportData.push(['Chain', 'Address', 'Balance (USDT)', 'Status']);

    chains.forEach(chain => {
      Object.entries(chainBalances[chain] || {}).forEach(([address, balance]) => {
        const status = getBalanceStatus(balance);
        exportData.push([chain, address, formatBalance(balance), status.message]);
      });
    });

    const filename = `network_fund_report_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(exportData, filename);
    showSnackbar('Data exported successfully', 'success');
  };

  const renderOverview = () => (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={{ xs: 1, md: 1.5 }} sx={{ mb: { xs: 1, md: 1.5 } }}>
        <Grid size={{ xs: 6, lg: 3 }}>
          <MetricCard
            title="Total Balance"
            value={formatCurrency(getGrandTotalBalance())}
            icon={<MonetizationOn sx={{ fontSize: 28 }} />}
            trend="positive"
            subtitle="All chains combined"
          />
        </Grid>
        {chains.map((chain) => {
          const config = getChainConfig(chain);
          return (
            <Grid size={{ xs: 6, lg: 3 }} key={chain}>
              <MetricCard
                title={`${chain} Balance`}
                value={formatCurrency(getTotalBalance(chain))}
                icon={<img src={config.icon} alt={chain} style={{ width: 20, height: 20 }} />}
                trend="positive"
                subtitle={`${Object.keys(chainBalances[chain] || {}).length} addresses`}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Sweep Settings */}
      <DashboardCard
        title="Sweep Settings"
        subtitle="Configure minimum amount for sweep operations"
      >
        <Box sx={{ display: 'flex', flex: 'wrap', flexDirection: { xs: 'column', md: 'row' }, gap: 1 }}>
          <TextField
            label="Minimum Sweep Amount (USDT)"
            type="number"
            value={minSweepAmount}
            onChange={(e) => setMinSweepAmount(parseFloat(e.target.value) || 0)}
            placeholder="10"
            fullWidth
            variant="outlined"
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: AppColors.BG_SECONDARY,
                '& fieldset': {
                  borderColor: AppColors.BG_SECONDARY,
                },
                '&:hover fieldset': {
                  borderColor: AppColors.GOLD_DARK,
                },
                '&.Mui-focused fieldset': {
                  borderColor: AppColors.GOLD_DARK,
                },
              },
              '& .MuiInputLabel-root': {
                color: AppColors.TXT_SUB,
                '&.Mui-focused': {
                  color: AppColors.GOLD_DARK,
                },
              },
              '& .MuiInputBase-input': {
                py: 1.5,
                color: AppColors.TXT_MAIN,
              }
            }}
          />
          <Button
            className='btn-primary'
            onClick={loadChainBalances}
            disabled={loading}
            startIcon={<Refresh />}
          >
            {loading ? 'Refreshing...' : 'Refresh Balances'}
          </Button>
        </Box>
      </DashboardCard>

      {/* Quick Actions */}
      <Grid container spacing={{ xs: 1, md: 1.5 }} sx={{ mt: { xs: 1, md: 1.5 } }}>
        {chains.map((chain) => {
          const config = getChainConfig(chain);
          return (
            <Grid size={{ xs: 12, md: 4 }} key={chain}>
              <DashboardCard
                title={`${config.name} Actions`}
                subtitle={`${Object.keys(chainBalances[chain] || {}).length} addresses`}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    className='btn-primary'
                    onClick={() => handleSweepAll(chain)}
                    disabled={loading || getTotalBalance(chain) === 0}
                    startIcon={<SwapHoriz />}
                  >
                    Sweep All ({Object.keys(chainBalances[chain] || {}).length})
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveTab(1);
                      setActiveChain(chain);
                    }}
                    variant="outlined"
                    startIcon={<Visibility />}
                    sx={{
                      borderColor: AppColors.GOLD_DARK,
                      color: AppColors.GOLD_DARK,
                      '&:hover': {
                        borderColor: AppColors.GOLD_LIGHT,
                        bgcolor: `${AppColors.GOLD_DARK}10`,
                      },
                    }}
                  >
                    Manage Addresses
                  </Button>
                </Box>
              </DashboardCard>
            </Grid>
          );
        })}
      </Grid>
    </Box >
  );

  const renderManagement = () => (
    <Box>
      {/* Chain Selector */}
      <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
        <Grid container spacing={{ xs: 1, md: 1.5 }}>
          {chains.map((chain) => {
            const config = getChainConfig(chain);
            const isActive = activeChain === chain;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={chain}>
                <Button
                  onClick={() => setActiveChain(chain)}
                  fullWidth
                  className={isActive && 'btn-primary'}
                  startIcon={<img src={config.icon} alt={chain} style={{ width: 20, height: 20, filter: isActive ? 'brightness(0)' : 'none' }} />}
                  sx={{
                    bgcolor: !isActive && 'transparent',
                    border: '1px solid',
                    borderColor: !isActive && AppColors.GOLD_DARK,
                    color: !isActive && AppColors.GOLD_DARK,
                    '&:hover': {
                      bgcolor: !isActive && `${AppColors.GOLD_DARK}10`,
                      borderColor: !isActive && AppColors.GOLD_LIGHT,
                    },
                    py: 1.5
                  }}
                >
                  {chain} ({Object.keys(chainBalances[chain] || {}).length})
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Search and Filters */}
      <DashboardCard
        title={`${activeChain} Management`}
        subtitle={`${Object.keys(chainBalances[activeChain] || {}).length} addresses • Total: ${formatCurrency(getTotalBalance(activeChain))}`}
      >
        <Grid container spacing={{ xs: 1, md: 1.5 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Search Address"
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
              placeholder="Enter address to search..."
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: AppColors.BG_SECONDARY,
                  '& fieldset': {
                    borderColor: AppColors.BG_SECONDARY,
                  },
                  '&:hover fieldset': {
                    borderColor: AppColors.GOLD_DARK,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: AppColors.GOLD_DARK,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: AppColors.TXT_SUB,
                  '&.Mui-focused': {
                    color: AppColors.GOLD_DARK,
                  },
                },
                '& .MuiInputBase-input': {
                  color: AppColors.TXT_MAIN,
                },
              }}
            />
          </Grid>
        </Grid>
      </DashboardCard>

      {/* Address List */}
      <DashboardCard
        title="Address List"
        subtitle={`Showing ${Object.entries(chainBalances[activeChain] || {}).filter(([address]) =>
          !addressSearch || address.toLowerCase().includes(addressSearch.toLowerCase())
        ).length} addresses`}
        sx={{ mt: { xs: 1, md: 1.5 } }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }}>
                  Address
                </TableCell>
                <TableCell sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }}>
                  Balance
                </TableCell>
                <TableCell sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(chainBalances[activeChain] || {})
                .filter(([address]) =>
                  !addressSearch || address.toLowerCase().includes(addressSearch.toLowerCase())
                )
                .map(([address, balance]) => {
                  const statusKey = `${address}-${activeChain}`;
                  const status = sweepStatus[statusKey];
                  const balanceStatus = getBalanceStatus(balance);

                  return (
                    <TableRow key={address} sx={{ '&:hover': { bgcolor: `${AppColors.BG_SECONDARY}50` } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: AppColors.TXT_MAIN, fontFamily: 'monospace' }}>
                            {formatAddress(address, 10, 8)}
                          </Typography>
                          <Tooltip title="Copy address">
                            <IconButton
                              size="small"
                              onClick={() => navigator.clipboard.writeText(address)}
                              sx={{ color: AppColors.TXT_SUB, '&:hover': { color: AppColors.GOLD_DARK } }}
                            >
                              <FileCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View on explorer">
                            <IconButton
                              size="small"
                              onClick={() => window.open(getExplorerUrl(activeChain, address), '_blank')}
                              sx={{ color: AppColors.TXT_SUB, '&:hover': { color: AppColors.GOLD_DARK } }}
                            >
                              <OpenInNew fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                            ${formatBalance(balance)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: AppColors.TXT_SUB }}>
                            USDT
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            status === 'success' ? 'Swept' :
                              status === 'processing' ? 'Processing' :
                                status === 'error' ? 'Error' :
                                  balanceStatus.message
                          }
                          size="small"
                          color={
                            status === 'success' ? 'success' :
                              status === 'processing' ? 'warning' :
                                status === 'error' ? 'error' :
                                  balanceStatus.color === 'green' ? 'success' :
                                    balanceStatus.color === 'blue' ? 'info' :
                                      balanceStatus.color === 'yellow' ? 'warning' :
                                        'default'
                          }
                          sx={{
                            '& .MuiChip-label': {
                              fontSize: '0.75rem'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(address, activeChain)}
                              sx={{
                                bgcolor: `${AppColors.TXT_SUB}20`,
                                color: AppColors.TXT_SUB,
                                '&:hover': {
                                  bgcolor: `${AppColors.GOLD_DARK}20`,
                                  color: AppColors.GOLD_DARK
                                }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button
                            className='btn-primary'
                            onClick={() => handleSweepAddress(address, activeChain)}
                            disabled={loading || parseFloat(balance || 0) === 0 || status === 'processing'}
                            size="small"
                          >
                            {status === 'processing' ? 'Sweeping...' : 'Sweep'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          {Object.keys(chainBalances[activeChain] || {}).length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: AppColors.TXT_SUB }}>
                No addresses found for {activeChain}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </DashboardCard>
    </Box>
  );

  if (loading && !chainBalances) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          bgcolor: AppColors.BG_MAIN
        }}
      >
        <BTLoader />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: AppColors.BG_MAIN }}>
      {/* MainHeader */}
      <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: AppColors.TXT_MAIN,
                mb: { xs: 0.5, md: 1 },
                background: `linear-gradient(45deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Fund Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: AppColors.TXT_SUB,
                fontWeight: 400
              }}
            >
              Manage treasury funds and user deposit addresses across multiple chains
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 }, mt: { xs: 1, md: 0 } }}>
            <Button
              onClick={handleExportData}
              variant="outlined"
              startIcon={<GetApp />}
              sx={{
                px: { xs: 1, md: 1.5 },
                py: { xs: 0.27, md: 0.5 },
                borderColor: AppColors.GOLD_DARK,
                color: AppColors.GOLD_DARK,
                '&:hover': {
                  borderColor: AppColors.GOLD_LIGHT,
                  color: AppColors.GOLD_LIGHT,
                  bgcolor: `${AppColors.GOLD_DARK}10`
                }
              }}
            >
              Export
            </Button>
            <Paper
              elevation={0}
              sx={{
                bgcolor: AppColors.BG_CARD,
                border: `1px solid ${AppColors.BG_SECONDARY}`,
                px: { xs: 1, md: 1.5 },
                py: { xs: 0.5, md: 0.75 },
                borderRadius: 2
              }}
            >
              <Typography variant="caption" sx={{ color: AppColors.TXT_SUB }}>
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          minHeight: "2.25rem",
          bgcolor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 3,
          mb: { xs: 1, md: 1.5 },
          '& .MuiTabs-indicator': {
            backgroundColor: AppColors.GOLD_DARK,
          },
          '& .MuiTab-root': {
            minHeight: "2.25rem",
            padding: { xs: '8px 8px', md: '10px 10px' },
            fontSize: { xs: '0.75rem', md: '0.875rem' },
            textTransform: 'none',
            fontWeight: 500,
            color: AppColors.TXT_SUB,
            '&.Mui-selected': {
              color: AppColors.GOLD_DARK,
            },
          },
        }}
      >
        <Tab
          icon={<AccountBalanceWallet />}
          label="Overview"
          iconPosition="start"
        />
        <Tab
          icon={<SwapHoriz />}
          label="Manage Addresses"
          iconPosition="start"
        />
      </Tabs>

      {/* Content */}
      <Box>
        {activeTab === 0 ? renderOverview() : renderManagement()}
      </Box>

      {/* Address Detail Modal */}
      <AddressDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        address={selectedAddress}
        chain={selectedChain}
      />
    </Box >
  );
};

// Reusable Dashboard Card Component
const DashboardCard = ({ title, subtitle, children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      backgroundColor: AppColors.BG_CARD,
      border: `1px solid ${AppColors.BG_SECONDARY}`,
      borderRadius: 3,
      p: { xs: 1, md: 1.5 },
      height: '100%',
      background: `linear-gradient(135deg, ${AppColors.BG_CARD} 0%, ${AppColors.BG_SECONDARY} 100%)`,
      ...sx
    }}
  >
    <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
      <Typography
        variant="h6"
        sx={{
          color: AppColors.TXT_MAIN,
          fontWeight: 600,
          mb: { xs: 0.5, md: 1 },
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: AppColors.TXT_SUB,
          fontSize: '0.875rem',
        }}
      >
        {subtitle}
      </Typography>
    </Box>
    {children}
  </Paper>
);

// Metric Card Component
const MetricCard = ({ title, value, icon, trend, subtitle }) => (
  <Paper
    elevation={0}
    sx={{
      backgroundColor: AppColors.BG_CARD,
      border: `1px solid ${AppColors.BG_SECONDARY}`,
      borderRadius: 3,
      p: { xs: 1, md: 1.5 },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: { xs: 0.5, md: 1 } }}>
      <Box>
        <Typography
          variant="h4"
          sx={{
            color: AppColors.GOLD_DARK,
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: AppColors.TXT_MAIN,
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          p: { xs: 1, md: 1.5 },
          borderRadius: 2,
          backgroundColor: `${AppColors.GOLD_DARK}20`,
          color: AppColors.GOLD_DARK,
        }}
      >
        {icon}
      </Box>
    </Box>
    <Typography
      variant="caption"
      sx={{
        color: AppColors.TXT_SUB,
        fontSize: '0.75rem',
      }}
    >
      {subtitle}
    </Typography>
  </Paper>
);

export default NetworkManageFunds;
