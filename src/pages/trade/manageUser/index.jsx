import React, { useState, useEffect, useCallback } from "react";
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
  Button,
  Grid,
  Avatar,
  Stack,
  Tooltip,
  CircularProgress,
  Menu,
  MenuItem as ActionMenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Search,
  Visibility,
  Block,
  Delete,
  Sort,
  ArrowUpward,
  ArrowDownward,
  Person,
  Close,
  Check,
  Restore,
  AccountBalanceWallet,
  Update,
  Paid,
  Edit,
  MoreVert,
} from "@mui/icons-material";
import { AppColors } from "../../../constant/appColors";
import useSnackbar from "../../../hooks/useSnackbar";
import tradeService from "../../../services/tradeService";
import BTLoader from "../../../components/Loader";
import DatePicker from "../../../components/input/datePicker";
import { FONT_SIZE } from "../../../constant/lookUpConstant";
import networkService from "../../../services/networkService";
import { useNavigate } from "react-router-dom";

/** Empty string = no change (0 added). Digits only while typing. */
function parseNonNegativeIncrementInput(raw) {
  const t = String(raw ?? "").trim();
  if (t === "") return { delta: 0, valid: true };
  if (!/^\d+$/.test(t)) return { delta: 0, valid: false };
  return { delta: Number.parseInt(t, 10), valid: true };
}

