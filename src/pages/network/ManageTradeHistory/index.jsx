import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    IconButton,
    Chip,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Modal,
    Card,
    CardContent,
    Grid,
    Stack,
    Tooltip,
} from '@mui/material';
import {
    Add,
    Visibility,
    Close,
    ArrowUpward,
    ArrowDownward,
} from '@mui/icons-material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { AppColors } from '../../../constant/appColors';
import useSnackbar from '../../../hooks/useSnackbar';
import networkService from '../../../services/networkService';
import BTLoader from '../../../components/Loader';
import DatePicker from '../../../components/input/datePicker';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
};

const formatAmount = (amount) => {
    if (amount == null || amount === '') return 'N/A';
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    }).format(amount);
};

const FIELDS_SX = {
    '& .MuiOutlinedInput-root': { bgcolor: 'transparent' },
    '& .MuiInputLabel-root': { color: AppColors.TXT_SUB },
    '& .MuiOutlinedInput-input': { color: AppColors.TXT_MAIN },
};

const STATUS_CHIP_CONFIG = {
    WIN: { label: 'Win', bg: `${AppColors.SUCCESS}30`, color: AppColors.SUCCESS },
    LOSS: { label: 'Loss', bg: `${AppColors.ERROR}30`, color: AppColors.ERROR },
    OPEN: { label: 'Open', bg: `${AppColors.GOLD_DARK}30`, color: AppColors.GOLD_DARK },
};

const CREATE_FORM_INITIAL = {
    pair: '',
    direction: 'UP',
    amount: '',
    feeAmount: '',
    entryPrice: '',
    exitPrice: '',
    rewardRate: '',
    status: 'WIN',
    openTime: '',
    settlementTime: '',
};

const optionalNumber = Yup.number()
    .transform((v) => (v === '' || v === null || Number.isNaN(Number(v)) ? undefined : Number(v)))
    .min(0, 'Must be ≥ 0')
    .nullable();

const createTradeValidationSchema = Yup.object({
    pair: Yup.string().required('Pair is required').trim(),
    direction: Yup.string().oneOf(['UP', 'DOWN'], 'Direction must be UP or DOWN').required('Direction is required'),
    status: Yup.string().oneOf(['OPEN', 'WIN', 'LOSS'], 'Status must be OPEN, WIN, or LOSS').required('Status is required'),
    amount: optionalNumber,
    feeAmount: optionalNumber,
    entryPrice: optionalNumber,
    exitPrice: optionalNumber,
    rewardRate: optionalNumber,
    openTime: Yup.string().nullable(),
    settlementTime: Yup.string().nullable(),
});

