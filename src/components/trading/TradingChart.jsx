import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Settings,
  Fullscreen,
  FullscreenExit,
  CameraAlt,
} from "@mui/icons-material";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import { AppColors } from "../../constant/appColors";
import BTLoader from "../Loader";


const TIMEFRAMES = [
  { label: "1m", granularity: 60 },
  { label: "5m", granularity: 300 },
  { label: "15m", granularity: 900 },
  { label: "1H", granularity: 3600 },
  { label: "6H", granularity: 21600 },
  { label: "1D", granularity: 86400 },
];

export default function TradingChart({ selectedPair = "BTCUSDT", onPriceUpdate }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const wsRef = useRef(null);
  const currentCandleRef = useRef(null);
  const currentPairRef = useRef(null); // Track currently subscribed pair
  const onPriceUpdateRef = useRef(onPriceUpdate); // Store callback in ref to avoid stale closures
  const previousClosePriceRef = useRef(null); // Track previous candle's close price for direction
  const [selectedTimeframe, setSelectedTimeframe] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update callback ref when prop changes
  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate;
  }, [onPriceUpdate]);

  const productId = selectedPair;
  const currentGranularity = TIMEFRAMES[selectedTimeframe].granularity;

  const loadHistory = async (pair, granularity) => {
    try {
      setIsLoading(true);
      setError(null);

      // Coinbase API supports specific granularities: 60, 300, 900, 3600, 21600, 86400
      const supportedGranularities = [60, 300, 900, 3600, 21600, 86400];
      if (!supportedGranularities.includes(granularity)) {
        throw new Error(`Unsupported granularity: ${granularity} seconds. Supported: 60, 300, 900, 3600, 21600, 86400`);
      }

      const res = await fetch(
        `https://api.exchange.coinbase.com/products/${pair}/candles?granularity=${granularity}`
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch data: ${res.statusText} (${res.status})`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format from API");
      }

      if (data.length === 0) {
        throw new Error("No historical data available for this timeframe");
      }

      // Coinbase returns newest first, reverse to get oldest first
      return data.reverse().map(c => ({
        time: c[0],
        open: parseFloat(c[3]),
        high: parseFloat(c[2]),
        low: parseFloat(c[1]),
        close: parseFloat(c[4]),
      }));
    } catch (err) {
      console.error("Error loading history:", err);
      setError(err.message || "Failed to load chart data");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = (pair, granularity) => {
    // Clean up existing WebSocket connection
    if (wsRef.current) {
      try {
        // Unsubscribe from previous pair before closing
        if (currentPairRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({
              type: "unsubscribe",
              product_ids: [currentPairRef.current],
              channels: ["matches"]
            }));
          } catch (e) {
            console.warn("Error unsubscribing from previous pair:", e);
          }
        }

        // Mark as intentionally closed before closing
        if (wsRef.current._cleanup) {
          wsRef.current._cleanup();
        }

        wsRef.current.close();
      } catch (e) {
        console.warn("Error closing WebSocket:", e);
      }
    }

    // Reset current candle when switching pairs
    currentCandleRef.current = null;
    previousClosePriceRef.current = null;

    // Update current pair reference
    currentPairRef.current = pair;

    const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");
    wsRef.current = ws;
    let reconnectTimeout = null;
    let isIntentionallyClosed = false;

    ws.onopen = () => {
      isIntentionallyClosed = false;

      try {
        // Subscribe to the new pair
        ws.send(JSON.stringify({
          type: "subscribe",
          product_ids: [pair],
          channels: ["matches"]
        }));
        console.log(`WebSocket subscribed to pair: ${pair}`);
      } catch (err) {
        console.error("Error subscribing to WebSocket:", err);
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "subscriptions") {
          return;
        }

        if (msg.type === "error") {
          console.error("WebSocket error:", msg.message);
          return;
        }

        // Only process match messages for the current pair
        // Check if the message is for the currently subscribed pair
        if (
          msg.type === "match" &&
          seriesRef.current &&
          msg.price &&
          msg.size &&
          (msg.product_id === pair || msg.product_id === currentPairRef.current) // Verify message is for current pair
        ) {
          const price = parseFloat(msg.price);
          const time = new Date(msg.time).getTime() / 1000;

          const candleTime = Math.floor(time / granularity) * granularity;

          if (price > 0) {
            let priceDirection = null; // null = no change, 'up' = increase, 'down' = decrease

            if (!currentCandleRef.current || currentCandleRef.current.time !== candleTime) {
              // New candle - compare with previous candle's close
              const previousClose = currentCandleRef.current?.close || previousClosePriceRef.current || price;

              // Determine direction based on comparison with previous close
              if (previousClose > 0 && price !== previousClose) {
                priceDirection = price > previousClose ? 'up' : 'down';
              }

              // Store previous close before updating
              if (currentCandleRef.current?.close) {
                previousClosePriceRef.current = currentCandleRef.current.close;
              }

              currentCandleRef.current = {
                time: candleTime,
                open: previousClose,
                high: price,
                low: price,
                close: price,
              };
            } else {
              // Same candle - compare with candle's open price for direction
              const candleOpen = currentCandleRef.current.open;
              if (candleOpen > 0 && price !== candleOpen) {
                priceDirection = price > candleOpen ? 'up' : 'down';
              }

              currentCandleRef.current.high = Math.max(currentCandleRef.current.high, price);
              currentCandleRef.current.low = Math.min(currentCandleRef.current.low, price);
              currentCandleRef.current.close = price;
            }

            // Update parent component with latest price and direction
            if (onPriceUpdateRef.current) {
              onPriceUpdateRef.current(price, priceDirection);
            }

            try {
              seriesRef.current.update(currentCandleRef.current);
            } catch (err) {
              console.error("Error updating chart:", err);
            }
          }
        } else if (
          msg.type === "match" &&
          msg.product_id &&
          msg.product_id !== pair &&
          msg.product_id !== currentPairRef.current
        ) {
          // Ignore messages from other pairs (might be delayed messages from previous subscription)
          // Only log in development to avoid console spam
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Ignoring message from wrong pair: ${msg.product_id} (current: ${currentPairRef.current || pair})`);
          }
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error event:", error);
    };

    ws.onclose = () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      // Only reconnect if it wasn't intentionally closed and we're still on the same pair
      if (!isIntentionallyClosed && chartRef.current && seriesRef.current && currentPairRef.current === pair) {
        reconnectTimeout = setTimeout(() => {
          connectWebSocket(pair, granularity);
        }, 3000);
      }
    };

    ws._cleanup = () => {
      isIntentionallyClosed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    chartRef.current = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: AppColors.BG_SECONDARY },
        textColor: AppColors.TXT_MAIN,
      },
      grid: {
        vertLines: { color: `${AppColors.HLT_NONE}20` },
        horzLines: { color: `${AppColors.HLT_NONE}20` },
      },
      width: container.clientWidth,
      height: container.clientHeight,
      autoSize: true,
    });

    seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: AppColors.SUCCESS,
      downColor: AppColors.ERROR,
      borderVisible: false,
      wickUpColor: AppColors.SUCCESS,
      wickDownColor: AppColors.ERROR,
    });

    (async () => {
      // Clear existing data when timeframe changes
      if (seriesRef.current) {
        seriesRef.current.setData([]);
        currentCandleRef.current = null;
        previousClosePriceRef.current = null;
      }

      const data = await loadHistory(productId, currentGranularity);

      if (data.length > 0 && seriesRef.current) {
        // Set new data for the selected timeframe only
        seriesRef.current.setData(data);
        chartRef.current.timeScale().fitContent();

        // Initialize current candle with the last historical candle
        const lastCandle = data[data.length - 1];
        if (lastCandle) {
          currentCandleRef.current = { ...lastCandle };
          previousClosePriceRef.current = lastCandle.close;

          // Initialize price from last historical candle's close price
          // Determine direction from candle's open vs close
          let initialDirection = null;
          if (lastCandle.open > 0 && lastCandle.close > 0 && lastCandle.close !== lastCandle.open) {
            initialDirection = lastCandle.close > lastCandle.open ? 'up' : 'down';
          }

          if (onPriceUpdateRef.current && lastCandle.close > 0) {
            onPriceUpdateRef.current(lastCandle.close, initialDirection);
          }
        }
      }

      // Connect WebSocket with the new granularity
      connectWebSocket(productId, currentGranularity);
    })();

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        const container = chartContainerRef.current;
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (wsRef.current) {
        if (wsRef.current._cleanup) {
          wsRef.current._cleanup();
        }
        try {
          wsRef.current.close();
        } catch (e) {
        }
        wsRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
      currentCandleRef.current = null;
      previousClosePriceRef.current = null;
    };
  }, [productId, currentGranularity]);

  const handleTimeframeChange = (index) => {
    setSelectedTimeframe(index);
  };

  // Screenshot functionality
  const handleScreenshot = useCallback(async () => {
    if (!chartRef.current || !chartContainerRef.current) return;

    try {
      // Try to use lightweight-charts built-in screenshot
      let canvas;
      try {
        canvas = chartRef.current.takeScreenshot();
      } catch (e) {
        // Fallback: use html2canvas or create canvas from container
        console.warn("Chart takeScreenshot not available, using fallback");
        canvas = null;
      }

      if (!canvas) {
        // Fallback: capture the container using html2canvas
        // For now, we'll use a simple canvas approach
        const container = chartContainerRef.current.parentElement;
        if (!container) return;

        // Create a canvas from the chart's internal canvas
        const chartCanvas = container.querySelector("canvas");
        if (chartCanvas) {
          canvas = document.createElement("canvas");
          canvas.width = chartCanvas.width;
          canvas.height = chartCanvas.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(chartCanvas, 0, 0);
        }
      }

      if (!canvas) {
        throw new Error("Failed to capture chart");
      }

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `chart-${selectedPair}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, "image/png");
    } catch (err) {
      console.error("Error taking screenshot:", err);
      alert("Failed to take screenshot. Please try again.");
    }
  }, [selectedPair]);

  // Fullscreen functionality
  const handleFullscreen = useCallback(() => {
    const container = chartContainerRef.current?.parentElement?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        )
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <Box
      sx={{
        bgcolor: AppColors.BG_SECONDARY,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 0.5,
          borderBottom: `1px solid ${AppColors.HLT_NONE}30`,
          bgcolor: AppColors.BG_CARD,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Indicators">
            <IconButton size="small" sx={{ color: AppColors.TXT_SUB }}>
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Screenshot">
            <IconButton size="small" sx={{ color: AppColors.TXT_SUB }} onClick={handleScreenshot}>
              <CameraAlt fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton size="small" sx={{ color: AppColors.TXT_SUB }} onClick={handleFullscreen}>
              {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          sx={{
            p: 0.2,
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            display: "flex",
            gap: 0.5,
          }}
        >
          {TIMEFRAMES.map((tf, index) => (
            <Button
              key={tf.label}
              size="small"
              variant="text"
              onClick={() => handleTimeframeChange(index)}
              sx={{
                p: 0.5,
                minWidth: { xs: 32, sm: 40 },
                fontSize: { xs: "0.688rem", sm: "0.75rem" },
                color: selectedTimeframe === index ? AppColors.GOLD_PRIMARY : AppColors.TXT_SUB,
                textTransform: "none",
                fontWeight: selectedTimeframe === index ? 600 : 400,
                "&:hover": {
                  color: AppColors.GOLD_PRIMARY,
                },
              }}
            >
              {tf.label}
            </Button>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          flex: 1,
          bgcolor: AppColors.BG_SECONDARY,
          minHeight: { xs: 300, sm: 400, md: 500, lg: 600 },
          width: "100%",
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <BTLoader size={40} sx={{ color: AppColors.GOLD_PRIMARY }} />
          </Box>
        )}
        {error && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: AppColors.ERROR, mb: 1 }}>
              {error}
            </Typography>
            <Button
              size="small"
              onClick={() => {
                const data = loadHistory(productId, currentGranularity);
                data.then((d) => {
                  if (d.length > 0 && seriesRef.current) {
                    seriesRef.current.setData(d);
                    chartRef.current?.timeScale().fitContent();
                  }
                });
              }}
              sx={{ color: AppColors.GOLD_PRIMARY }}
            >
              Retry
            </Button>
          </Box>
        )}
        <Box
          ref={chartContainerRef}
          sx={{
            width: "100%",
            height: "100%",
            flex: 1,
          }}
        />
      </Box>

      <Box
        sx={{
          px: { xs: 1, sm: 2 },
          py: 0.5,
          borderTop: `1px solid ${AppColors.HLT_NONE}30`,
          bgcolor: AppColors.BG_CARD,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, fontSize: { xs: "0.688rem", sm: "0.75rem" } }}>
          {productId} • {TIMEFRAMES[selectedTimeframe].label}
        </Typography>
        <Button
          size="small"
          sx={{
            color: AppColors.TXT_SUB,
            py: 0.2,
            px: 0.5,
            textTransform: "none",
          }}
        >
          Date Range
        </Button>
      </Box>
    </Box>
  );
}
