import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
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
  TablePagination,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Refresh,
  PeopleAlt,
  Savings,
  FileCopy,
  OpenInNew,
} from '@mui/icons-material';
import tradeService from '../../../services/tradeService';
import { AppColors } from '../../../constant/appColors';
import useSnackbar from '../../../hooks/useSnackbar';
import { formatAddress, formatBalance, formatCurrency, getChainConfig, getExplorerUrl } from '../../../utils/fundUtils';
import BTLoader from '../../../components/Loader';

const CHAINS = ['BSC', 'POLYGON'];
const PAGE_SIZE = 10;

const emptyData = () => ({
  chain: '',
  totalAddresses: 0,
  addressesWithBalance: 0,
  totalBalance: 0,
  addresses: [],
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 },
});

const ManageFunds = () => {
  const { showSnackbar } = useSnackbar();
  const [activeChain, setActiveChain] = useState('BSC');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(emptyData);
  const [page, setPage] = useState(0);

  const loadFundAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tradeService.getChainBalances({
        chain: activeChain,
        page: page + 1,
        limit: PAGE_SIZE,
      });
      if (res?.success && res.data) {
        setData({
          chain: res.data.chain ?? activeChain,
          totalAddresses: res.data.totalAddresses ?? 0,
          addressesWithBalance: res.data.addressesWithBalance ?? 0,
          totalBalance: res.data.totalBalance ?? 0,
          addresses: Array.isArray(res.data.addresses) ? res.data.addresses : [],
          pagination: res.data.pagination ?? {
            page: page + 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
          },
        });
      } else {
        setData(emptyData());
        showSnackbar(res?.message || 'Unable to load fund addresses', 'error');
      }
    } catch (error) {
      console.error('Error loading fund addresses:', error);
      setData(emptyData());
      showSnackbar('Failed to load fund addresses', 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- showSnackbar from context
  }, [activeChain, page]);

  useEffect(() => {
    loadFundAddresses();
  }, [loadFundAddresses]);

  const handleChainTab = (_, chain) => {
    setActiveChain(chain);
    setPage(0);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const totalCount = data.pagination?.total ?? 0;

  return (
    <Box sx={{ bgcolor: AppColors.BG_MAIN, minHeight: '100vh' }}>
      <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1,
          }}
        >
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
            <Typography variant="body1" sx={{ color: AppColors.TXT_SUB, fontWeight: 400 }}>
              Deposit addresses and balances for the selected chain
            </Typography>
          </Box>
          <Button
            className="btn-primary"
            onClick={loadFundAddresses}
            disabled={loading}
            startIcon={<Refresh />}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      <Tabs
        value={activeChain}
        onChange={handleChainTab}
        sx={{
          minHeight: '2.25rem',
          bgcolor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 3,
          mb: { xs: 1, md: 1.5 },
          '& .MuiTabs-indicator': {
            backgroundColor: AppColors.GOLD_DARK,
          },
          '& .MuiTab-root': {
            minHeight: '2.25rem',
            padding: { xs: '8px 12px', md: '10px 16px' },
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
        {CHAINS.map((chain) => {
          const cfg = getChainConfig(chain);
          return (
            <Tab
              key={chain}
              value={chain}
              label={chain}
              icon={<img src={cfg.icon} alt="" style={{ width: 20, height: 20 }} />}
              iconPosition="start"
            />
          );
        })}
      </Tabs>

      <Grid container spacing={{ xs: 1, md: 1.5 }} sx={{ mb: { xs: 1, md: 1.5 } }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            title="Total addresses"
            value={String(data.totalAddresses)}
            icon={<PeopleAlt sx={{ fontSize: 28 }} />}
            subtitle={`${activeChain} network`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            title="With balance"
            value={String(data.addressesWithBalance)}
            icon={<AccountBalanceWallet sx={{ fontSize: 28 }} />}
            subtitle="Addresses holding USDT"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            title="Total balance"
            value={formatCurrency(data.totalBalance)}
            icon={<Savings sx={{ fontSize: 28 }} />}
            subtitle="USDT across all addresses"
          />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 3,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${AppColors.BG_CARD} 0%, ${AppColors.BG_SECONDARY} 100%)`,
        }}
      >
        <Box sx={{ p: { xs: 1, md: 1.5 }, borderBottom: `1px solid ${AppColors.BG_SECONDARY}` }}>
          <Typography variant="h6" sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
            Addresses
          </Typography>
          <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, mt: 0.5 }}>
            {activeChain} · {totalCount} total
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', minHeight: 200 }}>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${AppColors.BG_MAIN}cc`,
                zIndex: 1,
              }}
            >
              <BTLoader />
            </Box>
          )}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }}>Address</TableCell>
                  <TableCell sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }}>User ID</TableCell>
                  <TableCell sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }} align="right">
                    Index
                  </TableCell>
                  <TableCell sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }} align="right">
                    Balance (USDT)
                  </TableCell>
                  <TableCell sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }}>Has balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && data.addresses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: AppColors.TXT_SUB }}>
                      No addresses for this chain
                    </TableCell>
                  </TableRow>
                )}
                {data.addresses.map((row) => (
                  <TableRow key={`${row.address}-${row.derivationIndex}`} sx={{ '&:hover': { bgcolor: `${AppColors.BG_SECONDARY}50` } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ color: AppColors.TXT_MAIN, fontFamily: 'monospace' }}>
                          {formatAddress(row.address, 8, 6)}
                        </Typography>
                        <Tooltip title="Copy address">
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(row.address);
                              showSnackbar('Address copied', 'success');
                            }}
                            sx={{ color: AppColors.TXT_SUB, '&:hover': { color: AppColors.GOLD_DARK } }}
                          >
                            <FileCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View on explorer">
                          <IconButton
                            size="small"
                            onClick={() => window.open(getExplorerUrl(activeChain, row.address), '_blank')}
                            sx={{ color: AppColors.TXT_SUB, '&:hover': { color: AppColors.GOLD_DARK } }}
                          >
                            <OpenInNew fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: AppColors.TXT_MAIN }}>
                        {row.user ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {row.userId ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: AppColors.TXT_MAIN }}>
                        {row.derivationIndex ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}>
                        ${formatBalance(row.balance)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.hasBalance ? 'Yes' : 'No'}
                        size="small"
                        color={row.hasBalance ? 'success' : 'default'}
                        sx={{ '& .MuiChip-label': { fontSize: '0.75rem' } }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={PAGE_SIZE}
            onRowsPerPageChange={() => {}}
            rowsPerPageOptions={[PAGE_SIZE]}
            sx={{
              borderTop: `1px solid ${AppColors.BG_SECONDARY}`,
              backgroundColor: AppColors.BG_CARD,
              '& .MuiTablePagination-toolbar': { color: AppColors.TXT_MAIN },
              '& .MuiTablePagination-select': { color: AppColors.TXT_MAIN },
              '& .MuiTablePagination-actions button': { color: AppColors.GOLD_DARK },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

const MetricCard = ({ title, value, icon, subtitle }) => (
  <Paper
    elevation={0}
    sx={{
      backgroundColor: AppColors.BG_CARD,
      border: `1px solid ${AppColors.BG_SECONDARY}`,
      borderRadius: 3,
      p: { xs: 1, md: 1.5 },
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
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
        <Typography variant="h4" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: AppColors.TXT_MAIN, fontWeight: 500 }}>
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
    <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, fontSize: '0.75rem' }}>
      {subtitle}
    </Typography>
  </Paper>
);

export default ManageFunds;
