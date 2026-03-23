import { memo, useEffect, useState } from "react";
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
import useAuth from "../../hooks/useAuth";
import { createTradeSocket } from "../../services/tradingSocketService";
import tradingService from "../../services/tradingService";

const api = createTradeSocket();

const formatTimestamp = (value) => {
  if (!value) return "-";
  try {
    const date = typeof value === "string" || typeof value === "number" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  } catch {
    return "-";
  }
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function TradingTabs({ selectedPair, setLiveTradesMarker }) {
  console.log('selectedPair: ', selectedPair);
  const [liveTrades, setLiveTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { isLoggedIn, userData } = useAuth();
  // const { joinUser } = useTradeSocket({ autoJoinPublic: false });

  const fetchLiveTrades = async () => {
    if (!isLoggedIn) {
      setLiveTrades([]);
      return;
    }
    try {
      setLiveLoading(true);
      const response = await tradingService.getLiveTrades();
      if (response?.success) {
        setLiveTrades(response.data || []);
      } else {
        setLiveTrades([]);
      }
    } catch {
      setLiveTrades([]);
    } finally {
      setLiveLoading(false);
    }
  };

  const fetchTradeHistory = async () => {
    if (!isLoggedIn) {
      setTradeHistory([]);
      return;
    }
    try {
      setHistoryLoading(true);
      const response = await tradingService.getTradeHistory();
      if (response?.success) {
        setTradeHistory(response.data || []);
      } else {
        setTradeHistory([]);
      }
    } catch {
      setTradeHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setLiveTrades([]);
      setTradeHistory([]);
      return;
    }

    fetchLiveTrades();
    fetchTradeHistory();
  }, [isLoggedIn]);

  useEffect(() => {
    console.log('liveTrades: ', liveTrades);
    setLiveTradesMarker(() => liveTrades.filter((trade) => trade.pair === selectedPair).map((trade) => trade));
  }, [selectedPair]);

  // useEffect(() => {
  //   const bettingData = async () => {
  //     joinUser(userData?.email);
  //     console.log('userData?.email: ', userData?.email);
  //     await api.betStarted((data) => {
  //       console.log("live trade started: ", data);
  //       fetchLiveTrades();
  //     });
  //     await api.betResult((data) => {
  //       console.log("live trade result: ", data);
  //       fetchLiveTrades();
  //       fetchTradeHistory();
  //     });
  //   };
  //   if (isLoggedIn && userData?.email) {
  //     bettingData();
  //   }
  // }, [isLoggedIn, userData?.email, joinUser]);

  const tabs = [
    { key: "liveTrades", label: `Live Trades (${liveTrades?.length || 0})` },
    { key: "tradeHistory", label: `Trade History (${tradeHistory?.length || 0})` },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        bgcolor: AppColors.BG_SECONDARY,
        borderTop: `1px solid ${AppColors.HLT_NONE}30`,
        overflow: "hidden",
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
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: "auto",
            "& .MuiTabs-indicator": {
              height: 2,
              background: `linear-gradient(90deg, ${AppColors.GOLD_PRIMARY}, ${AppColors.GOLD_LIGHT})`,
            },
            "& .MuiTab-root": {
              minHeight: 48,
              padding: "8px 16px",
              fontSize: "0.813rem",
              color: AppColors.TXT_SUB,
              textTransform: "none",
              "&.Mui-selected": {
                color: AppColors.GOLD_PRIMARY,
                fontWeight: 600,
              },
            },
            "& .MuiTabs-scrollButtons": {
              color: AppColors.TXT_SUB,
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, minHeight: 200 }}>
        {activeTab === 0 && (
          <Box>
            {!isLoggedIn ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: AppColors.TXT_SUB,
                }}
              >
                <Typography variant="body1">Connect to see your live trades</Typography>
                <Typography variant="caption" sx={{ fontSize: "0.75rem", mt: 1, display: "block" }}>
                  Log in and place trades to see them update in real time.
                </Typography>
              </Box>
            ) : liveLoading ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: AppColors.TXT_SUB,
                }}
              >
                <Typography variant="body1">Loading live trades...</Typography>
              </Box>
            ) : !liveTrades || liveTrades.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: AppColors.TXT_SUB,
                }}
              >
                <Typography variant="body1">No live trades</Typography>
                <Typography variant="caption" sx={{ fontSize: "0.75rem", mt: 1, display: "block" }}>
                  Start a new trade to see it here while it is open.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["Time", "Pair", "Direction", "Entry Price", "Expiry"].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            bgcolor: AppColors.BG_CARD,
                            color: AppColors.TXT_SUB,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            borderBottom: `1px solid ${AppColors.HLT_NONE}30`,
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {liveTrades.map((trade) => (
                      <TableRow key={trade.betId || `${trade.pair}-${trade.entryPrice}-${trade.expiryTime}`}>
                        <TableCell sx={{ fontSize: "0.75rem", color: AppColors.TXT_MAIN }}>
                          {formatTimestamp(trade.createdAt || trade.expiryTime)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: AppColors.TXT_MAIN }}>
                          {trade.pair}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: trade.direction === "UP" ? AppColors.SUCCESS : AppColors.ERROR, fontWeight: 600 }}>
                          {trade.direction}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: AppColors.TXT_MAIN }}>
                          {formatPrice(trade.entryPrice)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: AppColors.TXT_SUB }}>
                          {formatTimestamp(trade.expiryTime)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {!isLoggedIn ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: AppColors.TXT_SUB,
                }}
              >
                <Typography variant="body1">Connect to see your trade history</Typography>
                <Typography variant="caption" sx={{ fontSize: "0.75rem", mt: 1, display: "block" }}>
                  Log in to view a list of your completed trades.
                </Typography>
              </Box>
            ) : historyLoading ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: AppColors.TXT_SUB,
                }}
              >
                <Typography variant="body1">Loading trade history...</Typography>
              </Box>
            ) : !tradeHistory || tradeHistory.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: AppColors.TXT_SUB,
                }}
              >
                <Typography variant="body1">No trade history yet</Typography>
                <Typography variant="caption" sx={{ fontSize: "0.75rem", mt: 1, display: "block" }}>
                  After you complete trades, they will appear here.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["Time", "Pair", "Direction", "Entry", "Exit", "Status", "Payout"].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            bgcolor: AppColors.BG_CARD,
                            color: AppColors.TXT_SUB,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            borderBottom: `1px solid ${AppColors.HLT_NONE}30`,
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tradeHistory.map((trade) => (
                      <TableRow key={trade.betId || `${trade.pair}-${trade.entryPrice}-${trade.exitPrice}-${trade.status}`}>
                        <TableCell sx={{ fontSize: "0.75rem", color: AppColors.TXT_MAIN }}>
                          {formatTimestamp(trade.resolvedAt || trade.createdAt)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: AppColors.TXT_MAIN }}>
                          {trade.pair}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: trade.direction === "UP" ? AppColors.SUCCESS : AppColors.ERROR, fontWeight: 600 }}>
                          {trade.direction}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: AppColors.TXT_MAIN }}>
                          {formatPrice(trade.entryPrice)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: AppColors.TXT_MAIN }}>
                          {formatPrice(trade.exitPrice)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: trade.status === "WIN" ? AppColors.SUCCESS : AppColors.ERROR, fontWeight: 600 }}>
                          {trade.status}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: AppColors.TXT_MAIN }}>
                          {formatPrice(trade.winningBalance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default memo(TradingTabs);