function buildCreatePayload(values) {
    const toNum = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? 0 : Number(v));
    const toIso = (v) => (v && dayjs(v).isValid() ? dayjs(v).toISOString() : undefined);
    return {
        pair: String(values.pair ?? '').trim(),
        direction: values.direction,
        amount: toNum(values.amount),
        feeAmount: toNum(values.feeAmount),
        entryPrice: toNum(values.entryPrice),
        exitPrice: toNum(values.exitPrice),
        rewardRate: toNum(values.rewardRate),
        status: values.status || 'WIN',
        openTime: toIso(values.openTime) ?? undefined,
        settlementTime: toIso(values.settlementTime) ?? null,
    };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const DetailItem = React.memo(function DetailItem({ label, value, highlight, mono }) {
    return (
        <Box
            sx={{
                p: { xs: 1, md: 1.5 },
                backgroundColor: AppColors.BG_SECONDARY,
                borderRadius: 2,
            }}
        >
            <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase' }}>
                {label}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
                {typeof value === 'string' || typeof value === 'number' ? (
                    <Typography
                        variant="body2"
                        sx={{
                            color: highlight ? AppColors.GOLD_DARK : AppColors.TXT_MAIN,
                            fontWeight: highlight ? 600 : 400,
                            fontFamily: mono ? 'monospace' : 'inherit',
                            fontSize: mono ? '0.75rem' : undefined,
                        }}
                    >
                        {value}
                    </Typography>
                ) : (
                    value
                )}
            </Box>
        </Box>
    );
});

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ManageTradeHistory = () => {
    const { showSnackbar } = useSnackbar();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total, setTotal] = useState(0);

    const [selectedTrade, setSelectedTrade] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const fetchTradeData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await networkService.getTradeHistory({
                page: page + 1,
                limit: rowsPerPage,
            });
            if (response?.success && response?.data) {
                setData(response.data.list ?? []);
                const pag = response.data.pagination ?? {};
                setTotal(pag.total ?? 0);
            } else {
                showSnackbar(response?.message || 'Failed to fetch trade data', 'error');
            }
        } catch (error) {
            showSnackbar(error?.response?.data?.message || 'Error fetching trade data', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, showSnackbar]);

    useEffect(() => {
        fetchTradeData();
    }, [fetchTradeData]);

    const handleChangePage = useCallback((_event, newPage) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    }, []);

    const handleViewDetails = useCallback((row) => {
        setSelectedTrade(row);
        setModalOpen(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setModalOpen(false);
        setSelectedTrade(null);
    }, []);

    const handleCreateOpen = useCallback(() => {
        setCreateOpen(true);
    }, []);

    const handleCreateClose = useCallback(() => {
        setCreateOpen(false);
    }, []);

    const getStatusChip = useCallback((status) => {
        const c = STATUS_CHIP_CONFIG[status] ?? { label: status || '—', bg: `${AppColors.TXT_SUB}30`, color: AppColors.TXT_SUB };
        return <Chip label={c.label} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }} />;
    }, []);

    const getDirectionChip = useCallback((direction) => {
        const isUp = direction === 'UP';
        return (
            <Chip
                size="small"
                icon={isUp ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                label={direction || '—'}
                sx={{
                    fontWeight: 600,
                    bgcolor: isUp ? `${AppColors.SUCCESS}18` : `${AppColors.ERROR}18`,
                    color: isUp ? AppColors.SUCCESS : AppColors.ERROR,
                    '& .MuiChip-icon': { color: 'inherit' },
                }}
            />
        );
    }, []);

    const handleCreateSubmit = useCallback(
        async (values, { setSubmitting, resetForm }) => {
            try {
                const body = buildCreatePayload(values);
                const response = await networkService.createTradeHistory(body);
                if (response?.success) {
                    showSnackbar(response.message || 'Trade data created successfully', 'success');
                    resetForm({ values: CREATE_FORM_INITIAL });
                    handleCreateClose();
                    fetchTradeData();
                } else {
                    showSnackbar(response?.message || 'Failed to create trade data', 'error');
                }
            } catch (err) {
                const msg = err?.response?.data?.message || err?.message || 'Failed to create trade data';
                showSnackbar(msg, 'error');
            } finally {
                setSubmitting(false);
            }
        },
        [showSnackbar, fetchTradeData, handleCreateClose]
    );

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: { xs: 1, md: 2 }, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box>
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
                        Trade Data
                    </Typography>
                    <Typography variant="body1" sx={{ color: AppColors.TXT_SUB, fontWeight: 400 }}>
                        Admin-created trade data (trade feed). Create entries via API.
                    </Typography>
                </Box>
                <Button startIcon={<Add />} onClick={handleCreateOpen} className="btn-primary" sx={{ flexShrink: 0 }}>
                    Create Trade Data
                </Button>
            </Box>

            {/* Table */}
            <Paper
                elevation={0}
                sx={{
                    backgroundColor: AppColors.BG_CARD,
                    border: `1px solid ${AppColors.BG_SECONDARY}`,
                    borderRadius: 3,
                    pt: { xs: 1, md: 2 },
                }}
            >
                <Box sx={{ px: 2 }}>
                    <TableContainer>
                        <Table
                            sx={{
                                '& .MuiTableCell-root': { p: { xs: 1, md: 1.5 } },
                                '& .MuiTableCell-head': { p: { xs: 1, md: 1.5 } },
                                '& .MuiTableCell-body': { p: { xs: 1, md: 1.5 } },
                            }}
                        >
                            <TableHead>
                                <TableRow sx={{ backgroundColor: AppColors.BG_SECONDARY }}>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>Pair</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>Direction</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }} align="right">Amount</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>Open Time</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }} align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: { xs: 2, md: 4 } }}>
                                            <BTLoader />
                                        </TableCell>
                                    </TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: AppColors.TXT_SUB }}>
                                            No trade data found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((row) => (
                                        <TableRow
                                            key={row._id ?? row.id ?? Math.random()}
                                            hover
                                            sx={{ '&:hover': { backgroundColor: `${AppColors.GOLD_DARK}05` } }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: AppColors.TXT_MAIN, fontWeight: 500 }}>
                                                    {row.pair || '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{getDirectionChip(row.direction)}</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}>
                                                    {formatAmount(row.amount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{getStatusChip(row.status)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                                                    {formatDate(row.openTime)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewDetails(row)}
                                                            sx={{ color: AppColors.GOLD_DARK, '&:hover': { backgroundColor: `${AppColors.GOLD_DARK}20` } }}
                                                            aria-label="View trade details"
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[10, 20, 25, 50]}
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

            {/* Detail Modal */}
            <Modal
                open={modalOpen}
                onClose={handleModalClose}
                aria-labelledby="trade-detail-modal-title"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 1, md: 1.5 } }}
            >
                <Card
                    sx={{
                        backgroundColor: AppColors.BG_CARD,
                        border: `1px solid ${AppColors.BG_SECONDARY}`,
                        borderRadius: 3,
                        maxWidth: { xs: '100%', md: 560 },
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    }}
                >
                    <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography id="trade-detail-modal-title" variant="h6" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700 }}>
                                Trade Details
                            </Typography>
                            <IconButton
                                onClick={handleModalClose}
                                aria-label="Close"
                                sx={{
                                    color: AppColors.TXT_SUB,
                                    '&:hover': { backgroundColor: `${AppColors.ERROR}20`, color: AppColors.ERROR },
                                }}
                            >
                                <Close />
                            </IconButton>
                        </Box>

                        {selectedTrade && (
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Pair" value={selectedTrade.pair} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Direction" value={selectedTrade.direction} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Status" value={getStatusChip(selectedTrade.status)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Amount" value={formatAmount(selectedTrade.amount)} highlight />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Fee Amount" value={formatAmount(selectedTrade.feeAmount)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Entry Price" value={formatAmount(selectedTrade.entryPrice)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Exit Price" value={formatAmount(selectedTrade.exitPrice)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Reward Rate" value={formatAmount(selectedTrade.rewardRate)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Open Time" value={formatDate(selectedTrade.openTime)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Settlement Time" value={formatDate(selectedTrade.settlementTime)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Created" value={formatDate(selectedTrade.createdAt)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem label="Updated" value={formatDate(selectedTrade.updatedAt)} />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <DetailItem label="ID" value={selectedTrade._id} mono />
                                </Grid>
                            </Grid>
                        )}
                    </CardContent>
                </Card>
            </Modal>

            {/* Create Trade Data Modal */}
            <Modal
                open={createOpen}
                onClose={handleCreateClose}
                aria-labelledby="create-trade-modal-title"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 1, md: 1.5 } }}
            >
                <Card
                    component="div"
                    sx={{
                        backgroundColor: AppColors.BG_CARD,
                        border: `1px solid ${AppColors.BG_SECONDARY}`,
                        borderRadius: 3,
                        maxWidth: { xs: '100%', md: '70%' },
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Formik
                            initialValues={CREATE_FORM_INITIAL}
                            validationSchema={createTradeValidationSchema}
                            onSubmit={handleCreateSubmit}
                            enableReinitialize={false}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit, isSubmitting }) => {
                                return (
                                <Box component="form" onSubmit={handleSubmit} noValidate>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography id="create-trade-modal-title" variant="h6" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700 }}>
                                            Create Trade Data
                                        </Typography>
                                        <IconButton
                                            onClick={handleCreateClose}
                                            aria-label="Close"
                                            sx={{
                                                color: AppColors.TXT_SUB,
                                                '&:hover': { backgroundColor: `${AppColors.ERROR}20`, color: AppColors.ERROR },
                                            }}
                                        >
                                            <Close />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: AppColors.TXT_SUB, mb: 2 }}>
                                        Pair and direction are required. Other fields default to 0 or WIN.
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                required
                                                name="pair"
                                                label="Pair"
                                                placeholder="e.g. BTC/USDT"
                                                value={values.pair}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={Boolean(touched.pair && errors.pair)}
                                                helperText={touched.pair && errors.pair}
                                                sx={FIELDS_SX}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <FormControl
                                                fullWidth
                                                required
                                                error={Boolean(touched.direction && errors.direction)}
                                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'transparent' } }}
                                            >
                                                <InputLabel sx={{ color: AppColors.TXT_SUB }}>Direction</InputLabel>
                                                <Select
                                                    name="direction"
                                                    value={values.direction}
                                                    onChange={(e) => setFieldValue('direction', e.target.value)}
                                                    onBlur={handleBlur}
                                                    label="Direction"
                                                    sx={{ bgcolor: AppColors.BG_SECONDARY, '& .MuiSelect-select': { color: AppColors.TXT_MAIN } }}
                                                >
                                                    <MenuItem value="UP">UP</MenuItem>
                                                    <MenuItem value="DOWN">DOWN</MenuItem>
                                                </Select>
                                                {touched.direction && errors.direction && (
                                                    <Typography variant="caption" sx={{ color: AppColors.ERROR, mt: 0.5, display: 'block' }}>
                                                        {errors.direction}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <FormControl
                                                fullWidth
                                                required
                                                error={Boolean(touched.status && errors.status)}
                                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'transparent' } }}
                                            >
                                                <InputLabel sx={{ color: AppColors.TXT_SUB }}>Status</InputLabel>
                                                <Select
                                                    name="status"
                                                    value={values.status}
                                                    onChange={(e) => setFieldValue('status', e.target.value)}
                                                    onBlur={handleBlur}
                                                    label="Status"
                                                    sx={{ bgcolor: AppColors.BG_SECONDARY, '& .MuiSelect-select': { color: AppColors.TXT_MAIN } }}
                                                >
                                                    <MenuItem value="OPEN">OPEN</MenuItem>
                                                    <MenuItem value="WIN">WIN</MenuItem>
                                                    <MenuItem value="LOSS">LOSS</MenuItem>
                                                </Select>
                                                {touched.status && errors.status && (
                                                    <Typography variant="caption" sx={{ color: AppColors.ERROR, mt: 0.5, display: 'block' }}>
                                                        {errors.status}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                name="amount"
                                                label="Amount"
                                                value={values.amount}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={Boolean(touched.amount && errors.amount)}
                                                helperText={touched.amount && errors.amount}
                                                inputProps={{ min: 0, step: 0.01 }}
                                                sx={FIELDS_SX}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                name="feeAmount"
                                                label="Fee Amount"
                                                value={values.feeAmount}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={Boolean(touched.feeAmount && errors.feeAmount)}
                                                helperText={touched.feeAmount && errors.feeAmount}
                                                inputProps={{ min: 0, step: 0.01 }}
                                                sx={FIELDS_SX}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                name="entryPrice"
                                                label="Entry Price"
                                                value={values.entryPrice}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={Boolean(touched.entryPrice && errors.entryPrice)}
                                                helperText={touched.entryPrice && errors.entryPrice}
                                                inputProps={{ min: 0, step: 0.01 }}
                                                sx={FIELDS_SX}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                name="exitPrice"
                                                label="Exit Price"
                                                value={values.exitPrice}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={Boolean(touched.exitPrice && errors.exitPrice)}
                                                helperText={touched.exitPrice && errors.exitPrice}
                                                inputProps={{ min: 0, step: 0.01 }}
                                                sx={FIELDS_SX}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                name="rewardRate"
                                                label="Reward Rate"
                                                value={values.rewardRate}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={Boolean(touched.rewardRate && errors.rewardRate)}
                                                helperText={touched.rewardRate && errors.rewardRate}
                                                inputProps={{ min: 0, step: 0.01 }}
                                                sx={FIELDS_SX}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <DatePicker
                                                label="Open Time"
                                                value={values.openTime}
                                                isDateTimePicker
                                                onChange={(v) => setFieldValue('openTime', v)}
                                                slotProps={{ textField: { fullWidth: true, sx: FIELDS_SX } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <DatePicker
                                                label="Settlement Time"
                                                value={values.settlementTime}
                                                isDateTimePicker
                                                onChange={(v) => setFieldValue('settlementTime', v)}
                                                slotProps={{ textField: { fullWidth: true, sx: FIELDS_SX } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button type="button" onClick={handleCreateClose} sx={{ color: AppColors.TXT_SUB }}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" className="btn-primary" disabled={isSubmitting}>
                                                    {isSubmitting ? 'Creating…' : 'Create'}
                                                </Button>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Box>
                                );
                            }}
                        </Formik>
                    </CardContent>
                </Card>
            </Modal>
        </Box>
    );
};

export default ManageTradeHistory;
