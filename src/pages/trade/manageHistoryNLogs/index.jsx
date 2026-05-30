import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
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
} from "@mui/material";
import {
  TrendingUp,
  ArrowDownward,
  ArrowUpward,
  GetApp,
  Clear,
  Search,
  History,
  ShowChart,
  Visibility,
  OpenInNew,
} from "@mui/icons-material";
import tradeService from "../../../services/tradeService";
import { AppColors } from "../../../constant/appColors";
import BTLoader from "../../../components/Loader";
import dayjs from "dayjs";
import DatePicker from "../../../components/input/datePicker";
import useSnackbar from "../../../hooks/useSnackbar";

const ManageHistoryNLogs = () => {
  const { showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState("trades");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
    pair: "",
    startDate: null,
    endDate: null,
  });
  const [appliedDateRange, setAppliedDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [incomeSummary, setIncomeSummary] = useState(null);
  const [incomeDetailItem, setIncomeDetailItem] = useState(null);
  const [tradeDetailItem, setTradeDetailItem] = useState(null);
  const [depositDetailItem, setDepositDetailItem] = useState(null);

  const tabs = [
    { id: "trades", label: "Trades History", icon: <ShowChart /> },
    { id: "income", label: "Income History", icon: <TrendingUp /> },
    { id: "deposits", label: "Deposits History", icon: <ArrowDownward /> },
    { id: "withdrawals", label: "Withdrawals History", icon: <ArrowUpward /> },
  ];

  useEffect(() => {
    loadHistoryData();
  }, [activeTab, pagination.page, pagination.limit, appliedDateRange]);

  const getApiParams = (overrides = {}) => {
    return {
      page: overrides.page ?? pagination.page,
      limit: overrides.limit ?? pagination.limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.pair && { pair: filters.pair }),
      ...(appliedDateRange.startDate && {
        startDate: appliedDateRange.startDate,
      }),
      ...(appliedDateRange.endDate && { endDate: appliedDateRange.endDate }),
      ...overrides,
    };
  };

  const loadHistoryData = async () => {
    setLoading(true);
    try {
      let response;
      const params = getApiParams();

      switch (activeTab) {
        case "trades":
          response = await tradeService.getTradesHistory(params);
          break;
        case "income":
          response = await tradeService.getIncomeHistory(params);
          break;
        case "deposits":
          response = await tradeService.getDepositsHistory(params);
          break;
        case "withdrawals":
          response = await tradeService.getWithdrawalsHistory(params);
          break;
        default:
          response = { data: [], total: 0 };
      }

      setData(response.data || []);
      setPagination((prev) => {
        if (response.pagination) {
          return { ...prev, ...response.pagination };
        }
        return {
          ...prev,
          total: response.total || 0,
          totalPages: Math.ceil(
            (response.total || 0) / (response.pagination?.limit ?? prev.limit),
          ),
        };
      });
      if (activeTab === "income" && response.summary) {
        setIncomeSummary(response.summary);
      } else {
        setIncomeSummary(null);
      }
    } catch (error) {
      console.error("Error loading history data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleApplyDateFilter = () => {
    if (
      filters.startDate &&
      filters.endDate &&
      dayjs(filters.startDate).isAfter(filters.endDate, "day")
    ) {
      showSnackbar(
        "End date should be greater than or equal to start date",
        "error",
      );
      return;
    }

    setAppliedDateRange({
      startDate: filters.startDate
        ? dayjs(filters.startDate).format("YYYY-MM-DD")
        : null,
      endDate: filters.endDate
        ? dayjs(filters.endDate).format("YYYY-MM-DD")
        : null,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleFilterChange("search", value);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      type: "",
      pair: "",
      startDate: null,
      endDate: null,
    });
    setAppliedDateRange({ startDate: null, endDate: null });
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  const getTxExplorerUrl = (chain, txHash) => {
    if (!txHash) return null;

    const normalizedChain = String(chain || "")
      .trim()
      .toUpperCase();

    const explorers = {
      BSC: "https://bscscan.com",
      BNB: "https://bscscan.com",
      ETH: "https://etherscan.io",
      ETHEREUM: "https://etherscan.io",
      POLYGON: "https://polygonscan.com",
      MATIC: "https://polygonscan.com",
      TRX: "https://tronscan.org",
      TRON: "https://tronscan.org",
    };

    const baseExplorerUrl = explorers[normalizedChain] || explorers.BSC;
    return `${baseExplorerUrl}/tx/${txHash}`;
  };

  const exportData = async () => {
    setExportLoading(true);
    try {
      const allData = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const params = getApiParams({ page: currentPage, limit: 1000 });

        let response;
        switch (activeTab) {
          case "trades":
            response = await tradeService.getTradesHistory(params);
            break;
          case "income":
            response = await tradeService.getIncomeHistory(params);
            break;
          case "deposits":
            response = await tradeService.getDepositsHistory(params);
            break;
          case "withdrawals":
            response = await tradeService.getWithdrawalsHistory(params);
            break;
        }

        if (response.data && response.data.length > 0) {
          allData.push(...response.data);
          currentPage++;
          hasMore = response.data.length === 1000;
        } else {
          hasMore = false;
        }
      }

      downloadCSV(
        allData,
        `${activeTab}_history_${new Date().toISOString().split("T")[0]}.csv`,
      );
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const downloadCSV = (data, filename) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            const stringValue = String(value);
            return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      WIN: { color: "success", label: "Win" },
      LOSS: { color: "error", label: "Loss" },
      OPEN: { color: "warning", label: "Open" },
      SUCCESS: { color: "success", label: "Success" },
      PENDING: { color: "warning", label: "Pending" },
      FAILED: { color: "error", label: "Failed" },
      COMPLETED: { color: "success", label: "Completed" },
      PROCESSING: { color: "warning", label: "Processing" },
      CONFIRMED: { color: "success", label: "Confirmed" },
    };

    const config = statusConfig[status] || {
      color: "default",
      label: status || "—",
    };

    return (
      <Chip
        label={config.label}
        size="small"
        color={config.color}
        sx={{
          textTransform: "none",
          "& .MuiChip-label": {
            px: { xs: 0.5, lg: 1 },
            py: 0,
          },
        }}
      />
    );
  };

  const renderFilters = () => (
    <Box sx={{ pt: { xs: 1, md: 1.5 } }}>
      <Grid container spacing={{ xs: 1, md: 1.5 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <TextField
            id="outlined-basic"
            label="Search by User ID, UID, or Email or Full Name"
            fullWidth
            variant="outlined"
            value={searchTerm}
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

        {activeTab === "trades" && (
          <>
            <Grid size={{ xs: 6, lg: 2 }}>
              <FormControl
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48, // consistent height
                    alignItems: "center",
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "12px 10px", // proper spacing
                  },
                  "& .MuiInputBase-root": {
                    bgcolor: "none",
                  },
                }}
              >
                <InputLabel
                  sx={{
                    color: AppColors.TXT_SUB,
                    "&.Mui-focused": { color: AppColors.GOLD_DARK },
                  }}
                >
                  Status
                </InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  label="Status"
                  sx={{
                    color: AppColors.TXT_MAIN,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: AppColors.GOLD_DARK,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: AppColors.GOLD_DARK,
                    },
                    "& .MuiSvgIcon-root": {
                      color: AppColors.TXT_SUB,
                    },
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="WIN">WIN</MenuItem>
                  <MenuItem value="LOSS">LOSS</MenuItem>
                  <MenuItem value="OPEN">OPEN</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, lg: 2 }}>
              <TextField
                id="outlined-basic"
                variant="outlined"
                label="Trading Pair"
                value={filters.pair}
                onChange={(e) => handleFilterChange("pair", e.target.value)}
                fullWidth
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
          </>
        )}

        {activeTab === "income" && (
          <>
            <Grid size={{ xs: 6, lg: 2 }}>
              <FormControl
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    alignItems: "center",
                  },
                  "& .MuiOutlinedInput-input": { padding: "12px 10px" },
                }}
              >
                <InputLabel
                  sx={{
                    color: AppColors.TXT_SUB,
                    "&.Mui-focused": { color: AppColors.GOLD_DARK },
                  }}
                >
                  Income Type
                </InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  label="Income Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="REFERRAL_BONUS">Referral Bonus</MenuItem>
                  <MenuItem value="LEVEL_INCOME">Level Income</MenuItem>
                  <MenuItem value="SALARY_INCOME">Salary Income</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, lg: 2 }}>
              <FormControl
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 48,
                    alignItems: "center",
                  },
                  "& .MuiOutlinedInput-input": { padding: "12px 10px" },
                }}
              >
                <InputLabel
                  sx={{
                    color: AppColors.TXT_SUB,
                    "&.Mui-focused": { color: AppColors.GOLD_DARK },
                  }}
                >
                  Status
                </InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {(activeTab === "deposits" || activeTab === "withdrawals") && (
          <Grid size={{ xs: 6, lg: 2 }}>
            <FormControl
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 48, // consistent height
                  alignItems: "center",
                },
                "& .MuiOutlinedInput-input": {
                  padding: "12px 10px", // proper spacing
                },
              }}
            >
              <InputLabel
                sx={{
                  color: AppColors.TXT_SUB,
                  "&.Mui-focused": { color: AppColors.GOLD_DARK },
                }}
              >
                Status
              </InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {activeTab === "withdrawals" && (
          <Grid size={{ xs: 6, lg: 2 }}>
            <FormControl
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 48, // consistent height
                  alignItems: "center",
                },
                "& .MuiOutlinedInput-input": {
                  padding: "12px 10px", // proper spacing
                },
              }}
            >
              <InputLabel
                sx={{
                  color: AppColors.TXT_SUB,
                  "&.Mui-focused": { color: AppColors.GOLD_DARK },
                }}
              >
                Withdrawal Type
              </InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                label="Withdrawal Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="WITHDRAW_WINNINGS">Withdraw Winnings</MenuItem>
                <MenuItem value="WITHDRAW_WORKING">Withdraw Working</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid size={{ xs: 6, lg: 2 }}>
          <DatePicker
            label="Start Date"
            value={filters.startDate}
            onChange={(newValue) =>
              setFilters((prev) => ({ ...prev, startDate: newValue }))
            }
            slotProps={{ textField: { fullWidth: true } }}
            sx={{
              width: "100%",
              "& .MuiPickersSectionList-root": {
                padding: "13px 10px",
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 6, lg: 2 }}>
          <DatePicker
            label="End Date"
            value={filters.endDate}
            onChange={(newValue) =>
              setFilters((prev) => ({ ...prev, endDate: newValue }))
            }
            slotProps={{ textField: { fullWidth: true } }}
            sx={{
              width: "100%",
              "& .MuiPickersSectionList-root": {
                padding: "13px 10px",
              },
            }}
          />
        </Grid>
      </Grid>
      {(filters.startDate ||
        filters.endDate ||
        filters.status ||
        filters.type ||
        filters.pair ||
        filters.search) && (
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}
        >
          <Button
            className="btn-primary"
            onClick={handleApplyDateFilter}
            startIcon={<Search />}
            sx={{
              width: { xs: "100%", lg: "auto" },
            }}
          >
            Apply Filter
          </Button>
          <Button
            onClick={clearFilters}
            variant="outlined"
            startIcon={<Clear />}
            sx={{
              alignSelf: "flex-end",
              borderColor: AppColors.GOLD_DARK,
              color: AppColors.GOLD_DARK,
              "&:hover": {
                borderColor: AppColors.GOLD_LIGHT,
                bgcolor: `${AppColors.GOLD_DARK}10`,
              },
              width: { xs: "100%", lg: "auto" },
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Box>
  );

  /** Global index offset for the current page (API uses 1-based `pagination.page`). */
  const rowSerialBase = (pagination.page - 1) * pagination.limit;

  const renderTradeRow = (item, index) => (
    <TableRow
      key={item._id || item.id || index}
      sx={{ "&:hover": { bgcolor: `${AppColors.HLT_LIGHT}` } }}
    >
      <TableCell
        align="center"
        sx={{
          color: AppColors.TXT_SUB,
          fontVariantNumeric: "tabular-nums",
          width: 56,
          maxWidth: 72,
        }}
      >
        {rowSerialBase + index + 1}
      </TableCell>
      <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 500 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          <Typography variant="body2" component="span">
            {item?.user?.fullName || "N/A"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: AppColors.TXT_SUB,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            UID: {item?.user?.UID ?? "—"}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>
        {item.pair || "N/A"}
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          icon={
            item.direction === "UP" ? (
              <ArrowUpward sx={{ fontSize: 12 }} />
            ) : item.direction === "DOWN" ? (
              <ArrowDownward sx={{ fontSize: 12 }} />
            ) : undefined
          }
          label={item.direction || "—"}
          sx={{
            bgcolor:
              item.direction === "UP"
                ? `${AppColors.SUCCESS}18`
                : item.direction === "DOWN"
                  ? `${AppColors.ERROR}18`
                  : `${AppColors.HLT_NONE}30`,
            color:
              item.direction === "UP"
                ? AppColors.SUCCESS
                : item.direction === "DOWN"
                  ? AppColors.ERROR
                  : AppColors.TXT_SUB,
            "& .MuiChip-icon": { color: "inherit" },
          }}
        />
      </TableCell>
      <TableCell sx={{ color: AppColors.GOLD_DARK }}>
        ${formatAmount(item.grossAmount ?? item.amount)}
      </TableCell>
      <TableCell>{getStatusChip(item.status)}</TableCell>
      <TableCell
        sx={{
          color:
            item.status === "WIN"
              ? AppColors.SUCCESS
              : item.status === "LOSS"
                ? AppColors.ERROR
                : AppColors.TXT_SUB,
        }}
      >
        ${formatAmount(item.payout ?? item.profit ?? 0)}
      </TableCell>
      <TableCell sx={{ color: AppColors.TXT_SUB, fontSize: "0.8rem" }}>
        {formatDate(item.startTime || item.createdAt)}
      </TableCell>
      <TableCell sx={{ width: 48, p: 0 }}>
        <IconButton
          size="small"
          onClick={() => setTradeDetailItem(item)}
          sx={{
            color: AppColors.GOLD_DARK,
            "&:hover": { bgcolor: `${AppColors.GOLD_DARK}15` },
          }}
          aria-label="View details"
        >
          <Visibility fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const getIncomeTypeLabel = (type) => {
    const labels = {
      REFERRAL_BONUS: "Referral Bonus",
      LEVEL_INCOME: "Level Income",
      SALARY_INCOME: "Salary Income",
    };
    return labels[type] || type || "—";
  };

  const renderIncomeRow = (item, index) => (
    <TableRow
      key={item._id || item.id || index}
      sx={{ "&:hover": { bgcolor: `${AppColors.HLT_LIGHT}` } }}
    >
      <TableCell
        align="center"
        sx={{
          color: AppColors.TXT_SUB,
          fontVariantNumeric: "tabular-nums",
          width: 56,
          maxWidth: 72,
        }}
      >
        {rowSerialBase + index + 1}
      </TableCell>
      <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 500 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          <Typography variant="body2" component="span">
            {item?.user?.fullName || "N/A"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: AppColors.TXT_SUB,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            UID: {item?.user?.UID ?? "—"}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>
        {getIncomeTypeLabel(item.type)}
      </TableCell>
      <TableCell sx={{ color: AppColors.SUCCESS }}>
        +{formatAmount(item.amount)} {item.currency || "USDT"}
      </TableCell>
      <TableCell>{getStatusChip(item.status)}</TableCell>
      <TableCell sx={{ color: AppColors.TXT_SUB }}>
        {formatDate(item.createdAt)}
      </TableCell>
      <TableCell sx={{ width: 48, p: 0 }}>
        <IconButton
          size="small"
          onClick={() => setIncomeDetailItem(item)}
          sx={{
            color: AppColors.GOLD_DARK,
            "&:hover": { bgcolor: `${AppColors.GOLD_DARK}15` },
          }}
          aria-label="View details"
        >
          <Visibility fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderDepositRow = (item, index) => {
    const isAdminCredit = item.walletAddress === "admin-test";
    return (
      <TableRow
        key={item._id || item.id || index}
        sx={{
          ...(isAdminCredit && {
            bgcolor: `${AppColors.GOLD_DARK}10`,
            borderLeft: `3px solid ${AppColors.GOLD_DARK}`,
          }),
          "&:hover": {
            bgcolor: isAdminCredit
              ? `${AppColors.GOLD_DARK}18`
              : `${AppColors.HLT_LIGHT}`,
          },
        }}
      >
        <TableCell
          align="center"
          sx={{
            color: AppColors.TXT_SUB,
            fontVariantNumeric: "tabular-nums",
            width: 56,
            maxWidth: 72,
          }}
        >
          {rowSerialBase + index + 1}
        </TableCell>
        <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 500 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.25,
                minWidth: 0,
              }}
            >
              <Typography variant="body2" component="span">
                {item?.user?.fullName || "N/A"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: AppColors.TXT_SUB,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                UID: {item?.user?.UID ?? "—"}
              </Typography>
            </Box>
            {isAdminCredit && (
              <Chip
                label="Admin credit"
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  bgcolor: `${AppColors.GOLD_DARK}22`,
                  color: AppColors.GOLD_DARK,
                }}
              />
            )}
          </Box>
        </TableCell>
        <TableCell sx={{ color: AppColors.GOLD_DARK }}>
          {formatAmount(item.amount)} {item.currency || "USDT"}
        </TableCell>
        <TableCell sx={{ color: AppColors.TXT_SUB }}>
          {item.chain || "—"}
        </TableCell>
        <TableCell>{getStatusChip(item.status)}</TableCell>
        <TableCell sx={{ color: AppColors.TXT_SUB, fontSize: "0.8rem" }}>
          {formatDate(item.createdAt)}
        </TableCell>
        <TableCell sx={{ width: 48, p: 0 }}>
          <IconButton
            size="small"
            onClick={() => setDepositDetailItem(item)}
            sx={{
              color: AppColors.GOLD_DARK,
              "&:hover": { bgcolor: `${AppColors.GOLD_DARK}15` },
            }}
            aria-label="View details"
          >
            <Visibility fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  const renderWithdrawalRow = (item, index) => {
    const userObj = typeof item.user === "object" && item.user !== null;
    const uidLine = userObj
      ? (item.user?.UID ?? "—")
      : typeof item.user === "string"
        ? item.user
        : "—";

    return (
      <TableRow key={item.id || index}>
        <TableCell
          align="center"
          sx={{
            color: AppColors.TXT_SUB,
            fontVariantNumeric: "tabular-nums",
            width: 56,
            maxWidth: 72,
          }}
        >
          {rowSerialBase + index + 1}
        </TableCell>
        <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 500 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            <Typography variant="body2" component="span">
              {userObj ? item.user?.fullName || "N/A" : "N/A"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: AppColors.TXT_SUB,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              UID: {uidLine}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography sx={{ color: AppColors.ERROR }}>
            -${formatAmount(item.amount)}
          </Typography>
        </TableCell>
        <TableCell sx={{ color: AppColors.TXT_MAIN }}>
          {item.type || "N/A"}
        </TableCell>
        <TableCell>
          <Typography
            sx={{
              color: AppColors.TXT_SUB,
              fontFamily: "monospace",
              fontSize: "0.875rem",
            }}
          >
            {item.walletAddress
              ? `${item.walletAddress.slice(0, 8)}...${item.walletAddress.slice(-6)}`
              : "N/A"}
          </Typography>
        </TableCell>
        <TableCell>{getStatusChip(item.status)}</TableCell>
        <TableCell sx={{ color: AppColors.TXT_SUB }}>
          {formatDate(item.createdAt)}
        </TableCell>
        <TableCell>
          {item.txHash ? (
            <Typography
              sx={{
                color: AppColors.TXT_SUB,
                fontFamily: "monospace",
                fontSize: "0.875rem",
              }}
            >
              {`${item.txHash.slice(0, 8)}...${item.txHash.slice(-6)}`}
            </Typography>
          ) : (
            "N/A"
          )}
        </TableCell>
      </TableRow>
    );
  };

  const renderTableHeaders = () => {
    const headers = {
      trades: [
        "User",
        "Pair",
        "Direction",
        "Amount",
        "Status",
        "Payout",
        "Date",
      ],
      income: ["User", "Type", "Amount", "Status", "Date"],
      deposits: ["User", "Amount", "Chain", "Status", "Date"],
      withdrawals: [
        "User",
        "Amount",
        "Type",
        "To Address",
        "Status",
        "Date",
        "TX Hash",
      ],
    };

    return (
      <TableHead>
        <TableRow>
          <TableCell
            align="center"
            sx={{
              color: AppColors.TXT_MAIN,
              fontWeight: 600,
              width: 56,
              maxWidth: 72,
            }}
          >
            #
          </TableCell>
          {headers[activeTab]?.map((header, index) => (
            <TableCell key={index}>{header}</TableCell>
          ))}
          {activeTab === "trades" && (
            <TableCell sx={{ width: 48, p: 0 }} align="center" />
          )}
          {activeTab === "income" && (
            <TableCell sx={{ width: 48, p: 0 }} align="center" />
          )}
          {activeTab === "deposits" && (
            <TableCell sx={{ width: 48, p: 0 }} align="center" />
          )}
        </TableRow>
      </TableHead>
    );
  };

  const renderTableBody = () => {
    const renderFunctions = {
      trades: renderTradeRow,
      income: renderIncomeRow,
      deposits: renderDepositRow,
      withdrawals: renderWithdrawalRow,
    };

    const renderFunction = renderFunctions[activeTab];

    return (
      <TableBody>
        {data.map((item, index) => renderFunction(item, index))}
      </TableBody>
    );
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event) => {
    const limit = parseInt(event.target.value, 10);
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const tablePaginationColSpan =
    { trades: 9, income: 7, deposits: 7, withdrawals: 8 }[activeTab] || 9;

  return (
    <Box>
      {/* MainHeader */}
      <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 1, md: 1.5 },
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
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              History & Logs Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: AppColors.TXT_SUB,
                fontWeight: 400,
              }}
            >
              Monitor and analyze all platform activities
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 1.5 },
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={exportData}
              variant="outlined"
              startIcon={<GetApp />}
              sx={{
                px: { xs: 1, md: 1.5 },
                py: { xs: 0.27, md: 0.5 },
                borderColor: AppColors.GOLD_DARK,
                color: AppColors.GOLD_DARK,
                "&:hover": {
                  borderColor: AppColors.GOLD_LIGHT,
                  color: AppColors.GOLD_LIGHT,
                  bgcolor: `${AppColors.GOLD_DARK}10`,
                },
              }}
            >
              <Typography variant="body2" sx={{ color: AppColors.GOLD_DARK }}>
                {exportLoading ? "Exporting..." : "Export CSV"}
              </Typography>
            </Button>
            <Paper
              elevation={0}
              sx={{
                bgcolor: AppColors.BG_CARD,
                border: `1px solid ${AppColors.BG_SECONDARY}`,
                px: { xs: 1, md: 1.5 },
                py: { xs: 0.27, md: 0.5 },
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, md: 1 },
              }}
            >
              <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                Total Records
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}
              >
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
          height: "100%",
          background: `linear-gradient(135deg, ${AppColors.BG_CARD} 0%, ${AppColors.BG_SECONDARY} 100%)`,
        }}
      >
        <Box
          sx={{
            p: { xs: 1, md: 1.5 },
            borderBottom: `1px solid ${AppColors.BG_SECONDARY}`,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => {
              setActiveTab(newValue);
              setPagination((prev) => ({ ...prev, page: 1 }));
              setIncomeDetailItem(null);
              setTradeDetailItem(null);
              setDepositDetailItem(null);
            }}
            sx={{
              minHeight: "2.25rem",
              borderBottom: `1px solid ${AppColors.BG_SECONDARY}`,
              "& .MuiTabs-indicator": {
                backgroundColor: AppColors.GOLD_DARK,
              },
              "& .MuiTab-root": {
                color: AppColors.TXT_SUB,
                minHeight: "2.25rem",
                padding: { xs: "8px 8px", md: "10px 10px" },
                fontSize: { xs: "0.75rem", md: "0.875rem" },
                textTransform: "none",
                fontWeight: 500,
                "& .MuiTab-iconWrapper": {
                  marginRight: "6px",
                  fontSize: { xs: "1rem", md: "1.125rem" },
                },
                "&.Mui-selected": {
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
          {renderFilters()}
        </Box>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <BTLoader />
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <History
              sx={{
                fontSize: 64,
                color: AppColors.TXT_SUB,
                mb: 2,
                opacity: 0.5,
              }}
            />
            <Typography variant="h6" sx={{ color: AppColors.TXT_MAIN, mb: 1 }}>
              No Data Found
            </Typography>
            <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
              No records match your current filters.
            </Typography>
          </Box>
        ) : (
          <>
            {activeTab === "income" && incomeSummary && (
              <Box sx={{ px: 2, pb: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                    Summary:
                  </Typography>
                  <Chip
                    label={`Total: ${formatAmount(incomeSummary.totalIncomeAmount)} USDT`}
                    size="small"
                    sx={{
                      bgcolor: `${AppColors.GOLD_DARK}20`,
                      color: AppColors.GOLD_DARK,
                    }}
                  />
                  {["LEVEL_INCOME", "REFERRAL_BONUS", "SALARY_INCOME"].map(
                    (k) => {
                      const s = incomeSummary[k];
                      if (!s || (s.count === 0 && !s.totalAmount)) return null;
                      return (
                        <Chip
                          key={k}
                          label={`${getIncomeTypeLabel(k)}: ${formatAmount(s.totalAmount || 0)} (${s.count})`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: AppColors.HLT_NONE,
                            color: AppColors.TXT_SUB,
                            fontSize: "0.75rem",
                          }}
                        />
                      );
                    },
                  )}
                </Box>
              </Box>
            )}
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: "none",
                maxHeight: "calc(100vh - 10em)",
                overflowX: "auto",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                "& .MuiTableCell-root": {
                  py: { xs: 0.5, sm: 1 },
                  px: { xs: 0.75, sm: 1.25 },
                  borderBottom: `1px solid ${AppColors.HLT_NONE}30`,
                },
                "& .MuiTableCell-body": {
                  minWidth: { xs: "8em", lg: "none" },
                  maxWidth: { xs: "14em", lg: "none" },
                },
              }}
            >
              <Table
                stickyHeader
                size="small"
                sx={{
                  background: `linear-gradient(360deg, ${AppColors.BG_SECONDARY} 0%, ${AppColors.BG_MAIN} 100%)`,
                }}
              >
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
                        borderBottom: "none",
                        color: AppColors.TXT_SUB,
                        "& .MuiTablePagination-selectIcon": {
                          color: AppColors.GOLD_DARK,
                        },
                        "& .MuiTablePagination-select": {
                          color: AppColors.TXT_MAIN,
                        },
                        "& .MuiTablePagination-displayedRows": {
                          color: AppColors.TXT_MAIN,
                        },
                        "& .MuiIconButton-root": {
                          color: AppColors.TXT_SUB,
                          "&:hover": {
                            bgcolor: `${AppColors.GOLD_DARK}20`,
                            color: AppColors.GOLD_DARK,
                          },
                          "&.Mui-disabled": { color: AppColors.HLT_NONE },
                        },
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>

      {/* Trade Detail Modal */}
      <Dialog
        open={!!tradeDetailItem}
        onClose={() => setTradeDetailItem(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: AppColors.BG_CARD,
            border: `1px solid ${AppColors.BG_SECONDARY}`,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: AppColors.GOLD_DARK,
            fontWeight: 600,
            borderBottom: `1px solid ${AppColors.HLT_NONE}40`,
            pb: 1.5,
          }}
        >
          Trade Details
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {tradeDetailItem && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  User
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Typography sx={{ color: AppColors.TXT_MAIN }}>
                    {tradeDetailItem?.user?.fullName || "—"}
                  </Typography>
                  <Typography
                    sx={{ color: AppColors.TXT_SUB, fontSize: "0.875rem" }}
                  >
                    {tradeDetailItem?.user?.email || "—"}
                  </Typography>
                  <Typography
                    sx={{
                      color: AppColors.TXT_SUB,
                      fontSize: "0.8rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {tradeDetailItem?.user?.UID || "—"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Pair
                </Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>
                  {tradeDetailItem.pair || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Direction
                </Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>
                  {tradeDetailItem.direction || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Gross Amount
                </Typography>
                <Typography
                  sx={{ color: AppColors.GOLD_DARK, fontWeight: 600, mt: 0.5 }}
                >
                  $
                  {formatAmount(
                    tradeDetailItem.grossAmount ?? tradeDetailItem.amount,
                  )}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Fee
                </Typography>
                <Typography sx={{ color: AppColors.ERROR, mt: 0.5 }}>
                  ${formatAmount(tradeDetailItem.feeAmount)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Net Amount
                </Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>
                  ${formatAmount(tradeDetailItem.netTradeAmount)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Payout
                </Typography>
                <Typography
                  sx={{
                    color:
                      tradeDetailItem.status === "WIN"
                        ? AppColors.SUCCESS
                        : tradeDetailItem.status === "LOSS"
                          ? AppColors.ERROR
                          : AppColors.TXT_MAIN,
                    fontWeight: 600,
                    mt: 0.5,
                  }}
                >
                  $
                  {formatAmount(
                    tradeDetailItem.payout ?? tradeDetailItem.profit ?? 0,
                  )}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Entry Price
                </Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>
                  ${formatAmount(tradeDetailItem.entryPrice)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Exit Price
                </Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>
                  ${formatAmount(tradeDetailItem.exitPrice)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getStatusChip(tradeDetailItem.status)}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Start
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_SUB,
                    mt: 0.5,
                    fontSize: "0.875rem",
                  }}
                >
                  {formatDate(tradeDetailItem.startTime)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Expiry
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_SUB,
                    mt: 0.5,
                    fontSize: "0.875rem",
                  }}
                >
                  {formatDate(tradeDetailItem.expiryTime)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Created
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_SUB,
                    mt: 0.5,
                    fontSize: "0.875rem",
                  }}
                >
                  {formatDate(tradeDetailItem.createdAt)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Updated
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_SUB,
                    mt: 0.5,
                    fontSize: "0.875rem",
                  }}
                >
                  {formatDate(tradeDetailItem.updatedAt)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  ID
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_SUB,
                    mt: 0.5,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  {tradeDetailItem._id || "—"}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: `1px solid ${AppColors.HLT_NONE}40` }}
        >
          <Button
            onClick={() => setTradeDetailItem(null)}
            sx={{
              color: AppColors.GOLD_DARK,
              "&:hover": { bgcolor: `${AppColors.GOLD_DARK}15` },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Income Detail Modal */}
      <Dialog
        open={!!incomeDetailItem}
        onClose={() => setIncomeDetailItem(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: AppColors.BG_CARD,
            border: `1px solid ${AppColors.BG_SECONDARY}`,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: AppColors.GOLD_DARK,
            fontWeight: 600,
            borderBottom: `1px solid ${AppColors.HLT_NONE}40`,
            pb: 1.5,
          }}
        >
          Income Details
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {incomeDetailItem && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  User
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Typography sx={{ color: AppColors.TXT_MAIN }}>
                    {incomeDetailItem?.user?.fullName || "—"}
                  </Typography>
                  <Typography
                    sx={{ color: AppColors.TXT_SUB, fontSize: "0.875rem" }}
                  >
                    {incomeDetailItem?.user?.email || "—"}
                  </Typography>
                  <Typography
                    sx={{
                      color: AppColors.TXT_SUB,
                      fontSize: "0.8rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {incomeDetailItem?.user?.UID || "—"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Type
                </Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>
                  {getIncomeTypeLabel(incomeDetailItem.type)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Amount
                </Typography>
                <Typography
                  sx={{ color: AppColors.SUCCESS, fontWeight: 600, mt: 0.5 }}
                >
                  +{formatAmount(incomeDetailItem.amount)}{" "}
                  {incomeDetailItem.currency || "USDT"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Chain
                </Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>
                  {incomeDetailItem.chain || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Currency
                </Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>
                  {incomeDetailItem.currency || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getStatusChip(incomeDetailItem.status)}
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Wallet Address
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_MAIN,
                    mt: 0.5,
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    wordBreak: "break-all",
                  }}
                >
                  {incomeDetailItem.walletAddress || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Transaction Hash
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <Typography
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      wordBreak: "break-all",
                    }}
                  >
                    {incomeDetailItem.txHash || "—"}
                  </Typography>
                  {incomeDetailItem.txHash && (
                    <IconButton
                      size="small"
                      onClick={() =>
                        window.open(
                          getTxExplorerUrl(incomeDetailItem.chain, incomeDetailItem.txHash),
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      sx={{
                        color: AppColors.TXT_SUB,
                        "&:hover": { color: AppColors.GOLD_DARK },
                      }}
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Created
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_SUB,
                    mt: 0.5,
                    fontSize: "0.875rem",
                  }}
                >
                  {formatDate(incomeDetailItem.createdAt)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Updated
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_SUB,
                    mt: 0.5,
                    fontSize: "0.875rem",
                  }}
                >
                  {formatDate(incomeDetailItem.updatedAt)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  ID
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_SUB,
                    mt: 0.5,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  {incomeDetailItem._id || "—"}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: `1px solid ${AppColors.HLT_NONE}40` }}
        >
          <Button
            onClick={() => setIncomeDetailItem(null)}
            sx={{
              color: AppColors.GOLD_DARK,
              "&:hover": { bgcolor: `${AppColors.GOLD_DARK}15` },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deposit Detail Modal */}
      <Dialog
        open={!!depositDetailItem}
        onClose={() => setDepositDetailItem(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: AppColors.BG_CARD,
            border: `1px solid ${AppColors.BG_SECONDARY}`,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: AppColors.GOLD_DARK,
            fontWeight: 600,
            borderBottom: `1px solid ${AppColors.HLT_NONE}40`,
            pb: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            Deposit Details
            {depositDetailItem?.walletAddress === "admin-test" && (
              <Chip
                label="Admin credit"
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: `${AppColors.GOLD_DARK}22`,
                  color: AppColors.GOLD_DARK,
                }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {depositDetailItem && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  User
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Typography sx={{ color: AppColors.TXT_MAIN }}>
                    {depositDetailItem?.user?.fullName || "—"}
                  </Typography>
                  <Typography
                    sx={{ color: AppColors.TXT_SUB, fontSize: "0.875rem" }}
                  >
                    {depositDetailItem?.user?.email || "—"}
                  </Typography>
                  <Typography
                    sx={{
                      color: AppColors.TXT_SUB,
                      fontSize: "0.8rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {depositDetailItem?.user?.UID || "—"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Type
                </Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>
                  {depositDetailItem.type || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Amount
                </Typography>
                <Typography
                  sx={{ color: AppColors.GOLD_DARK, fontWeight: 600, mt: 0.5 }}
                >
                  {formatAmount(depositDetailItem.amount)}{" "}
                  {depositDetailItem.currency || "USDT"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Chain
                </Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>
                  {depositDetailItem.chain || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Currency
                </Typography>
                <Typography sx={{ color: AppColors.TXT_MAIN, mt: 0.5 }}>
                  {depositDetailItem.currency || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getStatusChip(depositDetailItem.status)}
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Wallet Address
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_MAIN,
                    mt: 0.5,
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    wordBreak: "break-all",
                  }}
                >
                  {depositDetailItem.walletAddress || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Transaction Hash
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <Typography
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      wordBreak: "break-all",
                    }}
                  >
                    {depositDetailItem.txHash || "—"}
                  </Typography>
                  {depositDetailItem.txHash && (
                    <IconButton
                      size="small"
                      onClick={() =>
                        window.open(
                          getTxExplorerUrl(depositDetailItem.chain, depositDetailItem.txHash),
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      sx={{
                        color: AppColors.TXT_SUB,
                        "&:hover": { color: AppColors.GOLD_DARK },
                      }}
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Created
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_SUB,
                    mt: 0.5,
                    fontSize: "0.875rem",
                  }}
                >
                  {formatDate(depositDetailItem.createdAt)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Updated
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_SUB,
                    mt: 0.5,
                    fontSize: "0.875rem",
                  }}
                >
                  {formatDate(depositDetailItem.updatedAt)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.TXT_SUB,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  ID
                </Typography>
                <Typography
                  sx={{
                    color: AppColors.TXT_SUB,
                    mt: 0.5,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  {depositDetailItem._id || "—"}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: `1px solid ${AppColors.HLT_NONE}40` }}
        >
          <Button
            onClick={() => setDepositDetailItem(null)}
            sx={{
              color: AppColors.GOLD_DARK,
              "&:hover": { bgcolor: `${AppColors.GOLD_DARK}15` },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageHistoryNLogs;
