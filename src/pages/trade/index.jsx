import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const mockTrades = [
  {
    id: "T-1001",
    user: "Alice Johnson",
    pair: "BTC/USDT",
    side: "buy",
    amount: 0.45,
    price: 42000,
    status: "filled",
    createdAt: "2024-06-01 12:15",
  },
  {
    id: "T-1002",
    user: "Bob Smith",
    pair: "ETH/USDT",
    side: "sell",
    amount: 5.2,
    price: 3100,
    status: "partial",
    createdAt: "2024-06-01 12:45",
  },
  {
    id: "T-1003",
    user: "Carol Lee",
    pair: "SOL/USDT",
    side: "buy",
    amount: 100,
    price: 160,
    status: "open",
    createdAt: "2024-06-01 13:05",
  },
];

const ManageTradePage = () => {
  const theme = useTheme();

  const getSideColor = (side) => {
    return side === "buy"
      ? { bgcolor: theme.palette.success.main + "1A", color: theme.palette.success.main }
      : { bgcolor: theme.palette.error.main + "1A", color: theme.palette.error.main };
  };

  const getStatusColor = (status) => {
    if (status === "filled") {
      return { bgcolor: theme.palette.success.main + "1A", color: theme.palette.success.main };
    } else if (status === "open") {
      return { bgcolor: theme.palette.primary.main + "1A", color: theme.palette.primary.main };
    } else {
      return { bgcolor: theme.palette.primary.light + "1A", color: theme.palette.primary.light };
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: { sm: "space-between" }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
            Manage Trade
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Monitor and review user trades. Extend this screen with filters and
            actions once your admin trade APIs are ready.
          </Typography>
        </Box>
      </Box>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 500, color: theme.palette.text.secondary }}>
                  Trade ID
                </TableCell>
                <TableCell sx={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 500, color: theme.palette.text.secondary }}>
                  User
                </TableCell>
                <TableCell sx={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 500, color: theme.palette.text.secondary }}>
                  Pair
                </TableCell>
                <TableCell sx={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 500, color: theme.palette.text.secondary }}>
                  Side
                </TableCell>
                <TableCell align="right" sx={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 500, color: theme.palette.text.secondary }}>
                  Amount
                </TableCell>
                <TableCell align="right" sx={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 500, color: theme.palette.text.secondary }}>
                  Price
                </TableCell>
                <TableCell sx={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 500, color: theme.palette.text.secondary }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 500, color: theme.palette.text.secondary }}>
                  Created
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockTrades.map((trade) => (
                <TableRow key={trade.id} hover>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {trade.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {trade.user}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>
                      {trade.pair}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={trade.side.toUpperCase()}
                      size="small"
                      sx={{
                        fontSize: "0.6875rem",
                        height: 20,
                        fontWeight: 500,
                        ...getSideColor(trade.side),
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {trade.amount}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {trade.price.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={trade.status}
                      size="small"
                      sx={{
                        fontSize: "0.6875rem",
                        height: 20,
                        fontWeight: 500,
                        ...getStatusColor(trade.status),
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {trade.createdAt}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default ManageTradePage;