import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { AppColors } from "../../constant/appColors";

// Helper function to extract numeric price from object or number
const extractPrice = (value, defaultValue = 90086.4) => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'object' && value !== null && typeof value.price === 'number') {
    return value.price;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Mock data for order book
const generateOrderBookData = (basePrice = 90086.4) => {
  const numericPrice = extractPrice(basePrice);
  const sellOrders = [];
  const buyOrders = [];

  // Generate sell orders (prices above current)
  for (let i = 1; i <= 10; i++) {
    const price = numericPrice + i * 5 + Math.random() * 3;
    const qty = Math.random() * 1000000 + 10000;
    sellOrders.push({
      price: price.toFixed(1),
      qty: (qty / 1000).toFixed(2) + " K",
      total: ((qty * price) / 1000000).toFixed(2) + " M",
    });
  }

  // Generate buy orders (prices below current)
  for (let i = 1; i <= 10; i++) {
    const price = numericPrice - i * 5 - Math.random() * 3;
    const qty = Math.random() * 2000000 + 50000;
    buyOrders.push({
      price: price.toFixed(1),
      qty: (qty / 1000).toFixed(2) + " K",
      total: ((qty * price) / 1000000).toFixed(2) + " M",
    });
  }

  return { sellOrders: sellOrders.reverse(), buyOrders };
};

const generateRecentTrades = (basePrice = 90086.4) => {
  const numericPrice = extractPrice(basePrice);
  const trades = [];
  for (let i = 0; i < 20; i++) {
    const isBuy = Math.random() > 0.5;
    const price = numericPrice + (Math.random() - 0.5) * 100;
    const qty = Math.random() * 10 + 0.01;
    trades.push({
      price: price.toFixed(1),
      qty: qty.toFixed(4),
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      isBuy,
    });
  }
  return trades;
};

export default function OrderBook({ selectedPair }) {
  const [tab, setTab] = useState(2);
  const currentPrice = 0;
  
  // Extract numeric price from currentPrice (handles both object and number)
  const numericPrice = useMemo(() => extractPrice(currentPrice), [currentPrice]);
  
  // Generate order book data with current price
  const orderBookData = useMemo(() => generateOrderBookData(numericPrice), [numericPrice]);
  const recentTrades = useMemo(() => generateRecentTrades(numericPrice), [numericPrice]);
  
  // Format price for display
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(numericPrice);
  }, [numericPrice]);

  return (
    <Box
      sx={{
        bgcolor: AppColors.BG_SECONDARY,
        borderRight: `1px solid ${AppColors.HLT_NONE}30`,
        borderLeft: `1px solid ${AppColors.HLT_NONE}30`,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Tabs */}
      <Box
        sx={{
          borderBottom: `1px solid ${AppColors.HLT_NONE}30`,
          bgcolor: AppColors.BG_CARD,
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          sx={{
            minHeight: "auto",
            "& .MuiTabs-indicator": {
              height: 2,
              background: `linear-gradient(90deg, ${AppColors.GOLD_PRIMARY}, ${AppColors.GOLD_LIGHT})`,
            },
            "& .MuiTab-root": {
              minHeight: 40,
              padding: "8px 16px",
              fontSize: "0.813rem",
              color: AppColors.TXT_SUB,
              textTransform: "none",
              "&.Mui-selected": {
                color: AppColors.GOLD_PRIMARY,
              },
            },
          }}
        >
          <Tab label="Chart" />
          <Tab label="Depth" />
          <Tab label="Order Book" />
          <Tab label="Recent Trades" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
        {tab === 2 ? (
          // Order Book
          <Box sx={{ height: "100%" }}>
            {/* Sell Orders */}
            <TableContainer sx={{ bgcolor: AppColors.BG_SECONDARY }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        bgcolor: AppColors.BG_CARD,
                        color: AppColors.TXT_SUB,
                        fontSize: { xs: "0.688rem", sm: "0.75rem" },
                        fontWeight: 600,
                        borderBottom: `1px solid ${AppColors.HLT_NONE}30`,
                      }}
                    >
                      Price (USDT)
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: AppColors.BG_CARD,
                        color: AppColors.TXT_SUB,
                        fontSize: { xs: "0.688rem", sm: "0.75rem" },
                        fontWeight: 600,
                        borderBottom: `1px solid ${AppColors.HLT_NONE}30`,
                      }}
                    >
                      Qty(USDT)
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: AppColors.BG_CARD,
                        color: AppColors.TXT_SUB,
                        fontSize: { xs: "0.688rem", sm: "0.75rem" },
                        fontWeight: 600,
                        borderBottom: `1px solid ${AppColors.HLT_NONE}30`,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      Total(USDT)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderBookData.sellOrders.map((order, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { bgcolor: `${AppColors.ERROR}10` },
                        cursor: "pointer",
                      }}
                    >
                      <TableCell
                        sx={{
                          color: AppColors.ERROR,
                          fontSize: { xs: "0.75rem", sm: "0.813rem" },
                          fontFamily: "monospace",
                        }}
                      >
                        {order.price}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: AppColors.TXT_MAIN,
                          fontSize: { xs: "0.75rem", sm: "0.813rem" },
                        }}
                      >
                        {order.qty}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: AppColors.TXT_SUB,
                          fontSize: { xs: "0.75rem", sm: "0.813rem" },  
                          display: { xs: "none", sm: "table-cell" },
                        }}
                      >
                        {order.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Current Price */}
            <Box
              sx={{
                bgcolor: AppColors.BG_CARD,
                py: 1,
                px: 2,
                textAlign: "center",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: AppColors.SUCCESS,
                  fontWeight: 700,
                  fontSize: "1.125rem",
                }}
              >
                ↑ {formattedPrice}
              </Typography>
              <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, fontSize: "0.75rem" }}>
                {formattedPrice}
              </Typography>
            </Box>

            {/* Buy Orders */}
            <TableContainer sx={{ bgcolor: AppColors.BG_SECONDARY }}>
              <Table size="small">
                <TableBody>
                  {orderBookData.buyOrders.map((order, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { bgcolor: `${AppColors.SUCCESS}10` },
                        cursor: "pointer",
                      }}
                    >
                      <TableCell
                        sx={{
                          color: AppColors.SUCCESS,
                          fontSize: "0.813rem",
                          fontFamily: "monospace",
                          py: 0.5,
                        }}
                      >
                        {order.price}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: AppColors.TXT_MAIN, fontSize: "0.813rem", py: 0.5 }}
                      >
                        {order.qty}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: AppColors.TXT_SUB, fontSize: "0.813rem", py: 0.5 }}
                      >
                        {order.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : tab === 3 ? (
          // Recent Trades
          <TableContainer sx={{ height: "100%", bgcolor: AppColors.BG_SECONDARY }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: AppColors.BG_CARD,
                      color: AppColors.TXT_SUB,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      py: 1,
                    }}
                  >
                    Price (USDT)
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      bgcolor: AppColors.BG_CARD,
                      color: AppColors.TXT_SUB,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      py: 1,
                    }}
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      bgcolor: AppColors.BG_CARD,
                      color: AppColors.TXT_SUB,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      py: 1,
                    }}
                  >
                    Time
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTrades.map((trade, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": { bgcolor: AppColors.BG_CARD },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: trade.isBuy ? AppColors.SUCCESS : AppColors.ERROR,
                        fontSize: "0.813rem",
                        fontFamily: "monospace",
                        py: 0.5,
                      }}
                    >
                      {trade.price}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: AppColors.TXT_MAIN, fontSize: "0.813rem", py: 0.5 }}
                    >
                      {trade.qty}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: AppColors.TXT_SUB, fontSize: "0.75rem", py: 0.5 }}
                    >
                      {trade.time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: AppColors.TXT_SUB,
            }}
          >
            <Typography variant="body2">Chart/Depth view coming soon</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
