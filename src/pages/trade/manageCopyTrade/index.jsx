import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
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
    InputAdornment,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import {
    Search,
    Visibility,
    Close,
    ArrowUpward,
    ArrowDownward,
    Add,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { AppColors } from '../../../constant/appColors';
import useSnackbar from '../../../hooks/useSnackbar';
import BTLoader from '../../../components/Loader';
import tradeService from '../../../services/tradeService';
import { Formik } from 'formik';
import * as yup from 'yup';
import DatePicker from '../../../components/input/datePicker';

const requiredNumber = (label) =>
    yup
        .number()
        .min(0, "Must be ≥ 0")
        .required(`${label} is required`)
        .transform((v) => (v === "" || v === null || isNaN(v) ? undefined : Number(v)));


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

const createTradeInitialValues = {
    pair: "BTC-USD",
    direction: "UP",
    grossAmount: "",
    feeAmount: "",
    netTradeAmount: "",
    entryPrice: "",
    exitPrice: "",
    payout: "",
    status: "WIN",
    startTime: null,
    expiryTime: null,
};

const createTradeValidationSchema = yup.object({
    pair: yup.string().required("Trading pair is required").trim(),
    direction: yup
        .string()
        .oneOf(["UP", "DOWN"], "Direction must be UP or DOWN")
        .required("Direction is required"),
    grossAmount: requiredNumber("Gross amount"),
    feeAmount: requiredNumber("Fee amount"),
    netTradeAmount: requiredNumber("Net trade amount"),
    entryPrice: requiredNumber("Entry price"),
    exitPrice: requiredNumber("Exit price"),
    payout: requiredNumber("Payout"),
    status: yup
        .string()
        .oneOf(["OPEN", "WIN", "LOSS"], "Status must be OPEN, WIN, or LOSS")
        .required("Status is required"),
    startTime: yup.mixed().required("Start time is required"),
    expiryTime: yup.mixed().required("Expiry time is required"),
});

const STATUS_CHIP_CONFIG = {
    WIN: { label: 'Win', bg: `${AppColors.SUCCESS}30`, color: AppColors.SUCCESS },
    LOSS: { label: 'Loss', bg: `${AppColors.ERROR}30`, color: AppColors.ERROR },
    OPEN: { label: 'Open', bg: `${AppColors.GOLD_DARK}30`, color: AppColors.GOLD_DARK },
};

function buildCreateTradePayload(values) {
    const toNum = (v) => (v === '' || v == null || isNaN(Number(v)) ? undefined : Number(v));
    const toIso = (v) => (v && dayjs(v).isValid() ? dayjs(v).toISOString() : null);
    return {
        pair: String(values.pair ?? '').trim(),
        direction: values.direction,
        grossAmount: toNum(values.grossAmount),
        feeAmount: toNum(values.feeAmount),
        netTradeAmount: toNum(values.netTradeAmount),
        entryPrice: toNum(values.entryPrice),
        exitPrice: toNum(values.exitPrice),
        payout: toNum(values.payout),
        status: values.status,
        startTime: toIso(values.startTime),
        expiryTime: toIso(values.expiryTime),
    };
}

const DEBOUNCE_MS = 400;

const ManageCopyTrade = () => {
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [createTradeDialogOpen, setCreateTradeDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [pairFilterInput, setPairFilterInput] = useState('');
    const [debouncedPairFilter, setDebouncedPairFilter] = useState('');
    const [createTradeSubmitting, setCreateTradeSubmitting] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchTradeData = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page: page + 1, limit: rowsPerPage };
            if (statusFilter) params.status = statusFilter;
            const trimmedPair = debouncedPairFilter.trim();
            if (trimmedPair) params.pair = trimmedPair;

            const response = await tradeService.getTradeData(params);
            if (response?.success) {
                setData(response.data ?? []);
                const pag = response.pagination ?? {};
                setTotal(pag.total ?? 0);
                setTotalPages(pag.totalPages ?? 0);
            } else {
                showSnackbar(response?.message ?? 'Failed to fetch trade data', 'error');
            }
        } catch (error) {
            showSnackbar(error?.response?.data?.message ?? error?.message ?? 'Error fetching trade data', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, statusFilter, debouncedPairFilter, showSnackbar]);

    useEffect(() => {
        fetchTradeData();
    }, [fetchTradeData]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedPairFilter(pairFilterInput);
            setPage(0);
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [pairFilterInput]);

    useEffect(() => {
        setPage(0);
    }, [statusFilter]);

    const handleChangePage = useCallback((_event, newPage) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        setRowsPerPage(Number(event.target.value) || 20);
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

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1, md: 2 } }}>
                <div>
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
                    <Typography
                        variant="body1"
                        sx={{ color: AppColors.TXT_SUB, fontWeight: 400 }}
                    >
                        Admin-created dummy trades shown to all users (trade feed, demo)
                    </Typography>
                </div>
                <Button
                    className="btn-primary"
                    onClick={() => setCreateTradeDialogOpen(true)}
                    startIcon={<Add />}
                    sx={{
                        alignSelf: { xs: "stretch", md: "center" },
                        color: AppColors.BG_MAIN,
                        "&:hover": {
                            color: AppColors.BG_MAIN,
                        },
                    }}
                >
                    Create Trade Data
                </Button>
            </Box>

            {/* Filters & Table */}
            <Paper
                elevation={0}
                sx={{
                    backgroundColor: AppColors.BG_CARD,
                    border: `1px solid ${AppColors.BG_SECONDARY}`,
                    borderRadius: 3,
                    pt: { xs: 1, md: 2 },
                }}
            >
                <Grid container spacing={2} px={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Filter by pair (e.g. BTC-USD)"
                            value={pairFilterInput}
                            onChange={(e) => setPairFilterInput(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: AppColors.GOLD_DARK }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    backgroundColor: AppColors.BG_SECONDARY,
                                    borderRadius: 2,
                                    '& fieldset': { border: 'none' },
                                    '& input': { color: AppColors.TXT_MAIN },
                                },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: AppColors.TXT_SUB }}>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="Status"
                                sx={{
                                    backgroundColor: AppColors.BG_SECONDARY,
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '& .MuiSelect-select': { color: AppColors.TXT_MAIN },
                                }}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="OPEN">OPEN</MenuItem>
                                <MenuItem value="WIN">WIN</MenuItem>
                                <MenuItem value="LOSS">LOSS</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <Box sx={{ mt: { xs: 1, md: 1.5 } }}>
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
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }} align="right">Gross Amount</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }} align="right">Payout</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>Start Time</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }} align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: { xs: 2, md: 4 } }}>
                                            <BTLoader />
                                        </TableCell>
                                    </TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: AppColors.TXT_SUB }}>
                                            No trade data found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((row) => (
                                        <TableRow
                                            key={row._id}
                                            hover
                                            sx={{
                                                '&:hover': { backgroundColor: `${AppColors.GOLD_DARK}05` },
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: AppColors.TXT_MAIN, fontWeight: 500 }}>
                                                    {row.pair || '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{getDirectionChip(row.direction)}</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}>
                                                    ${formatAmount(row.grossAmount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{getStatusChip(row.status)}</TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: row.status === 'WIN' ? AppColors.SUCCESS : row.status === 'LOSS' ? AppColors.ERROR : AppColors.TXT_MAIN,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    ${formatAmount(row.payout)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                                                    {formatDate(row.startTime)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewDetails(row)}
                                                            sx={{
                                                                color: AppColors.GOLD_DARK,
                                                                '&:hover': { backgroundColor: `${AppColors.GOLD_DARK}20` },
                                                            }}
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

            {/* Detail Modal – rest of fields in card */}
            <Modal
                open={modalOpen}
                onClose={handleModalClose}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 1, md: 1.5 },
                }}
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
                            <Typography variant="h6" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700 }}>
                                Trade Details
                            </Typography>
                            <IconButton
                                onClick={handleModalClose}
                                sx={{
                                    color: AppColors.TXT_SUB,
                                    '&:hover': { backgroundColor: `${AppColors.ERROR}20`, color: AppColors.ERROR },
                                }}
                            >
                                <Close />
                            </IconButton>
                        </Box>

                        {selectedTrade && (
                            <>
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
                                        <DetailItem label="Gross Amount" value={`$${formatAmount(selectedTrade.grossAmount)}`} highlight />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Fee Amount" value={`$${formatAmount(selectedTrade.feeAmount)}`} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Net Trade Amount" value={`$${formatAmount(selectedTrade.netTradeAmount)}`} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Entry Price" value={`$${formatAmount(selectedTrade.entryPrice)}`} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Exit Price" value={`$${formatAmount(selectedTrade.exitPrice)}`} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Payout" value={`$${formatAmount(selectedTrade.payout)}`} highlight />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Start Time" value={formatDate(selectedTrade.startTime)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Expiry Time" value={formatDate(selectedTrade.expiryTime)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem
                                            label="Dummy"
                                            value={
                                                <Chip
                                                    size="small"
                                                    label={selectedTrade.isDummy ? 'Yes' : 'No'}
                                                    sx={{
                                                        bgcolor: selectedTrade.isDummy ? `${AppColors.GOLD_DARK}30` : `${AppColors.TXT_SUB}30`,
                                                        color: selectedTrade.isDummy ? AppColors.GOLD_DARK : AppColors.TXT_SUB,
                                                    }}
                                                />
                                            }
                                        />
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
                            </>
                        )}
                    </CardContent>
                </Card>
            </Modal>
            {/* Create Trade Data Dialog */}
            <Dialog
                open={createTradeDialogOpen}
                onClose={() => !createTradeSubmitting && setCreateTradeDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: AppColors.BG_CARD,
                        border: `1px solid ${AppColors.BG_SECONDARY}`,
                        borderRadius: 2,
                    },
                }}
            >
                <Formik
                    initialValues={createTradeInitialValues}
                    validationSchema={createTradeValidationSchema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        setCreateTradeSubmitting(true);
                        try {
                            const payload = buildCreateTradePayload(values);
                            const res = await tradeService.createTradeData(payload);
                            const ok = res?.success !== false;
                            if (ok) {
                                showSnackbar(res?.message ?? 'Trade data created successfully', 'success');
                                resetForm();
                                setCreateTradeDialogOpen(false);
                                fetchTradeData();
                            } else {
                                showSnackbar(res?.message ?? 'Failed to create trade data', 'error');
                            }
                        } catch (err) {
                            const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create trade data';
                            showSnackbar(msg, 'error');
                        } finally {
                            setSubmitting(false);
                            setCreateTradeSubmitting(false);
                        }
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        setFieldValue,
                        handleSubmit,
                        isSubmitting,
                        resetForm,
                    }) => {
                        const submitting = isSubmitting || createTradeSubmitting;
                        const fieldSx = {
                            "& .MuiOutlinedInput-root": { bgcolor: "transparent" },
                            "& .MuiInputLabel-root": { color: AppColors.TXT_SUB },
                            "& .MuiOutlinedInput-input": { color: AppColors.TXT_MAIN },
                        };
                        return (
                            <>
                                <DialogTitle
                                    sx={{
                                        color: AppColors.GOLD_DARK,
                                        fontWeight: 600,
                                        borderBottom: `1px solid ${AppColors.HLT_NONE}40`,
                                        pb: 1.5,
                                    }}
                                >
                                    Create Trade Data
                                </DialogTitle>
                                <DialogContent sx={{ background: `linear-gradient(135deg, ${AppColors.BG_CARD} 20%, ${AppColors.BG_SECONDARY} 100%)`, backgroundColor: AppColors.BG_CARD }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    name="pair"
                                                    label="Trading Pair"
                                                    placeholder="e.g. BTC-USD, ETH-USD"
                                                    value={values.pair}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.pair && Boolean(errors.pair)}
                                                    helperText={touched.pair && errors.pair}
                                                    sx={fieldSx}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <FormControl
                                                    fullWidth
                                                    required
                                                    error={touched.direction && Boolean(errors.direction)}
                                                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "transparent" } }}
                                                >
                                                    <InputLabel sx={{ color: AppColors.TXT_SUB }}>Direction</InputLabel>
                                                    <Select
                                                        name="direction"
                                                        value={values.direction}
                                                        onChange={(e) => setFieldValue("direction", e.target.value)}
                                                        onBlur={handleBlur}
                                                        label="Direction"
                                                        sx={{
                                                            bgcolor: AppColors.BG_SECONDARY,
                                                            '& .MuiSelect-select': { color: AppColors.TXT_MAIN },
                                                        }}
                                                    >
                                                        <MenuItem value="UP">UP</MenuItem>
                                                        <MenuItem value="DOWN">DOWN</MenuItem>
                                                    </Select>
                                                    {touched.direction && errors.direction && (
                                                        <Typography variant="caption" sx={{ color: AppColors.ERROR, mt: 0.5, display: "block" }}>
                                                            {errors.direction}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    name="grossAmount"
                                                    label="Gross Amount"
                                                    value={values.grossAmount}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.grossAmount && Boolean(errors.grossAmount)}
                                                    helperText={touched.grossAmount && errors.grossAmount}
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                    sx={fieldSx}
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
                                                    error={touched.feeAmount && Boolean(errors.feeAmount)}
                                                    helperText={touched.feeAmount && errors.feeAmount}
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                    sx={fieldSx}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    name="netTradeAmount"
                                                    label="Net Trade Amount"
                                                    value={values.netTradeAmount}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.netTradeAmount && Boolean(errors.netTradeAmount)}
                                                    helperText={touched.netTradeAmount && errors.netTradeAmount}
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                    sx={fieldSx}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    name="payout"
                                                    label="Payout"
                                                    value={values.payout}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.payout && Boolean(errors.payout)}
                                                    helperText={touched.payout && errors.payout}
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                    sx={fieldSx}
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
                                                    error={touched.entryPrice && Boolean(errors.entryPrice)}
                                                    helperText={touched.entryPrice && errors.entryPrice}
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                    sx={fieldSx}
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
                                                    error={touched.exitPrice && Boolean(errors.exitPrice)}
                                                    helperText={touched.exitPrice && errors.exitPrice}
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                    sx={fieldSx}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <FormControl
                                                    fullWidth
                                                    error={touched.status && Boolean(errors.status)}
                                                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "transparent" } }}
                                                >
                                                    <InputLabel sx={{ color: AppColors.TXT_SUB }}>Status</InputLabel>
                                                    <Select
                                                        name="status"
                                                        value={values.status}
                                                        onChange={(e) => setFieldValue("status", e.target.value)}
                                                        onBlur={handleBlur}
                                                        label="Status"
                                                        sx={{ color: AppColors.TXT_MAIN }}
                                                    >
                                                        <MenuItem value="OPEN">OPEN</MenuItem>
                                                        <MenuItem value="WIN">WIN</MenuItem>
                                                        <MenuItem value="LOSS">LOSS</MenuItem>
                                                    </Select>
                                                    {touched.status && errors.status && (
                                                        <Typography variant="caption" sx={{ color: AppColors.ERROR, mt: 0.5, display: "block" }}>
                                                            {errors.status}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <DatePicker
                                                    label="Start Time"
                                                    value={values.startTime}
                                                    onChange={(v) => setFieldValue("startTime", v)}
                                                    isDateTimePicker={true}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            sx: fieldSx,
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <DatePicker
                                                    label="Expiry Time"
                                                    value={values.expiryTime}
                                                    isDateTimePicker={true}
                                                    onChange={(v) => setFieldValue("expiryTime", v)}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            sx: fieldSx,
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </DialogContent>
                                <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${AppColors.HLT_NONE}40` }}>
                                    <Button
                                        onClick={() => {
                                            if (!submitting) {
                                                resetForm();
                                                setCreateTradeDialogOpen(false);
                                            }
                                        }}
                                        disabled={submitting}
                                        sx={{ color: AppColors.TXT_SUB, "&:hover": { bgcolor: `${AppColors.HLT_NONE}20` } }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="btn-primary"
                                        onClick={() => handleSubmit()}
                                        disabled={submitting}
                                    >
                                        {submitting ? "Creating..." : "Create"}
                                    </Button>
                                </DialogActions>
                            </>
                        );
                    }}
                </Formik>
            </Dialog>
        </Box>
    );
};

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

export default ManageCopyTrade;