const ManageUsers = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  // Table state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal state
  const [userDetails, setUserDetails] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [userModalMenuAnchor, setUserModalMenuAnchor] = useState(null);

  // Action state
  const [actionLoading, setActionLoading] = useState(false);

  // Update email (inline in details modal)
  const [emailEditMode, setEmailEditMode] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  // Dummy Deposit modal
  const [dummyDepositOpen, setDummyDepositOpen] = useState(false);
  const [dummyDepositSubmitting, setDummyDepositSubmitting] = useState(false);
  const [dummyForm, setDummyForm] = useState({ UID: "", amount: "", note: "" });
  const [dummyFormError, setDummyFormError] = useState(null);

  // Give Salary modal
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [salarySubmitting, setSalarySubmitting] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    UID: "",
    salaryAmount: "",
    date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    note: "",
  });
  const [salaryFormError, setSalaryFormError] = useState(null);
  const [userStatsLoading, setUserStatsLoading] = useState(false);
  const [openUserStatsModal, setOpenUserStatsModal] = useState(false);
  const [userStatsSubmitting, setUserStatsSubmitting] = useState(false);
  /** Current server-side counts (read-only display) */
  const [userStatsDisplay, setUserStatsDisplay] = useState({
    totalUsers: 0,
    newUsers: 0,
  });
  /** How much to add to each counter; blank = add 0 for that field */
  const [userStatsIncrements, setUserStatsIncrements] = useState({
    addTotal: "",
    addNew: "",
  });
  const [userStatsFormError, setUserStatsFormError] = useState(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
        search: debouncedSearch.trim(),
        sortBy,
        sortOrder,
      };

      // Add status filters
      if (statusFilter === "blocked") {
        params.isBlocked = true;
      } else if (statusFilter === "deleted") {
        params.isDeleted = true;
      } else if (statusFilter === "active") {
        params.isBlocked = false;
        params.isDeleted = false;
      }

      const response = await tradeService.getUsers(params);
      if (response.success) {
        setUsers(response.data || []);
        setTotalUsers(response.pagination?.total || 0);
      } else {
        showSnackbar("Failed to fetch users", "error");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("Error fetching users", "error");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    debouncedSearch,
    statusFilter,
    sortBy,
    sortOrder,
    showSnackbar,
  ]);

  const fetchUserStats = async () => {
    try {
      setUserStatsLoading(true);
      const response = await tradeService.getUserStats();
      if (response.success) {
        setUserStatsDisplay({
          totalUsers: response.data?.totalUsers ?? 0,
          newUsers: response.data?.newUsers ?? 0,
        });
      } else {
        showSnackbar("Failed to fetch user stats", "error");
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      showSnackbar("Error fetching user stats", "error");
    } finally {
      setUserStatsLoading(false);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId, userUID) => {
    try {
      setModalLoading(true);
      const params = userId ? { id: userId } : { uid: userUID };
      const response = await tradeService.getUserDetails(params);

      if (response.success) {
        // Check if the response data has user nested or is direct
        const userData = response.data.user || response.data;
        setUserDetails(userData);
      } else {
        showSnackbar("Failed to fetch user details", "error");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      showSnackbar("Error fetching user details", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const updateUserStatus = async (UID, updates) => {
    if (!UID || !updates || typeof updates !== "object") {
      showSnackbar("Invalid user or update payload", "error");
      return;
    }

    const isDeleteFlow = Object.prototype.hasOwnProperty.call(
      updates,
      "isDeleted",
    );
    const isBlockFlow = Object.prototype.hasOwnProperty.call(
      updates,
      "isBlocked",
    );

    const mergeDetailsIfOpen = () => {
      setUserDetails((prev) =>
        prev && prev.UID === UID ? { ...prev, ...updates } : prev,
      );
    };

    const apiErrorMessage = (err) =>
      err?.response?.data?.message || err?.message || "Request failed";

    try {
      setActionLoading(true);

      // Delete / restore: trade service only (do not sync to network admin)
      if (isDeleteFlow) {
        const tradeResponse = await tradeService.updateUserStatus(UID, updates);
        if (!tradeResponse?.success) {
          showSnackbar(
            tradeResponse?.message || "Failed to update user status",
            "error",
          );
          return;
        }
        showSnackbar(
          tradeResponse.message || "User status updated successfully",
          "success",
        );
        fetchUsers();
        mergeDetailsIfOpen();
        return;
      }

      // Block / unblock: trade + network admin must stay in sync
      if (isBlockFlow) {
        const [tradeResponse, networkResponse] = await Promise.all([
          tradeService.updateUserStatus(UID, updates),
          networkService.blockUnblockUser(UID, {
            isBlocked: updates.isBlocked,
          }),
        ]);

        const tradeOk = Boolean(tradeResponse?.success);
        const networkOk = Boolean(networkResponse?.success);

        if (tradeOk && networkOk) {
          showSnackbar(
            tradeResponse?.message ||
              networkResponse?.message ||
              "User status updated successfully",
            "success",
          );
          fetchUsers();
          mergeDetailsIfOpen();
          return;
        }

        fetchUsers();

        if (tradeOk && !networkOk) {
          showSnackbar(
            networkResponse?.message ||
              "Trade updated but network admin sync failed. Reopen user details to verify.",
            "error",
          );
          if (modalOpen && userDetails?.UID === UID) {
            fetchUserDetails(undefined, UID);
          }
          return;
        }

        if (!tradeOk && networkOk) {
          showSnackbar(
            tradeResponse?.message ||
              "Network updated but trade service failed. Data may be inconsistent.",
            "error",
          );
          if (modalOpen && userDetails?.UID === UID) {
            fetchUserDetails(undefined, UID);
          }
          return;
        }

        showSnackbar(
          tradeResponse?.message ||
            networkResponse?.message ||
            "Failed to update user status",
          "error",
        );
        return;
      }

      const tradeResponse = await tradeService.updateUserStatus(UID, updates);
      if (!tradeResponse?.success) {
        showSnackbar(
          tradeResponse?.message || "Failed to update user status",
          "error",
        );
        return;
      }
      showSnackbar(
        tradeResponse.message || "User status updated successfully",
        "success",
      );
      fetchUsers();
      mergeDetailsIfOpen();
    } catch (error) {
      console.error("Error updating user status:", error);
      showSnackbar(
        apiErrorMessage(error) || "Error updating user status",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle view user details
  const handleViewUser = (user) => {
    setModalOpen(true);
    fetchUserDetails(user._id, user.UID);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    setUserModalMenuAnchor(null);
    setUserDetails(null);
    setEmailEditMode(false);
    setEmailDraft("");
  };

  const handleStartEditEmail = () => {
    if (!userDetails?._id) return;
    setEmailDraft((userDetails.email || "").trim());
    setEmailEditMode(true);
  };

  const handleCancelEditEmail = () => {
    setEmailEditMode(false);
    setEmailDraft("");
  };

  const handleSaveEmail = async () => {
    if (!userDetails?._id) return;
    const nextEmail = (emailDraft || "").trim();
    const currentEmail = (userDetails.email || "").trim();

    if (!nextEmail) {
      showSnackbar("Email is required", "error");
      return;
    }
    // basic email validation; backend remains source of truth
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      showSnackbar("Please enter a valid email address", "error");
      return;
    }
    if (nextEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setEmailEditMode(false);
      setEmailDraft("");
      return;
    }

    try {
      setEmailSubmitting(true);
      const [tradeResponse, networkResponse] = await Promise.all([
        tradeService.updateUserEmail(userDetails.UID, nextEmail),
        networkService.updateUserEmail(userDetails.UID, nextEmail),
      ]);
      if (tradeResponse?.success && networkResponse?.success) {
        showSnackbar(
          tradeResponse?.message ||
            networkResponse?.message ||
            "Email updated successfully",
          "success",
        );
        setUserDetails((p) =>
          p
            ? {
                ...p,
                email: nextEmail,
                isEmailVerified: false,
              }
            : p,
        );
        setEmailEditMode(false);
        setEmailDraft("");
        fetchUsers();
      } else {
        showSnackbar(
          tradeResponse?.message ||
            networkResponse?.message ||
            "Failed to update email",
          "error",
        );
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update email";
      showSnackbar(msg, "error");
    } finally {
      setEmailSubmitting(false);
    }
  };

  // Dummy Deposit: open modal (optionally with user to pre-fill UID)
  const handleOpenDummyDeposit = (user = null) => {
    setDummyFormError(null);
    setDummyForm({
      UID: user?.UID ?? "",
      amount: "",
      note: "",
    });
    setDummyDepositOpen(true);
  };

  // Give Salary: open modal (optionally with user to pre-fill UID)
  const handleOpenSalary = (user = null) => {
    setSalaryFormError(null);
    setSalaryForm({
      UID: user?.UID ?? "",
      salaryAmount: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });
    setSalaryOpen(true);
  };

  const handleCloseDummyDeposit = () => {
    setDummyDepositOpen(false);
    setDummyForm({ UID: "", amount: "", note: "" });
    setDummyFormError(null);
  };

  const handleCloseSalary = () => {
    setSalaryOpen(false);
    setSalaryFormError(null);
  };

  const handleDummyDepositSubmit = async (e) => {
    e.preventDefault();
    setDummyFormError(null);
    const UID = (dummyForm.UID || "").trim();
    const amount = parseFloat(dummyForm.amount);
    const note = (dummyForm.note || "").trim();

    if (!UID) {
      setDummyFormError("User UID is required");
      return;
    }
    if (Number.isNaN(amount) || amount <= 0) {
      setDummyFormError("Amount must be a positive number");
      return;
    }

    try {
      setDummyDepositSubmitting(true);
      const response = await tradeService.dummyDeposit({
        UID,
        amount: Number(amount),
        note: note || undefined,
      });
      if (response?.success) {
        showSnackbar(
          response.message || "Dummy deposit created successfully",
          "success",
        );
        handleCloseDummyDeposit();
        fetchUsers(); // refresh list in case balances are shown
      } else {
        setDummyFormError(
          response?.message || "Failed to create dummy deposit",
        );
        showSnackbar(
          response?.message || "Failed to create dummy deposit",
          "error",
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to create dummy deposit";
      setDummyFormError(msg);
      showSnackbar(msg, "error");
    } finally {
      setDummyDepositSubmitting(false);
    }
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    setSalaryFormError(null);

    const UID = (salaryForm.UID || "").trim();
    const salaryAmount = parseFloat(salaryForm.salaryAmount);
    const date = (salaryForm.date || "").trim();
    const note = (salaryForm.note || "").trim();

    if (!UID) {
      setSalaryFormError("User UID is required");
      return;
    }
    if (Number.isNaN(salaryAmount) || salaryAmount <= 0) {
      setSalaryFormError("Salary amount must be a positive number");
      return;
    }
    // Basic format validation; backend should still validate.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setSalaryFormError("Date must be in YYYY-MM-DD format");
      return;
    }

    try {
      setSalarySubmitting(true);
      const response = await tradeService.giveSalary({
        UID,
        salaryAmount: Number(salaryAmount),
        date,
        note: note || undefined,
      });

      if (response?.success) {
        showSnackbar(
          response.message || "Salary given successfully",
          "success",
        );
        handleCloseSalary();
        fetchUsers();
      } else {
        const msg = response?.message || "Failed to give salary";
        setSalaryFormError(msg);
        showSnackbar(msg, "error");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to give salary";
      setSalaryFormError(msg);
      showSnackbar(msg, "error");
    } finally {
      setSalarySubmitting(false);
    }
  };

  const handleOpenUserStatsModal = () => {
    setUserStatsIncrements({ addTotal: "", addNew: "" });
    setUserStatsFormError(null);
    setOpenUserStatsModal(true);
    fetchUserStats();
  };

  const handleCloseUserStatsModal = () => {
    setOpenUserStatsModal(false);
    setUserStatsFormError(null);
    setUserStatsIncrements({ addTotal: "", addNew: "" });
  };

  const handleUserStatsSubmit = async (e) => {
    e.preventDefault();
    setUserStatsFormError(null);

    const parsedTotal = parseNonNegativeIncrementInput(
      userStatsIncrements.addTotal,
    );
    const parsedNew = parseNonNegativeIncrementInput(
      userStatsIncrements.addNew,
    );

    if (!parsedTotal.valid || !parsedNew.valid) {
      setUserStatsFormError(
        "Use whole numbers only (0 or more). A blank field is sent as 0.",
      );
      return;
    }

    if (parsedTotal.delta === 0 && parsedNew.delta === 0) {
      setUserStatsFormError(
        "Enter a value for total users, new users, or both.",
      );
      return;
    }

    try {
      setUserStatsSubmitting(true);
      const response = await tradeService.updateUserState({
        totalUsers: parsedTotal.delta,
        newUsers: parsedNew.delta,
      });
      if (response?.success) {
        showSnackbar(
          response.message || "User stats updated successfully",
          "success",
        );
        setUserStatsIncrements({ addTotal: "", addNew: "" });
        fetchUserStats();
        fetchUsers();
      } else {
        setUserStatsFormError(
          response?.message || "Failed to update user stats",
        );
        showSnackbar(
          response?.message || "Failed to update user stats",
          "error",
        );
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to update user stats";
      setUserStatsFormError(msg);
      showSnackbar(msg, "error");
    } finally {
      setUserStatsSubmitting(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle header cell click for sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(0); // Reset to first page when sorting changes
  };

  // Get sort icon for a column
  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <Sort sx={{ fontSize: 16, opacity: 0.3 }} />;
    }
    return sortOrder === "asc" ? (
      <ArrowUpward sx={{ fontSize: 16, color: AppColors.GOLD_DARK }} />
    ) : (
      <ArrowDownward sx={{ fontSize: 16, color: AppColors.GOLD_DARK }} />
    );
  };

  // Get status chip
  const getStatusChip = (user) => {
    if (user.isDeleted) {
      return (
        <Chip
          label="Deleted"
          size="small"
          sx={{
            bgcolor: `${AppColors.ERROR}20`,
            color: AppColors.ERROR,
            fontWeight: 600,
          }}
        />
      );
    }
    if (user.isBlocked) {
      return (
        <Chip
          label="Blocked"
          size="small"
          sx={{
            bgcolor: `${AppColors.ERROR}30`,
            color: AppColors.ERROR,
            fontWeight: 600,
          }}
        />
      );
    }
    return (
      <Chip
        label={user.isEmailVerified ? "Active" : "Unverified"}
        size="small"
        sx={{
          bgcolor: user.isEmailVerified
            ? `${AppColors.SUCCESS}20`
            : `${AppColors.ERROR}15`,
          color: user.isEmailVerified ? AppColors.SUCCESS : AppColors.ERROR,
          fontWeight: 600,
        }}
      />
    );
  };

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // Effects
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const incTotalParsed = parseNonNegativeIncrementInput(
    userStatsIncrements.addTotal,
  );
  const incNewParsed = parseNonNegativeIncrementInput(
    userStatsIncrements.addNew,
  );
  const userStatsInputsValid = incTotalParsed.valid && incNewParsed.valid;
  const userStatsHasIncrement =
    incTotalParsed.delta > 0 || incNewParsed.delta > 0;
  const userStatsCanSubmit =
    userStatsInputsValid &&
    userStatsHasIncrement &&
    !userStatsLoading &&
    !userStatsSubmitting;

  return (
    <Box>
      {/* MainHeader */}
      <Box
        sx={{
          mb: { xs: 1, md: 2 },
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: AppColors.TXT_MAIN,
              background: `linear-gradient(45deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Manage Users
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: AppColors.TXT_SUB, mt: 0.5 }}
          >
            View and manage user accounts
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Update />}
            onClick={handleOpenUserStatsModal}
          >
            Update User Stats
          </Button>
          <Button
            className="btn-primary"
            startIcon={<AccountBalanceWallet />}
            onClick={() => handleOpenDummyDeposit()}
          >
            Dummy Deposit
          </Button>
        </Stack>
      </Box>
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
          {/* Search */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by email, name, or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: AppColors.GOLD_DARK }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: AppColors.BG_SECONDARY,
                  borderRadius: 2,
                  "& fieldset": { border: "none" },
                  "& input": { color: AppColors.TXT_MAIN },
                  "& input::placeholder": { color: AppColors.TXT_SUB },
                },
              }}
              size="small"
            />
          </Grid>

          {/* Status Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: AppColors.TXT_SUB }}>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                sx={{
                  backgroundColor: AppColors.BG_SECONDARY,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& .MuiSelect-select": { color: AppColors.TXT_MAIN },
                }}
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: { xs: 1, md: 1.5 } }}>
          <TableContainer>
            <Table
              sx={{
                "& .MuiTableCell-root": {
                  p: { xs: 1, md: 1.5 },
                },
                "& .MuiTableCell-head": {
                  p: { xs: 1, md: 1.5 },
                },
                "& .MuiTableCell-body": {
                  p: { xs: 1, md: 1.5 },
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ backgroundColor: AppColors.BG_SECONDARY }}>
                  <TableCell
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none",
                      "&:hover": {
                        backgroundColor: `${AppColors.GOLD_DARK}10`,
                      },
                    }}
                    onClick={() => handleSort("fullName")}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      Full Name
                      {getSortIcon("fullName")}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none",
                      "&:hover": {
                        backgroundColor: `${AppColors.GOLD_DARK}10`,
                      },
                    }}
                    onClick={() => handleSort("email")}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      Email
                      {getSortIcon("email")}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none",
                      "&:hover": {
                        backgroundColor: `${AppColors.GOLD_DARK}10`,
                      },
                    }}
                    onClick={() => handleSort("UID")}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      UID
                      {getSortIcon("UID")}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none",
                      "&:hover": {
                        backgroundColor: `${AppColors.GOLD_DARK}10`,
                      },
                    }}
                    onClick={() => handleSort("createdAt")}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      Created
                      {getSortIcon("createdAt")}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}
                    align="center"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: { xs: 1, md: 1.5 } }}
                    >
                      <BTLoader />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: { xs: 1, md: 1.5 }, color: AppColors.TXT_SUB }}
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user._id}
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: `${AppColors.GOLD_DARK}05`,
                        },
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: AppColors.GOLD_DARK,
                              width: { xs: 25, md: 30 },
                              height: { xs: 25, md: 30 },
                            }}
                          >
                            {(user.fullName ||
                              user.email)?.[0]?.toUpperCase() || "U"}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: AppColors.TXT_MAIN,
                                fontWeight: 500,
                              }}
                            >
                              {user.fullName || "No Name"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}
                        >
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          onClick={() => navigate(`/manage-users/${user._id}`)}
                          sx={{
                            color: AppColors.GOLD_DARK,
                            fontFamily: "monospace",
                            fontWeight: 600,
                            cursor: "pointer",
                            "&:hover": {
                              textDecoration: "underline",
                              color: AppColors.GOLD_DARK,
                            },
                          }}
                        >
                          {user.UID}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(user)}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: AppColors.TXT_SUB }}
                        >
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="center"
                          flexWrap="wrap"
                        >
                          <Tooltip title="View and edit Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewUser(user)}
                              sx={{
                                color: AppColors.GOLD_DARK,
                                "&:hover": {
                                  backgroundColor: `${AppColors.GOLD_DARK}20`,
                                },
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Give Salary">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenSalary(user)}
                              sx={{
                                color: AppColors.GOLD_DARK,
                                "&:hover": {
                                  backgroundColor: `${AppColors.GOLD_DARK}20`,
                                },
                              }}
                            >
                              <Paid fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Dummy Deposit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDummyDeposit(user)}
                              sx={{
                                color: AppColors.GOLD_DARK,
                                "&:hover": {
                                  backgroundColor: `${AppColors.GOLD_DARK}20`,
                                },
                              }}
                            >
                              <AccountBalanceWallet fontSize="small" />
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

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: `1px solid ${AppColors.BG_SECONDARY}`,
              backgroundColor: AppColors.BG_CARD,
              "& .MuiTablePagination-toolbar": {
                color: AppColors.TXT_MAIN,
              },
              "& .MuiTablePagination-select": {
                color: AppColors.TXT_MAIN,
              },
              "& .MuiTablePagination-actions button": {
                color: AppColors.GOLD_DARK,
              },
            }}
          />
        </Box>
      </Paper>

      {/* User Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 1, md: 1.5 },
        }}
      >
        <Card
          sx={{
            backgroundColor: AppColors.BG_CARD,
            border: `1px solid ${AppColors.BG_SECONDARY}`,
            borderRadius: 3,
            maxWidth: { xs: "100%", md: 800 },
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          }}
        >
          <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
            {/* Modal MainHeader */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: AppColors.GOLD_DARK,
                    fontWeight: 700,
                  }}
                >
                  User Details
                </Typography>
                {userDetails && (
                  <>
                    <Tooltip title="More actions">
                      <span>
                        <IconButton
                          size="small"
                          onClick={(e) =>
                            setUserModalMenuAnchor(e.currentTarget)
                          }
                          disabled={modalLoading || userDetails.isDeleted}
                          sx={{ color: AppColors.TXT_SUB }}
                        >
                          <MoreVert />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Menu
                      anchorEl={userModalMenuAnchor}
                      open={Boolean(userModalMenuAnchor)}
                      onClose={() => setUserModalMenuAnchor(null)}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      slotProps={{
                        paper: {
                          sx: {
                            border: `1px solid ${AppColors.BG_SECONDARY}`,
                            bgcolor: AppColors.BG_CARD,
                          },
                        },
                      }}
                    >
                      <ActionMenuItem
                        onClick={() => {
                          setUserModalMenuAnchor(null);
                          updateUserStatus(userDetails.UID, {
                            isBlocked: !userDetails.isBlocked,
                          });
                        }}
                        disabled={actionLoading || userDetails.isDeleted}
                        sx={{
                          color: userDetails.isBlocked
                            ? AppColors.SUCCESS
                            : AppColors.ERROR,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {userDetails.isBlocked ? (
                            <Check
                              fontSize="small"
                              sx={{ color: AppColors.SUCCESS }}
                            />
                          ) : (
                            <Block
                              fontSize="small"
                              sx={{ color: AppColors.ERROR }}
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            userDetails.isBlocked
                              ? "Unblock User"
                              : "Block User"
                          }
                          slotProps={{
                            primary: {
                              sx: {
                                fontWeight: 600,
                                fontSize: FONT_SIZE.BODY,
                              },
                            },
                          }}
                        />
                      </ActionMenuItem>
                    </Menu>
                    {actionLoading && <CircularProgress size={20} />}
                  </>
                )}
              </Box>
              <IconButton
                onClick={handleModalClose}
                sx={{
                  color: AppColors.TXT_SUB,
                  "&:hover": {
                    backgroundColor: `${AppColors.ERROR}20`,
                    color: AppColors.ERROR,
                  },
                }}
              >
                <Close />
              </IconButton>
            </Box>

            {modalLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <BTLoader />
              </Box>
            ) : userDetails ? (
              <>
                {/* User Info */}
                <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      mb: { xs: 1, md: 1.5 },
                    }}
                  >
                    Basic Information
                  </Typography>
                  <Grid container spacing={{ xs: 1, md: 1.5 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserInfoItem
                        label="Name"
                        value={userDetails.fullName || "Not provided"}
                        icon={<Person />}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserEmailItem
                        label="Email"
                        value={userDetails.email}
                        icon={<Person />}
                        editable
                        editing={emailEditMode}
                        draft={emailDraft}
                        onEdit={handleStartEditEmail}
                        onDraftChange={setEmailDraft}
                        onCancel={handleCancelEditEmail}
                        onSave={handleSaveEmail}
                        saving={emailSubmitting}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserInfoItem
                        label="UID"
                        value={userDetails.UID}
                        highlight={true}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserInfoItem
                        label="Status"
                        value={getStatusChip(userDetails)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserInfoItem
                        label="Email Verified"
                        value={
                          <Chip
                            label={userDetails.isEmailVerified ? "Yes" : "No"}
                            size="small"
                            sx={{
                              bgcolor: userDetails.isEmailVerified
                                ? `${AppColors.SUCCESS}20`
                                : `${AppColors.ERROR}20`,
                              color: userDetails.isEmailVerified
                                ? AppColors.SUCCESS
                                : AppColors.ERROR,
                              fontWeight: 600,
                            }}
                          />
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserInfoItem
                        label="2FA Enabled"
                        value={
                          <Chip
                            label={userDetails.twoFactorEnabled ? "Yes" : "No"}
                            size="small"
                            sx={{
                              bgcolor: userDetails.twoFactorEnabled
                                ? `${AppColors.SUCCESS}20`
                                : `${AppColors.ERROR}20`,
                              color: userDetails.twoFactorEnabled
                                ? AppColors.SUCCESS
                                : AppColors.ERROR,
                              fontWeight: 600,
                            }}
                          />
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Balances */}
                <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      mb: { xs: 1, md: 1.5 },
                    }}
                  >
                    Account Balance
                  </Typography>
                  <Grid container spacing={{ xs: 1, md: 1.5 }}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Total Balance"
                        value={`$${userDetails.Balance?.toLocaleString() || "0"}`}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Winning Balance"
                        value={`$${userDetails.winningBalance?.toLocaleString() || "0"}`}
                        color={AppColors.SUCCESS}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Withdrawable"
                        value={`$${userDetails.withdrawableWinnings?.toLocaleString() || "0"}`}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Lock Balance"
                        value={`$${userDetails.lockBalance?.toLocaleString() || "0"}`}
                        color={AppColors.TXT_SUB}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Income & Trading */}
                <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      mb: { xs: 1, md: 1.5 },
                    }}
                  >
                    Income & Trading Statistics
                  </Typography>
                  <Grid container spacing={{ xs: 1, md: 1.5 }}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Referral Income"
                        value={`$${userDetails.referralIncome?.toLocaleString() || "0"}`}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Level Income"
                        value={`$${userDetails.levelIncome?.toLocaleString() || "0"}`}
                        color={AppColors.SUCCESS}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Working Income"
                        value={`$${userDetails.totalWorkingIncome?.toLocaleString() || "0"}`}
                        color={AppColors.SUCCESS}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Total Deposited"
                        value={`$${userDetails.totalDeposited?.toLocaleString() || "0"}`}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Trade Volume"
                        value={`$${userDetails.totalTradedVolume?.toLocaleString() || "0"}`}
                        color={AppColors.SUCCESS}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Referrals"
                        value={userDetails.referrals?.length || "0"}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography sx={{ color: AppColors.TXT_SUB }}>
                  Failed to load user details
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Modal>

      {/* Give Salary Modal */}
      <Modal
        open={salaryOpen}
        onClose={handleCloseSalary}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 1, md: 2 },
        }}
      >
        <Card
          sx={{
            backgroundColor: AppColors.BG_CARD,
            border: `1px solid ${AppColors.BG_SECONDARY}`,
            borderRadius: 3,
            maxWidth: 440,
            width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: `${AppColors.GOLD_DARK}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Paid sx={{ color: AppColors.GOLD_DARK, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: AppColors.TXT_MAIN, fontWeight: 700 }}
                  >
                    Give Salary
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: AppColors.TXT_SUB }}
                  >
                    Give salary to a user (admin)
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleCloseSalary}
                size="small"
                sx={{
                  color: AppColors.TXT_SUB,
                  "&:hover": {
                    backgroundColor: `${AppColors.ERROR}20`,
                    color: AppColors.ERROR,
                  },
                }}
              >
                <Close />
              </IconButton>
            </Box>

            <Box
              component="form"
              onSubmit={handleSalarySubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {salaryFormError && (
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.ERROR,
                    bgcolor: `${AppColors.ERROR}14`,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                  }}
                >
                  {salaryFormError}
                </Typography>
              )}

              <TextField
                fullWidth
                required
                label="User UID"
                placeholder="e.g. EXTRADE000370"
                value={salaryForm.UID}
                disabled
                onChange={(e) =>
                  setSalaryForm((p) => ({ ...p, UID: e.target.value }))
                }
                InputProps={{
                  sx: {
                    bgcolor: AppColors.BG_SECONDARY,
                    borderRadius: 2,
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: AppColors.GOLD_DARK },
                    "&.Mui-focused fieldset": {
                      borderColor: AppColors.GOLD_DARK,
                    },
                    "& input": { color: AppColors.TXT_MAIN },
                  },
                }}
                InputLabelProps={{ sx: { color: AppColors.TXT_SUB } }}
              />

              <TextField
                fullWidth
                required
                label="Salary Amount"
                type="number"
                inputProps={{ min: 0.01, step: 0.01 }}
                placeholder="0.00"
                value={salaryForm.salaryAmount}
                onChange={(e) =>
                  setSalaryForm((p) => ({ ...p, salaryAmount: e.target.value }))
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ color: AppColors.TXT_SUB }}
                    >
                      $
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: AppColors.BG_SECONDARY,
                    borderRadius: 2,
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: AppColors.GOLD_DARK },
                    "&.Mui-focused fieldset": {
                      borderColor: AppColors.GOLD_DARK,
                    },
                    "& input": { color: AppColors.TXT_MAIN },
                  },
                }}
                InputLabelProps={{ sx: { color: AppColors.TXT_SUB } }}
              />

              <DatePicker
                label="Date"
                value={salaryForm.date}
                onChange={(value) =>
                  setSalaryForm((p) => ({ ...p, date: value }))
                }
                sx={{
                  bgcolor: AppColors.BG_SECONDARY,
                  borderRadius: 2,
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": { borderColor: AppColors.GOLD_DARK },
                  "&.Mui-focused fieldset": {
                    borderColor: AppColors.GOLD_DARK,
                  },
                  "& input": { color: AppColors.TXT_MAIN },
                  "& label": { color: AppColors.TXT_SUB },
                  "& label.Mui-focused": { color: AppColors.GOLD_DARK },
                  "& .MuiSvgIcon-root": { color: AppColors.TXT_SUB },
                }}
              />

              <TextField
                fullWidth
                label="Note (optional)"
                placeholder="e.g. given by admin"
                value={salaryForm.note}
                onChange={(e) =>
                  setSalaryForm((p) => ({ ...p, note: e.target.value }))
                }
                multiline
                rows={2}
                InputProps={{
                  sx: {
                    bgcolor: AppColors.BG_SECONDARY,
                    borderRadius: 2,
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: AppColors.GOLD_DARK },
                    "&.Mui-focused fieldset": {
                      borderColor: AppColors.GOLD_DARK,
                    },
                    "& textarea": { color: AppColors.TXT_MAIN },
                  },
                }}
                InputLabelProps={{ sx: { color: AppColors.TXT_SUB } }}
              />

              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCloseSalary}
                  disabled={salarySubmitting}
                  sx={{
                    borderColor: AppColors.BG_SECONDARY,
                    color: AppColors.TXT_MAIN,
                    "&:hover": {
                      borderColor: AppColors.TXT_SUB,
                      bgcolor: `${AppColors.TXT_SUB}10`,
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  className="btn-primary"
                  type="submit"
                  disabled={salarySubmitting}
                >
                  {salarySubmitting ? (
                    <CircularProgress size={22} sx={{ color: "inherit" }} />
                  ) : (
                    "Confirm Salary"
                  )}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Modal>

      {/* Dummy Deposit Modal */}
      <Modal
        open={dummyDepositOpen}
        onClose={handleCloseDummyDeposit}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 1, md: 2 },
        }}
      >
        <Card
          sx={{
            backgroundColor: AppColors.BG_CARD,
            border: `1px solid ${AppColors.BG_SECONDARY}`,
            borderRadius: 3,
            maxWidth: 440,
            width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: `${AppColors.GOLD_DARK}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AccountBalanceWallet
                    sx={{ color: AppColors.GOLD_DARK, fontSize: 24 }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: AppColors.TXT_MAIN, fontWeight: 700 }}
                  >
                    Dummy Deposit
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: AppColors.TXT_SUB }}
                  >
                    Credit balance for a user (admin)
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleCloseDummyDeposit}
                size="small"
                sx={{
                  color: AppColors.TXT_SUB,
                  "&:hover": {
                    backgroundColor: `${AppColors.ERROR}20`,
                    color: AppColors.ERROR,
                  },
                }}
              >
                <Close />
              </IconButton>
            </Box>

            <Box
              component="form"
              onSubmit={handleDummyDepositSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {dummyFormError && (
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.ERROR,
                    bgcolor: `${AppColors.ERROR}14`,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                  }}
                >
                  {dummyFormError}
                </Typography>
              )}

              <TextField
                fullWidth
                required
                label="User UID"
                placeholder="e.g. EXTRADE000369"
                value={dummyForm.UID}
                onChange={(e) =>
                  setDummyForm((p) => ({ ...p, UID: e.target.value }))
                }
                InputProps={{
                  sx: {
                    bgcolor: AppColors.BG_SECONDARY,
                    borderRadius: 2,
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: AppColors.GOLD_DARK },
                    "&.Mui-focused fieldset": {
                      borderColor: AppColors.GOLD_DARK,
                    },
                    "& input": { color: AppColors.TXT_MAIN },
                  },
                }}
                InputLabelProps={{ sx: { color: AppColors.TXT_SUB } }}
              />

              <TextField
                fullWidth
                required
                label="Amount"
                type="number"
                inputProps={{ min: 0.01, step: 0.01 }}
                placeholder="0.00"
                value={dummyForm.amount}
                onChange={(e) =>
                  setDummyForm((p) => ({ ...p, amount: e.target.value }))
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ color: AppColors.TXT_SUB }}
                    >
                      $
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: AppColors.BG_SECONDARY,
                    borderRadius: 2,
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: AppColors.GOLD_DARK },
                    "&.Mui-focused fieldset": {
                      borderColor: AppColors.GOLD_DARK,
                    },
                    "& input": { color: AppColors.TXT_MAIN },
                  },
                }}
                InputLabelProps={{ sx: { color: AppColors.TXT_SUB } }}
              />

              <TextField
                fullWidth
                label="Note (optional)"
                placeholder="e.g. Bonus credit"
                value={dummyForm.note}
                onChange={(e) =>
                  setDummyForm((p) => ({ ...p, note: e.target.value }))
                }
                multiline
                rows={2}
                InputProps={{
                  sx: {
                    bgcolor: AppColors.BG_SECONDARY,
                    borderRadius: 2,
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: AppColors.GOLD_DARK },
                    "&.Mui-focused fieldset": {
                      borderColor: AppColors.GOLD_DARK,
                    },
                    "& textarea": { color: AppColors.TXT_MAIN },
                  },
                }}
                InputLabelProps={{ sx: { color: AppColors.TXT_SUB } }}
              />

              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCloseDummyDeposit}
                  disabled={dummyDepositSubmitting}
                  sx={{
                    borderColor: AppColors.BG_SECONDARY,
                    color: AppColors.TXT_MAIN,
                    "&:hover": {
                      borderColor: AppColors.TXT_SUB,
                      bgcolor: `${AppColors.TXT_SUB}10`,
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  className="btn-primary"
                  type="submit"
                  disabled={dummyDepositSubmitting}
                >
                  {dummyDepositSubmitting ? (
                    <CircularProgress size={22} sx={{ color: "inherit" }} />
                  ) : (
                    "Confirm Deposit"
                  )}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Modal>

      {/* Update User Stats Modal */}
      <Modal
        open={openUserStatsModal}
        onClose={handleCloseUserStatsModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 1, md: 2 },
        }}
      >
        <Card
          sx={{
            backgroundColor: AppColors.BG_CARD,
            border: `1px solid ${AppColors.BG_SECONDARY}`,
            borderRadius: 3,
            maxWidth: 480,
            width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: `${AppColors.GOLD_DARK}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Update sx={{ color: AppColors.GOLD_DARK, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    component="h2"
                    variant="h6"
                    sx={{ color: AppColors.TXT_MAIN, fontWeight: 700 }}
                  >
                    Update User Stats
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: AppColors.TXT_SUB }}
                  >
                    Current counts are read-only. Enter the values to send to
                    the server (one or both).
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleCloseUserStatsModal}
                size="small"
                sx={{
                  color: AppColors.TXT_SUB,
                  "&:hover": {
                    backgroundColor: `${AppColors.ERROR}20`,
                    color: AppColors.ERROR,
                  },
                }}
                aria-label="Close"
              >
                <Close />
              </IconButton>
            </Box>

            <Box
              component="form"
              onSubmit={handleUserStatsSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {userStatsFormError && (
                <Typography
                  variant="caption"
                  sx={{
                    color: AppColors.ERROR,
                    bgcolor: `${AppColors.ERROR}14`,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                  }}
                >
                  {userStatsFormError}
                </Typography>
              )}

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: `${AppColors.BG_SECONDARY}80`,
                  border: `1px solid ${AppColors.BG_SECONDARY}`,
                }}
              >
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: AppColors.TXT_SUB }}
                    >
                      Total users
                    </Typography>
                    {userStatsLoading ? (
                      <CircularProgress
                        size={18}
                        sx={{ color: AppColors.GOLD_DARK }}
                      />
                    ) : (
                      <Typography
                        variant="h6"
                        sx={{ color: AppColors.TXT_MAIN, fontWeight: 700 }}
                      >
                        {userStatsDisplay.totalUsers.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: AppColors.TXT_SUB }}
                    >
                      New users
                    </Typography>
                    {userStatsLoading ? (
                      <CircularProgress
                        size={18}
                        sx={{ color: AppColors.GOLD_DARK }}
                      />
                    ) : (
                      <Typography
                        variant="h6"
                        sx={{ color: AppColors.TXT_MAIN, fontWeight: 700 }}
                      >
                        {userStatsDisplay.newUsers.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: AppColors.TXT_SUB, fontWeight: 600, mb: 0.5 }}
                >
                  Total users
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={userStatsIncrements.addTotal}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d+$/.test(v)) {
                      setUserStatsIncrements((p) => ({ ...p, addTotal: v }));
                    }
                  }}
                  disabled={userStatsLoading || userStatsSubmitting}
                  error={
                    userStatsIncrements.addTotal !== "" && !incTotalParsed.valid
                  }
                  InputProps={{
                    sx: {
                      bgcolor: AppColors.BG_SECONDARY,
                      borderRadius: 2,
                      "& fieldset": { borderColor: "transparent" },
                      "&:hover fieldset": { borderColor: AppColors.GOLD_DARK },
                      "&.Mui-focused fieldset": {
                        borderColor: AppColors.GOLD_DARK,
                      },
                      "& input": { color: AppColors.TXT_MAIN },
                    },
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: AppColors.TXT_SUB, fontWeight: 600, mb: 0.5 }}
                >
                  New users
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={userStatsIncrements.addNew}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d+$/.test(v)) {
                      setUserStatsIncrements((p) => ({ ...p, addNew: v }));
                    }
                  }}
                  disabled={userStatsLoading || userStatsSubmitting}
                  error={
                    userStatsIncrements.addNew !== "" && !incNewParsed.valid
                  }
                  InputProps={{
                    sx: {
                      bgcolor: AppColors.BG_SECONDARY,
                      borderRadius: 2,
                      "& fieldset": { borderColor: "transparent" },
                      "&:hover fieldset": { borderColor: AppColors.GOLD_DARK },
                      "&.Mui-focused fieldset": {
                        borderColor: AppColors.GOLD_DARK,
                      },
                      "& input": { color: AppColors.TXT_MAIN },
                    },
                  }}
                />
              </Box>
              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCloseUserStatsModal}
                  disabled={userStatsSubmitting}
                  sx={{
                    borderColor: AppColors.BG_SECONDARY,
                    color: AppColors.TXT_MAIN,
                    "&:hover": {
                      borderColor: AppColors.TXT_SUB,
                      bgcolor: `${AppColors.TXT_SUB}10`,
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  className="btn-primary"
                  type="submit"
                  disabled={!userStatsCanSubmit}
                >
                  {userStatsSubmitting ? (
                    <CircularProgress size={22} sx={{ color: "inherit" }} />
                  ) : (
                    "Apply update"
                  )}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Modal>
    </Box>
  );
};

// User Info Item Component
const UserInfoItem = ({ label, value, icon, highlight = false }) => (
  <Box
    sx={{
      p: { xs: 1, md: 1.5 },
      backgroundColor: AppColors.BG_SECONDARY,
      borderRadius: 2,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      {icon && <Box sx={{ color: AppColors.GOLD_DARK }}>{icon}</Box>}
      <Typography
        variant="caption"
        sx={{ color: AppColors.TXT_SUB, textTransform: "uppercase" }}
      >
        {label}
      </Typography>
    </Box>
    <Typography
      variant="body2"
      component="div"
      sx={{
        color: highlight ? AppColors.GOLD_DARK : AppColors.TXT_MAIN,
        fontWeight: highlight ? 600 : 400,
        fontFamily: highlight ? "monospace" : "inherit",
      }}
    >
      {typeof value === "string" ? value : value}
    </Typography>
  </Box>
);

const UserEmailItem = ({
  label,
  value,
  icon,
  highlight = false,
  editable = false,
  editing = false,
  draft = "",
  onEdit,
  onDraftChange,
  onCancel,
  onSave,
  saving = false,
}) => (
  <Box
    sx={{
      p: { xs: 1, md: 1.5 },
      backgroundColor: AppColors.BG_SECONDARY,
      borderRadius: 2,
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        mb: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon && <Box sx={{ color: AppColors.GOLD_DARK }}>{icon}</Box>}
        <Typography
          variant="caption"
          sx={{ color: AppColors.TXT_SUB, textTransform: "uppercase" }}
        >
          {label}
        </Typography>
      </Box>

      {editable && !editing && (
        <IconButton
          size="small"
          onClick={onEdit}
          sx={{
            color: AppColors.GOLD_DARK,
            "&:hover": { backgroundColor: `${AppColors.GOLD_DARK}20` },
          }}
        >
          <Edit fontSize="small" />
        </IconButton>
      )}
    </Box>

    {editable && editing ? (
      <TextField
        variant="standard"
        fullWidth
        autoFocus
        value={draft}
        disabled={saving}
        onChange={(e) => onDraftChange?.(e.target.value)}
        placeholder="user@example.com"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" sx={{ gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={onCancel}
                disabled={saving}
                sx={{
                  color: AppColors.TXT_SUB,
                  "&:hover": {
                    backgroundColor: `${AppColors.ERROR}20`,
                    color: AppColors.ERROR,
                  },
                }}
              >
                <Close fontSize="small" sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={onSave}
                disabled={saving}
                sx={{
                  color: AppColors.SUCCESS,
                  "&:hover": { backgroundColor: `${AppColors.SUCCESS}20` },
                }}
              >
                {saving ? (
                  <CircularProgress size={16} sx={{ color: "inherit" }} />
                ) : (
                  <Check fontSize="small" sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            bgcolor: "transparent",
            borderRadius: 0,
            "& fieldset": { borderColor: "none" },
            "&:hover fieldset": { borderColor: "none" },
            "&.Mui-focused fieldset": {
              borderColor: "none",
            },
            "& input": {
              color: AppColors.TXT_MAIN,
              p: 0,
              fontSize: FONT_SIZE.CAPTION,
            },
          },
        }}
      />
    ) : (
      <Typography
        variant="body2"
        component="div"
        sx={{
          color: highlight ? AppColors.GOLD_DARK : AppColors.TXT_MAIN,
          fontWeight: highlight ? 600 : 400,
          fontFamily: highlight ? "monospace" : "inherit",
          wordBreak: "break-word",
        }}
      >
        {typeof value === "string" ? value : value}
      </Typography>
    )}
  </Box>
);

// Balance Card Component
const BalanceCard = ({ label, value, color }) => (
  <Box
    sx={{
      p: { xs: 1, md: 1.5 },
      backgroundColor: AppColors.BG_SECONDARY,
      borderRadius: 2,
      textAlign: "center",
    }}
  >
    <Typography
      variant="h6"
      sx={{
        color: color,
        fontWeight: 700,
        mb: 0.5,
      }}
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: AppColors.TXT_SUB,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {label}
    </Typography>
  </Box>
);

export default ManageUsers;
