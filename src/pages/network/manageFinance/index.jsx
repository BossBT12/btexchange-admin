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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableFooter,
  TableRow,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  TrendingUp,
  ArrowDownward,
  ArrowUpward,
  GetApp,
  History,
  Visibility,
  Search,
  Clear,
} from '@mui/icons-material';
import networkService from '../../../services/networkService';
import { AppColors } from '../../../constant/appColors';
import BTLoader from '../../../components/Loader';
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const NetworkManageHistoryNLogs = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    userId: '',
    incomeType: '',
    chain: '',
    status: '',
    startDate: null,
    endDate: null
  });
  const [appliedDateRange, setAppliedDateRange] = useState({ startDate: null, endDate: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [incomeStats, setIncomeStats] = useState(null);
  const [incomeDetailItem, setIncomeDetailItem] = useState(null);
  const [depositStats, setDepositStats] = useState(null);
  const [depositDetailItem, setDepositDetailItem] = useState(null);

  const tabs = [
    { id: 'income', label: 'Income History', icon: <TrendingUp /> },
    { id: 'deposits', label: 'Deposits History', icon: <ArrowDownward /> },
    { id: 'withdrawals', label: 'Withdrawals History', icon: <ArrowUpward /> }
  ];

  useEffect(() => {
    loadHistoryData();
  }, [activeTab, pagination.page, pagination.limit, appliedDateRange]);

  const loadHistoryData = async () => {
    setLoading(true);
    try {
      let response;
      let params = { page: pagination.page, limit: pagination.limit };

      if (activeTab === 'income') {
        params = { ...params, ...(filters.userId && { userId: filters.userId }), ...(filters.incomeType && { incomeType: filters.incomeType }), ...(appliedDateRange?.startDate && { startDate: appliedDateRange.startDate }), ...(appliedDateRange?.endDate && { endDate: appliedDateRange.endDate }) };
      } else if (activeTab === 'deposits') {
        params = { ...params, ...(filters.chain && { chain: filters.chain }), ...(filters.status && { status: filters.status }) };
      }

      switch (activeTab) {
        case 'income':
          response = await networkService.getIncomeHistory(params);
          break;
        case 'deposits':
          response = await networkService.getDepositHistory(params);
          break;
        case 'withdrawals':
          response = await networkService.getWithdrawalHistory(params);
          break;
        default:
          response = { data: { incomeHistory: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } } };
      }

      let historyData = [];
      let paginationData = null;

      if (activeTab === 'income') {
        historyData = response.data?.incomeHistory || [];
        paginationData = response.data?.pagination;
        setIncomeStats(response.data?.stats || null);
        setDepositStats(null);
      } else if (activeTab === 'deposits') {
        historyData = response.data?.deposits || [];
        paginationData = response.data?.pagination;
        setIncomeStats(null);
        setDepositStats(response.data?.stats || null);
      } else if (activeTab === 'withdrawals') {
        historyData = response.data?.withdrawals || [];
        paginationData = response.data?.pagination;
        setIncomeStats(null);
        setDepositStats(null);
      } else {
        setIncomeStats(null);
        setDepositStats(null);
      }

      setData(historyData);
      setPagination(prev => ({
        ...prev,
        page: paginationData?.page ?? prev.page,
        limit: paginationData?.limit ?? prev.limit,
        total: paginationData?.total ?? 0,
        totalPages: paginationData?.pages ?? Math.ceil((paginationData?.total || 0) / (paginationData?.limit ?? prev.limit))
      }));
    } catch (error) {
      console.error('Error loading history data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleFilterChange('userId', value);
  };

  const handleApplyDateFilter = () => {
    setAppliedDateRange({
      startDate: filters.startDate ? dayjs(filters.startDate).format('YYYY-MM-DD') : null,
      endDate: filters.endDate ? dayjs(filters.endDate).format('YYYY-MM-DD') : null,
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      incomeType: '',
      chain: '',
      status: '',
      startDate: null,
      endDate: null
    });
    setAppliedDateRange({ startDate: null, endDate: null });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const exportData = async () => {
    setExportLoading(true);
    try {
      const allData = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const params = {
          page: currentPage,
          limit: 1000,
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== '')
          )
        };

        let response;
        switch (activeTab) {
          case 'income':
            response = await networkService.getIncomeHistory(params);
            break;
          case 'deposits':
            response = await networkService.getDepositHistory(params);
            break;
          case 'withdrawals':
            response = await networkService.getWithdrawalHistory(params);
            break;
        }

        let historyData = [];
        if (activeTab === 'income') {
          historyData = response.data?.incomeHistory || [];
        } else if (activeTab === 'deposits') {
          historyData = response.data?.deposits || [];
        } else if (activeTab === 'withdrawals') {
          historyData = response.data?.withdrawals || [];
        }

        if (historyData.length > 0) {
          allData.push(...historyData);
          currentPage++;
          hasMore = historyData.length === 1000;
        } else {
          hasMore = false;
        }
      }

      downloadCSV(allData, `${activeTab}_history_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const downloadCSV = (data, filename) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      SUCCESS: { color: 'success', label: 'Success' },
      PENDING: { color: 'warning', label: 'Pending' },
      FAILED: { color: 'error', label: 'Failed' },
      COMPLETED: { color: 'success', label: 'Completed' },
      PROCESSING: { color: 'warning', label: 'Processing' },
      CONFIRMED: { color: 'success', label: 'Confirmed' }
    };
    const config = statusConfig[status] || { color: 'default', label: status || '—' };
    return <Chip label={config.label} size="small" color={config.color} sx={{ fontWeight: 600, fontSize: '0.75rem', '& .MuiChip-label': { px: 1.5 } }} />;
  };

  const getIncomeTypeLabel = (type) => {
    const labels = { DAILY_ROI: 'Daily ROI', REFERRAL_BONUS: 'Referral Bonus', LEVEL_INCOME: 'Level Income', BONUS: 'Bonus' };
    return labels[type] || type || '—';
  };

  const renderMobileCard = (item, index) => {
    const userId = typeof item.userId === 'object' ? (item.userId?.UID || item.userId?.email || item.userId?.fullName || item.userId?._id || 'N/A') : (item.userId || 'N/A');

    const cardData = {
      income: {
        id: typeof item.userId === 'object' ? (item.userId?.fullName || item.userId?.UID) : userId,
        status: 'SUCCESS',
        fields: [
          { label: 'User', value: item?.userId?.fullName || userId },
          { label: 'Type', value: getIncomeTypeLabel(item.type) },
          { label: 'Amount', value: `+$${formatAmount(item.amount)}`, highlight: true, positive: true },
          { label: 'Date', value: formatDate(item.date || item.createdAt) }
        ]
      },
      deposits: {
        id: typeof item.user === 'object' ? (item.user?.fullName || item.user?.UID) : 'N/A',
        status: item.status,
        fields: [
          { label: 'User', value: item?.user?.fullName || 'N/A' },
          { label: 'Amount', value: `${formatAmount(item.amount)} ${item.currency || 'USDT'}`, highlight: true },
          { label: 'Chain', value: item.chain || 'N/A' },
          { label: 'Date', value: formatDate(item.createdAt) }
        ]
      },
      withdrawals: {
        id: typeof item.userId === 'object' ? (item.userId?.UID || item.userId?.email || item.userId?._id || 'N/A') : (item.userId || 'N/A'),
        status: item.status,
        fields: [
          { label: 'Amount', value: `-$${formatAmount(item.amount)}`, highlight: true, negative: true },
          { label: 'Chain', value: item.chain || 'N/A' },
          { label: 'Date', value: formatDate(item.date || item.createdAt) },
          { label: 'TX Hash', value: item.txHash ? `${item.txHash.slice(0, 8)}...` : 'N/A' }
        ]
      }
    };

    const card = cardData[activeTab];

    return (
      <Card
        key={index}
        sx={{
          mb: 2,
          bgcolor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 2,
          '&:hover': {
            borderColor: AppColors.GOLD_DARK,
            boxShadow: `0 4px 12px ${AppColors.GOLD_DARK}20`
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1.5, borderBottom: `1px solid ${AppColors.BG_SECONDARY}` }}>
            <Typography variant="body2" sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}>
              ID: {card.id}
            </Typography>
            {getStatusChip(card.status)}
          </Box>
          <Grid container spacing={2}>
            {card.fields.map((field, idx) => (
              <Grid size={{ xs: 6 }} key={idx}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{field.label}</Typography>
                <Typography variant="body2" sx={{ color: field.highlight ? (field.positive ? AppColors.SUCCESS : field.negative ? AppColors.ERROR : AppColors.GOLD_DARK) : AppColors.TXT_MAIN, fontWeight: field.highlight ? 600 : 400, fontFamily: field.label === 'TX Hash' ? 'monospace' : 'inherit' }}>{field.value}</Typography>
              </Grid>
            ))}
          </Grid>
          {activeTab === 'income' && (
            <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${AppColors.BG_SECONDARY}` }}>
              <Button size="small" startIcon={<Visibility />} onClick={() => setIncomeDetailItem(item)} sx={{ color: AppColors.GOLD_DARK, '&:hover': { bgcolor: `${AppColors.GOLD_DARK}15` } }}>View details</Button>
            </Box>
          )}
          {activeTab === 'deposits' && (
            <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${AppColors.BG_SECONDARY}` }}>
              <Button size="small" startIcon={<Visibility />} onClick={() => setDepositDetailItem(item)} sx={{ color: AppColors.GOLD_DARK, '&:hover': { bgcolor: `${AppColors.GOLD_DARK}15` } }}>View details</Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderFilters = () => (
    <Box
      sx={{ mb: { xs: 1, md: 1.5 }, borderBottom: `1px solid ${AppColors.BG_SECONDARY}`, py: { xs: 1, md: 1.5 } }}
    >
      {/* <Box sx={{ display: 'flex', gap: { xs: 1, md: 1.5 }, alignItems: 'center', my: { xs: 1, md: 1.5 } }}>
        <Button
          onClick={clearFilters}
          variant="outlined"
          startIcon={<Clear />}
          sx={{
            py: 0,
            px: 0.75,
            borderColor: AppColors.GOLD_DARK,
            color: AppColors.GOLD_DARK,
            '&:hover': {
              borderColor: AppColors.GOLD_LIGHT,
              bgcolor: `${AppColors.GOLD_DARK}10`,
            },
          }}
        >
          Clear
        </Button>
      </Box> */}
      <Grid container spacing={{ xs: 1, md: 1.5 }}>
        <Grid size={{ xs: 6, md: 4 }}>
          <TextField
            label="Search by User ID"
            variant="outlined"
            value={searchTerm}
            fullWidth
            onChange={handleSearch}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 48, // consistent height
                alignItems: "center",
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 10px", // proper spacing
              },
            }}
          />
        </Grid>

        {activeTab === 'income' && (
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <FormControl fullWidth sx={{
              "& .MuiOutlinedInput-root": {
                height: 48, // consistent height
                alignItems: "center",
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 10px", // proper spacing
              },
            }}>
              <InputLabel sx={{ color: AppColors.TXT_SUB, '&.Mui-focused': { color: AppColors.GOLD_DARK } }}>
                Income Type
              </InputLabel>
              <Select
                value={filters.incomeType}
                onChange={(e) => handleFilterChange('incomeType', e.target.value)}
                label="Income Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="DAILY_ROI">Daily ROI</MenuItem>
                <MenuItem value="REFERRAL_BONUS">Referral Bonus</MenuItem>
                <MenuItem value="LEVEL_INCOME">Level Income</MenuItem>
                <MenuItem value="BONUS">Bonus</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {(activeTab === 'deposits' || activeTab === 'withdrawals') && (
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <FormControl fullWidth sx={{
              "& .MuiOutlinedInput-root": {
                height: 48, // consistent height
                alignItems: "center",
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 10px", // proper spacing
              },
            }}>
              <InputLabel sx={{ color: AppColors.TXT_SUB, '&.Mui-focused': { color: AppColors.GOLD_DARK } }}>
                Chain
              </InputLabel>
              <Select
                value={filters.chain}
                onChange={(e) => handleFilterChange('chain', e.target.value)}
                label="Chain"
              >
                <MenuItem value="">All Chains</MenuItem>
                <MenuItem value="BSC">BSC</MenuItem>
                <MenuItem value="ETH">ETH</MenuItem>
                <MenuItem value="POLYGON">POLYGON</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {(activeTab === 'deposits' || activeTab === 'withdrawals') && (
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <FormControl fullWidth sx={{
              "& .MuiOutlinedInput-root": {
                height: 48, // consistent height
                alignItems: "center",
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 10px", // proper spacing
              },
            }}>
              <InputLabel sx={{ color: AppColors.TXT_SUB, '&.Mui-focused': { color: AppColors.GOLD_DARK } }}>
                Status
              </InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="SUCCESS">Success</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid size={{ xs: 6, sm: 6, md: 2 }}>
          <DatePicker
            label="Start Date"
            value={filters.startDate}
            onChange={(newValue) => handleFilterChange('startDate', newValue)}
            slotProps={{ textField: { fullWidth: true } }}
            sx={{ width: '100%', "& .MuiPickersSectionList-root": { padding: "13px 10px" } }}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 2 }}>
          <DatePicker
            label="End Date"
            value={filters.endDate}
            onChange={(newValue) => handleFilterChange('endDate', newValue)}
            slotProps={{ textField: { fullWidth: true } }}
            sx={{ width: '100%', "& .MuiPickersSectionList-root": { padding: "13px 10px" } }}
          />
        </Grid>
      </Grid>
      {(filters.userId || filters.incomeType || filters.startDate || filters.endDate) && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.5 }}>
          <Button className="btn-primary" onClick={handleApplyDateFilter} startIcon={<Search />}>Apply Filter</Button>
          <Button onClick={clearFilters} variant="outlined" startIcon={<Clear />} sx={{ borderColor: AppColors.GOLD_DARK, color: AppColors.GOLD_DARK, '&:hover': { borderColor: AppColors.GOLD_LIGHT, bgcolor: `${AppColors.GOLD_DARK}10` } }}>Clear Filters</Button>
        </Box>
      )}
    </Box>
  );

  const renderIncomeRow = (item, index) => (
    <TableRow key={item._id || item.id || index} sx={{ '&:hover': { bgcolor: `${AppColors.HLT_LIGHT}` } }}>
      <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 500 }}>{item?.userId?.fullName || 'N/A'}</TableCell>
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>{getIncomeTypeLabel(item.type)}</TableCell>
      <TableCell>
        <Typography sx={{ color: AppColors.SUCCESS, fontWeight: 600 }}>+${formatAmount(item.amount)}</Typography>
      </TableCell>
      <TableCell sx={{ color: AppColors.TXT_SUB, fontSize: '0.8rem' }}>{formatDate(item.date || item.createdAt)}</TableCell>
      <TableCell sx={{ width: 48, p: 0 }}>
        <IconButton size="small" onClick={() => setIncomeDetailItem(item)} sx={{ color: AppColors.GOLD_DARK, '&:hover': { bgcolor: `${AppColors.GOLD_DARK}15` } }} aria-label="View details">
          <Visibility fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderDepositRow = (item, index) => (
    <TableRow key={item._id || item.id || index} sx={{ '&:hover': { bgcolor: `${AppColors.HLT_LIGHT}` } }}>
      <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 500 }}>{item?.user?.fullName || 'N/A'}</TableCell>
      <TableCell>
        <Typography sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}>{formatAmount(item.amount)} {item.currency || 'USDT'}</Typography>
      </TableCell>
      <TableCell sx={{ color: AppColors.TXT_SUB }}>{item.chain || '—'}</TableCell>
      <TableCell>{getStatusChip(item.status)}</TableCell>
      <TableCell sx={{ color: AppColors.TXT_SUB, fontSize: '0.8rem' }}>{formatDate(item.createdAt)}</TableCell>
      <TableCell sx={{ width: 48, p: 0 }}>
        <IconButton size="small" onClick={() => setDepositDetailItem(item)} sx={{ color: AppColors.GOLD_DARK, '&:hover': { bgcolor: `${AppColors.GOLD_DARK}15` } }} aria-label="View details">
          <Visibility fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderWithdrawalRow = (item, index) => {
    const userId = typeof item.userId === 'object' ? (item.userId?.UID || item.userId?.email || item.userId?.fullName || item.userId?._id || 'N/A') : (item.userId || 'N/A');

    return (
      <TableRow
        key={item._id || item.id || index}
        sx={{
          bgcolor: index % 2 === 0 ? AppColors.BG_CARD : AppColors.BG_SECONDARY,
          '&:hover': {
            bgcolor: `${AppColors.GOLD_DARK}10`,
          },
        }}
      >
        <TableCell sx={{ color: AppColors.TXT_MAIN }}>{userId}</TableCell>
        <TableCell>
          <Typography sx={{ color: AppColors.ERROR, fontWeight: 600 }}>
            -${formatAmount(item.amount)}
          </Typography>
        </TableCell>
        <TableCell sx={{ color: AppColors.TXT_MAIN }}>{item.chain || 'N/A'}</TableCell>
        <TableCell>
          <Typography sx={{ color: AppColors.TXT_SUB, fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {item.toAddress ? `${item.toAddress.slice(0, 8)}...${item.toAddress.slice(-6)}` : 'N/A'}
          </Typography>
        </TableCell>
        <TableCell>{getStatusChip(item.status)}</TableCell>
        <TableCell sx={{ color: AppColors.TXT_SUB }}>{formatDate(item.date || item.createdAt)}</TableCell>
        <TableCell>
          {item.txHash ? (
            <Typography sx={{ color: AppColors.TXT_SUB, fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {`${item.txHash.slice(0, 8)}...${item.txHash.slice(-6)}`}
            </Typography>
          ) : (
            'N/A'
          )}
        </TableCell>
      </TableRow>
    );
  };

  const renderTableHeaders = () => {
    const headers = {
      income: ['User', 'Type', 'Amount', 'Date'],
      deposits: ['User', 'Amount', 'Chain', 'Status', 'Date'],
      withdrawals: ['User ID', 'Amount', 'Chain', 'To Address', 'Status', 'Date', 'TX Hash']
    };
    return (
      <TableHead>
        <TableRow sx={{ bgcolor: `${AppColors.GOLD_DARK}20` }}>
          {headers[activeTab]?.map((header, index) => (
            <TableCell key={index} sx={{ color: AppColors.GOLD_DARK, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.875rem', borderBottom: `2px solid ${AppColors.GOLD_DARK}` }}>{header}</TableCell>
          ))}
          {activeTab === 'income' && <TableCell sx={{ width: 48, p: 0 }} align="center" />}
          {activeTab === 'deposits' && <TableCell sx={{ width: 48, p: 0 }} align="center" />}
        </TableRow>
      </TableHead>
    );
  };

  const renderTableBody = () => {
    const renderFunctions = {
      income: renderIncomeRow,
      deposits: renderDepositRow,
      withdrawals: renderWithdrawalRow
    };

    const renderFunction = renderFunctions[activeTab];

    return (
      <TableBody>
        {data.map((item, index) => renderFunction(item, index))}
      </TableBody>
    );
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event) => {
    const limit = parseInt(event.target.value, 10);
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const tablePaginationColSpan = { income: 5, deposits: 6, withdrawals: 7 }[activeTab] || 7;

  if (loading && data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          bgcolor: AppColors.BG_MAIN
        }}
      >
        <BTLoader />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1, md: 1.5 }
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
              History & Logs Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: AppColors.TXT_SUB,
                fontWeight: 400
              }}
            >
              Monitor and analyze all platform activities
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 }, flexWrap: 'wrap' }}>
            <Button
              onClick={exportData}
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
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Paper
              elevation={0}
              sx={{
                bgcolor: AppColors.BG_CARD,
                border: `1px solid ${AppColors.BG_SECONDARY}`,
                px: { xs: 1, md: 1.5 },
                py: { xs: 0.5, md: 0.75 },
                borderRadius: 2,
                display: 'flex',
                gap: { xs: 0.5, md: 1 },
              }}
            >
              <Typography variant="caption" sx={{ color: AppColors.TXT_SUB }}>
                Total Records
              </Typography>
              <Typography variant="h6" sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}>
                {pagination.total}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Paper
        elevation={0}
        sx={{
          backgroundColor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 3,
          p: { xs: 1, md: 1.5 },
          height: '100%',
          background: `linear-gradient(135deg, ${AppColors.BG_CARD} 0%, ${AppColors.BG_SECONDARY} 100%)`,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setPagination(prev => ({ ...prev, page: 1 }));
            setIncomeDetailItem(null);
            setDepositDetailItem(null);
          }}
          sx={{
            minHeight: "2.25rem",
            borderBottom: `1px solid ${AppColors.BG_SECONDARY}`,
            '& .MuiTabs-indicator': {
              backgroundColor: AppColors.GOLD_DARK,
            },
            '& .MuiTab-root': {
              color: AppColors.TXT_SUB,
              minHeight: "2.25rem",
              padding: { xs: '8px 8px', md: '10px 10px' },
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              textTransform: 'none',
              fontWeight: 500,
              '& .MuiTab-iconWrapper': {
                marginRight: '6px',
                fontSize: { xs: '1rem', md: '1.125rem' },
              },
              '&.Mui-selected': {
                color: AppColors.GOLD_DARK,
                fontWeight: 600,
              },
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {/* Filters */}
        {renderFilters()}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <BTLoader />
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <History sx={{ fontSize: 64, color: AppColors.TXT_SUB, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ color: AppColors.TXT_MAIN, mb: 1 }}>
              No Data Found
            </Typography>
            <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
              No records match your current filters.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Mobile Card View */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              {data.map((item, index) => renderMobileCard(item, index))}
            </Box>

            {activeTab === 'income' && incomeStats && (
              <Box sx={{ px: 2, pt: 1.5, pb: 0 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }}>Summary:</Typography>
                  <Chip label={`Total: $${formatAmount(incomeStats?.overall?.totalAmount)}`} size="small" sx={{ bgcolor: `${AppColors.GOLD_DARK}20`, color: AppColors.GOLD_DARK, fontWeight: 600 }} />
                  {(incomeStats?.byType || []).map((t) => (
                    <Chip key={t._id} label={`${getIncomeTypeLabel(t._id)}: $${formatAmount(t.total)} (${t.count})`} size="small" variant="outlined" sx={{ borderColor: AppColors.HLT_NONE, color: AppColors.TXT_SUB, fontSize: '0.75rem' }} />
                  ))}
                </Box>
              </Box>
            )}

            {activeTab === 'deposits' && depositStats && (
              <Box sx={{ px: 2, pt: 1.5, pb: 0 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, fontWeight: 600 }}>Summary:</Typography>
                  <Chip label={`Total: ${formatAmount(depositStats?.overall?.totalAmount)} USDT`} size="small" sx={{ bgcolor: `${AppColors.GOLD_DARK}20`, color: AppColors.GOLD_DARK, fontWeight: 600 }} />
                  {(depositStats?.byChain || []).map((c) => (
                    <Chip key={c._id} label={`${c._id}: ${formatAmount(c.total)} (${c.count})`} size="small" variant="outlined" sx={{ borderColor: AppColors.HLT_NONE, color: AppColors.TXT_SUB, fontSize: '0.75rem' }} />
                  ))}
                </Box>
              </Box>
            )}

            {/* Desktop Table View */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <TableContainer component={Paper} sx={{ boxShadow: 'none', maxHeight: 'calc(100vh - 12em)', overflow: 'auto' }}>
                <Table size="small" sx={{ background: `linear-gradient(360deg, ${AppColors.BG_SECONDARY} 0%, ${AppColors.BG_MAIN} 100%)` }}>
                  {renderTableHeaders()}
                  {renderTableBody()}
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        count={pagination.total}
                        page={pagination.page - 1}
                        onPageChange={handlePageChange}
                        rowsPerPage={pagination.limit}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        rowsPerPageOptions={[5, 10, 25, 50, 100]}
                        colSpan={tablePaginationColSpan}
                        sx={{
                          borderBottom: 'none',
                          color: AppColors.TXT_SUB,
                          '& .MuiTablePagination-selectIcon': { color: AppColors.GOLD_DARK },
                          '& .MuiTablePagination-select': { color: AppColors.TXT_MAIN },
                          '& .MuiTablePagination-displayedRows': { color: AppColors.TXT_MAIN },
                          '& .MuiIconButton-root': { color: AppColors.TXT_SUB, '&:hover': { bgcolor: `${AppColors.GOLD_DARK}20`, color: AppColors.GOLD_DARK }, '&.Mui-disabled': { color: AppColors.HLT_NONE } },
                        }}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}
      </Paper>

      {/* Income Detail Modal */}
      <Dialog open={!!incomeDetailItem} onClose={() => setIncomeDetailItem(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: AppColors.BG_CARD, border: `1px solid ${AppColors.BG_SECONDARY}`, borderRadius: 2 } }}>
        <DialogTitle sx={{ color: AppColors.GOLD_DARK, fontWeight: 600, borderBottom: `1px solid ${AppColors.HLT_NONE}40`, pb: 1.5 }}>Income Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {incomeDetailItem && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>User</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Typography sx={{ color: AppColors.TXT_MAIN }}>{incomeDetailItem?.userId?.fullName || '—'}</Typography>
                  <Typography sx={{ color: AppColors.TXT_SUB, fontSize: '0.875rem' }}>{incomeDetailItem?.userId?.email || '—'}</Typography>
                  <Typography sx={{ color: AppColors.TXT_SUB, fontSize: '0.8rem', fontFamily: 'monospace' }}>{incomeDetailItem?.userId?.UID || '—'}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Type</Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>{getIncomeTypeLabel(incomeDetailItem.type)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Amount</Typography>
                <Typography sx={{ color: AppColors.SUCCESS, fontWeight: 600, mt: 0.5 }}>+${formatAmount(incomeDetailItem.amount)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Level</Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>{incomeDetailItem.level ?? '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Rank</Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>{incomeDetailItem.rank ?? '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Date</Typography>
                <Typography sx={{ color: AppColors.TXT_SUB, mt: 0.5, fontSize: '0.875rem' }}>{formatDate(incomeDetailItem.date)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>From User</Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>{typeof incomeDetailItem.sourceUserId === 'object' ? (incomeDetailItem.sourceUserId?.fullName || incomeDetailItem.sourceUserId?.UID || incomeDetailItem.sourceUserId?.email || '—') : (incomeDetailItem.sourceUserId || '—')}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Description</Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5, fontSize: '0.875rem' }}>{incomeDetailItem.description || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Investment ID</Typography>
                <Typography sx={{ color: AppColors.TXT_SUB, mt: 0.5, fontFamily: 'monospace', fontSize: '0.75rem' }}>{incomeDetailItem.investmentId || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Calculation ID</Typography>
                <Typography sx={{ color: AppColors.TXT_SUB, mt: 0.5, fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>{incomeDetailItem.calculationId || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Created</Typography>
                <Typography sx={{ color: AppColors.TXT_SUB, mt: 0.5, fontSize: '0.875rem' }}>{formatDate(incomeDetailItem.createdAt)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Updated</Typography>
                <Typography sx={{ color: AppColors.TXT_SUB, mt: 0.5, fontSize: '0.875rem' }}>{formatDate(incomeDetailItem.updatedAt)}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>ID</Typography>
                <Typography sx={{ color: AppColors.TXT_SUB, mt: 0.5, fontFamily: 'monospace', fontSize: '0.75rem' }}>{incomeDetailItem._id || '—'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${AppColors.HLT_NONE}40` }}>
          <Button onClick={() => setIncomeDetailItem(null)} sx={{ color: AppColors.GOLD_DARK, '&:hover': { bgcolor: `${AppColors.GOLD_DARK}15` } }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Deposit Detail Modal */}
      <Dialog open={!!depositDetailItem} onClose={() => setDepositDetailItem(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: AppColors.BG_CARD, border: `1px solid ${AppColors.BG_SECONDARY}`, borderRadius: 2 } }}>
        <DialogTitle sx={{ color: AppColors.GOLD_DARK, fontWeight: 600, borderBottom: `1px solid ${AppColors.HLT_NONE}40`, pb: 1.5 }}>Deposit Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {depositDetailItem && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>User</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Typography sx={{ color: AppColors.TXT_MAIN }}>{depositDetailItem?.user?.fullName || '—'}</Typography>
                  <Typography sx={{ color: AppColors.TXT_SUB, fontSize: '0.875rem' }}>{depositDetailItem?.user?.email || '—'}</Typography>
                  <Typography sx={{ color: AppColors.TXT_SUB, fontSize: '0.8rem', fontFamily: 'monospace' }}>{depositDetailItem?.user?.UID || '—'}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Type</Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>{depositDetailItem.type || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Amount</Typography>
                <Typography sx={{ color: AppColors.GOLD_DARK, fontWeight: 600, mt: 0.5 }}>{formatAmount(depositDetailItem.amount)} {depositDetailItem.currency || 'USDT'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Chain</Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>{depositDetailItem.chain || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Currency</Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>{depositDetailItem.currency || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Status</Typography>
                <Box sx={{ mt: 0.5 }}>{getStatusChip(depositDetailItem.status)}</Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Wallet Address</Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5, fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>{depositDetailItem.walletAddress || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Transaction Hash</Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5, fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>{depositDetailItem.txHash || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Created</Typography>
                <Typography sx={{ color: AppColors.TXT_SUB, mt: 0.5, fontSize: '0.875rem' }}>{formatDate(depositDetailItem.createdAt)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Updated</Typography>
                <Typography sx={{ color: AppColors.TXT_SUB, mt: 0.5, fontSize: '0.875rem' }}>{formatDate(depositDetailItem.updatedAt)}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>ID</Typography>
                <Typography sx={{ color: AppColors.TXT_SUB, mt: 0.5, fontFamily: 'monospace', fontSize: '0.75rem' }}>{depositDetailItem._id || '—'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${AppColors.HLT_NONE}40` }}>
          <Button onClick={() => setDepositDetailItem(null)} sx={{ color: AppColors.GOLD_DARK, '&:hover': { bgcolor: `${AppColors.GOLD_DARK}15` } }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NetworkManageHistoryNLogs;
