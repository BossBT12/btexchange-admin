import React, { memo, useEffect, useMemo, useState } from 'react'
import { Box, Card, CardContent, Typography, Table, TableBody, TableRow, TableCell, Button } from '@mui/material'
import { AppColors } from '../../constant/appColors'
import { useNavigate } from 'react-router-dom'
import useTradeSocket from '../../hooks/useTradeSocket'
import { createTradeSocket } from '../../services/tradingSocketService'
import BTLoader from '../Loader'

const PriceTableRow = memo(({ coin, onTradeClick }) => {
    const formattedPrice = useMemo(() => {
        return coin?.price?.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }, [coin?.price?.price]);

    const formattedChange = useMemo(() => {
        let change = coin?.price?.open24h ? ((coin?.price?.price - coin?.price?.open24h) / coin?.price?.open24h) * 100 : 0;
        return change > 0 ? `+${change?.toFixed(2)}%` : `${change?.toFixed(2)}%`;
    }, [coin?.price?.price]);

    return (
        <TableRow
            hover
            sx={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:last-child td": { borderBottom: "none" },
                "&:hover": {
                    bgcolor: "rgba(212, 168, 95, 0.08)",
                },
            }}
        >
            <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                {coin.pair}
            </TableCell>
            <TableCell align="right" sx={{ color: AppColors.TXT_SUB }}>
                {formattedPrice}
            </TableCell>
            <TableCell align="right">
                <Box
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1.5,
                        background: coin.change < 0
                            ? "rgba(255, 68, 68, 0.12)"
                            : "rgba(0, 255, 136, 0.12)",
                        color: coin.change < 0 ? AppColors.ERROR : AppColors.SUCCESS,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                    }}
                >
                    {formattedChange}
                </Box>
            </TableCell>
            <TableCell align="right">
                <Button
                    className="btn-primary"
                    size="small"
                    onClick={onTradeClick}
                    sx={{ minWidth: 90 }}
                >
                    Trade
                </Button>
            </TableCell>
        </TableRow>
    );
});

PriceTableRow.displayName = 'PriceTableRow';
const api = createTradeSocket();

const LandingPageList = () => {
    const navigate = useNavigate();
    const [memoizedPrices, setMemoizedPrices] = useState([]);
    const { isConnected, joinPublic } = useTradeSocket();

    useEffect(() => {
        const tradeChagne = async () => {
            joinPublic();
            await api.pairPrices((prices) => {
                setMemoizedPrices(prices);
            });
        }
        if (isConnected) {
            tradeChagne()
        }
    }, [isConnected]);

    return (
        <Box className="container-card-charts">
            <Card id="trending-coins-card" className="card-charts">
                <Box className="flex items-center justify-center border-b border-solid"
                    sx={{ borderBottomColor: `${AppColors.HLT_NONE}30` }}>
                    <Typography
                        variant="h5"
                        sx={{ px: 4, py: 1, color: AppColors.TXT_SUB, fontWeight: 600 }}
                    >
                        Top Coins
                    </Typography>
                </Box>

                <CardContent sx={{
                    p: 0,
                    height: { xs: "40vh", sm: "45vh", md: "50vh" },
                    overflow: "auto",
                    "&::-webkit-scrollbar": { display: "none" },
                    willChange: "scroll-position",
                    transform: "translateZ(0)",
                }}>
                    <Table
                        size="small"
                        sx={{
                            width: "100%",
                            px: { xs: 0.5, sm: 1 },
                            "& .MuiTableCell-root": {
                                borderBottom: `1px solid ${AppColors.HLT_NONE}30`,
                                padding: { xs: "10px 8px", sm: "12px 12px" },
                            },
                            "& .MuiTableRow-root": {
                                willChange: "background-color",
                            },
                        }}
                    >
                        <TableBody>
                            {memoizedPrices.length === 0 ? (
                                <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
                                    <TableCell colSpan={4} align="center" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 4, color: AppColors.TXT_SUB }}>
                                        <BTLoader />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                memoizedPrices.map((coin) => (
                                    <PriceTableRow
                                        key={coin.pair}
                                        coin={coin}
                                        onTradeClick={() => navigate("/trade", { state: { selectedPair: coin.pair } })}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    )
}

export default LandingPageList