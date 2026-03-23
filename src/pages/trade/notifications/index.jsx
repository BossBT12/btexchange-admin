import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Delete,
  Refresh,
  NotificationsNoneOutlined,
  Link as LinkIcon,
} from '@mui/icons-material';
import { AppColors } from '../../../constant/appColors';
import useSnackbar from '../../../hooks/useSnackbar';
import tradeService from '../../../services/tradeService';
import dayjs from 'dayjs';
import BTLoader from '../../../components/Loader';

const NotificationsPage = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [form, setForm] = useState({
    title: '',
    message: '',
    link: '',
    isActive: true,
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (activeFilter === 'true') params.isActive = 'true';
      if (activeFilter === 'false') params.isActive = 'false';
      const response = await tradeService.getNotifications(params);
      if (response?.success && response?.data) {
        setNotifications(response.data.notifications || []);
        setTotal(response.data.pagination?.total ?? 0);
      } else {
        showSnackbar('Failed to load notifications', 'error');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      showSnackbar(err?.message || err?.data?.message || 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, rowsPerPage, activeFilter]);

  const handleCreateOpen = () => {
    setForm({ title: '', message: '', link: '', isActive: true });
    setCreateOpen(true);
  };

  const handleCreateClose = () => setCreateOpen(false);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      showSnackbar('Title is required', 'error');
      return;
    }
    if (!form.message?.trim()) {
      showSnackbar('Message is required', 'error');
      return;
    }
    try {
      setCreateLoading(true);
      const response = await tradeService.createNotification({
        title: form.title.trim(),
        message: form.message.trim(),
        link: form.link?.trim() || undefined,
        isActive: form.isActive,
      });
      if (response?.success) {
        showSnackbar(response.message || 'Notification created', 'success');
        handleCreateClose();
        fetchNotifications();
      } else {
        showSnackbar(response?.message || 'Failed to create notification', 'error');
      }
    } catch (err) {
      showSnackbar(err?.message || err?.data?.message || 'Failed to create notification', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleteLoading(id);
      const response = await tradeService.deleteNotification(id);
      if (response?.success) {
        showSnackbar(response.message || 'Notification deleted', 'success');
        fetchNotifications();
      } else {
        showSnackbar(response?.message || 'Failed to delete', 'error');
      }
    } catch (err) {
      showSnackbar(err?.message || err?.data?.message || 'Failed to delete', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleOpenDeleteConfirm = (notification) => {
    setNotificationToDelete(notification);
    setConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    if (deleteLoading) return;
    setConfirmOpen(false);
    setNotificationToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!notificationToDelete?._id) return;
    await handleDelete(notificationToDelete._id);
    setConfirmOpen(false);
    setNotificationToDelete(null);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

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
          Notifications
        </Typography>
        <Typography variant="body1" sx={{ color: AppColors.TXT_SUB, fontWeight: 400 }}>
          Create and manage notifications shown to users. You can set title, message, optional
          link, and active status.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderBottom: `1px solid ${AppColors.BG_SECONDARY}`,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ color: AppColors.TXT_SUB }}>Status</InputLabel>
            <Select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              label="Status"
              sx={{
                backgroundColor: AppColors.BG_SECONDARY,
                color: AppColors.TXT_MAIN,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchNotifications}
              disabled={loading}
              sx={{ color: AppColors.GOLD_DARK }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            className="btn-primary"
            startIcon={<Add />}
            onClick={handleCreateOpen}
            sx={{ ml: 'auto' }}
          >
            Create notification
          </Button>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 560 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: AppColors.BG_SECONDARY }}>
                <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                  Title
                </TableCell>
                <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                  Message
                </TableCell>
                <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                  Link
                </TableCell>
                <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                  Created
                </TableCell>
                <TableCell align="right" sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <BTLoader />
                  </TableCell>
                </TableRow>
              ) : notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: AppColors.TXT_SUB }}>
                    No notifications found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((n) => (
                  <TableRow
                    key={n._id}
                    sx={{
                      '&:hover': { backgroundColor: `${AppColors.GOLD_DARK}08` },
                      borderBottom: `1px solid ${AppColors.BG_SECONDARY}`,
                    }}
                  >
                    <TableCell sx={{ color: AppColors.TXT_MAIN, maxWidth: 180 }}>
                      <Typography noWrap title={n.title}>
                        {n.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: AppColors.TXT_SUB, maxWidth: 240 }}>
                      <Typography noWrap title={n.message} variant="body2">
                        {n.message}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: AppColors.TXT_SUB }}>
                      {n.link ? (
                        <Tooltip title={n.link}>
                          <Chip
                            size="small"
                            icon={<LinkIcon sx={{ fontSize: 16 }} />}
                            label="Link"
                            sx={{
                              bgcolor: `${AppColors.GOLD_DARK}20`,
                              color: AppColors.GOLD_DARK,
                              '& .MuiChip-icon': { color: AppColors.GOLD_DARK },
                              cursor: 'pointer',
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={n.isActive ? 'Active' : 'Inactive'}
                        sx={{
                          bgcolor: n.isActive ? `${AppColors.SUCCESS}20` : `${AppColors.ERROR}14`,
                          color: n.isActive ? AppColors.SUCCESS : AppColors.ERROR,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: AppColors.TXT_SUB, whiteSpace: 'nowrap' }}>
                      {n.createdAt
                        ? dayjs(n.createdAt).format('MMM D, YYYY HH:mm')
                        : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteConfirm(n)}
                          disabled={deleteLoading === n._id}
                          sx={{ color: AppColors.ERROR }}
                        >
                          {deleteLoading === n._id ? (
                            <CircularProgress size={20} sx={{ color: AppColors.ERROR }} />
                          ) : (
                            <Delete />
                          )}
                        </IconButton>
                      </Tooltip>
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
          rowsPerPageOptions={[10, 20, 50]}
          sx={{
            color: AppColors.TXT_SUB,
            borderTop: `1px solid ${AppColors.BG_SECONDARY}`,
            '& .MuiTablePagination-selectIcon': { color: AppColors.TXT_SUB },
          }}
        />
      </Paper>

      <Dialog
        open={createOpen}
        onClose={handleCreateClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: AppColors.BG_CARD,
            border: `1px solid ${AppColors.BG_SECONDARY}`,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: AppColors.TXT_MAIN, display: 'flex', alignItems: 'center', gap: 1, pb: 2, px: 2 }}>
          <NotificationsNoneOutlined sx={{ color: AppColors.GOLD_DARK }} />
          Create notification
        </DialogTitle>
        <form onSubmit={handleCreateSubmit}>
          <DialogContent sx={{ p: 0, pt: 0.75, px: 2 }}>
            <TextField
              fullWidth
              required
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: AppColors.BG_SECONDARY,
                  '& fieldset': { borderColor: AppColors.BG_SECONDARY },
                  '&:hover fieldset': { borderColor: AppColors.GOLD_DARK },
                },
                '& label': { color: AppColors.TXT_SUB },
                '& input': { color: AppColors.TXT_MAIN },
              }}
            />
            <TextField
              fullWidth
              required
              label="Message"
              multiline
              rows={3}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: AppColors.BG_SECONDARY,
                  '& fieldset': { borderColor: AppColors.BG_SECONDARY },
                  '&:hover fieldset': { borderColor: AppColors.GOLD_DARK },
                },
                '& label': { color: AppColors.TXT_SUB },
                '& textarea': { color: AppColors.TXT_MAIN },
              }}
            />
            <TextField
              fullWidth
              label="Link (optional)"
              placeholder="https://..."
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: AppColors.BG_SECONDARY,
                  '& fieldset': { borderColor: AppColors.BG_SECONDARY },
                  '&:hover fieldset': { borderColor: AppColors.GOLD_DARK },
                },
                '& label': { color: AppColors.TXT_SUB },
                '& input': { color: AppColors.TXT_MAIN },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  sx={{ color: AppColors.GOLD_DARK, '&.Mui-checked': { color: AppColors.GOLD_DARK } }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: AppColors.TXT_MAIN }}>
                  Active (visible to users)
                </Typography>
              }
            />
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
            <Button onClick={handleCreateClose} sx={{ color: AppColors.TXT_SUB }}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={createLoading}
            >
              {createLoading ? (
                <>
                  <CircularProgress size={20} sx={{ color: 'inherit', mr: 1 }} />
                  Creating…
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={handleCloseDeleteConfirm}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: AppColors.BG_CARD,
            border: `1px solid ${AppColors.BG_SECONDARY}`,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: AppColors.TXT_MAIN }}>
          Delete notification?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
            Are you sure you want to permanently delete
            {' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}
            >
              {notificationToDelete?.title || 'this notification'}
            </Typography>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleCloseDeleteConfirm} sx={{ color: AppColors.TXT_SUB }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={deleteLoading === notificationToDelete?._id}
            sx={{
              color: AppColors.BG_MAIN,
              backgroundColor: AppColors.ERROR,
              '&:hover': { backgroundColor: '#ff6666' },
            }}
          >
            {deleteLoading === notificationToDelete?._id ? (
              <>
                <CircularProgress size={20} sx={{ color: 'inherit', mr: 1 }} />
                Deleting…
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationsPage;
