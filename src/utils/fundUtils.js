// Utility functions for fund management
import BinanceIcon from '../assets/svg/binance.svg';
import EthereumIcon from '../assets/svg/ethereum.svg';
import PolygonIcon from '../assets/svg/polygon.svg';

export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

export const formatBalance = (balance, decimals = 6) => {
  if (!balance || isNaN(balance)) return '0.000000';
  return parseFloat(balance).toFixed(decimals);
};

export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
  if (!amount || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

export const getChainConfig = (chain) => {
  const configs = {
    BSC: {
      name: 'Binance Smart Chain',
      nativeCurrency: 'BNB',
      explorerUrl: 'https://bscscan.com',
      color: '#f3ba2f',
      icon: BinanceIcon
    },
    ETH: {
      name: 'Ethereum',
      nativeCurrency: 'ETH',
      explorerUrl: 'https://etherscan.io',
      color: '#627eea',
      icon: EthereumIcon
    },
    POLYGON: {
      name: 'Polygon',
      nativeCurrency: 'MATIC',
      explorerUrl: 'https://polygonscan.com',
      color: '#8247e5',
      icon: PolygonIcon
    }
  };
  
  return configs[chain] || configs.BSC;
};

export const getExplorerUrl = (chain, address) => {
  const config = getChainConfig(chain);
  return `${config.explorerUrl}/address/${address}`;
};

export const validateAddress = (address, chain) => {
  if (!address) return false;
  
  // Basic ethereum address validation (works for BSC, ETH, POLYGON)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
};

export const calculateGasFee = (chain, gasPrice, gasLimit) => {
  // Basic gas fee calculation (you might need to adjust based on actual chain configurations)
  const gasFee = (gasPrice * gasLimit) / 1e18; // Convert from wei to ether
  return gasFee;
};

export const getBalanceStatus = (balance) => {
  const numBalance = parseFloat(balance || 0);
  
  if (numBalance === 0) return { status: 'empty', color: 'gray', message: 'No balance' };
  if (numBalance < 1) return { status: 'low', color: 'yellow', message: 'Low balance' };
  if (numBalance < 100) return { status: 'medium', color: 'blue', message: 'Available' };
  return { status: 'high', color: 'green', message: 'High balance' };
};

export const groupAddressesByBalance = (addresses) => {
  const groups = {
    high: [], // > $100
    medium: [], // $1 - $100
    low: [], // $0.01 - $1
    empty: [] // < $0.01
  };
  
  Object.entries(addresses).forEach(([address, balance]) => {
    const numBalance = parseFloat(balance || 0);
    
    if (numBalance > 100) groups.high.push({ address, balance });
    else if (numBalance >= 1) groups.medium.push({ address, balance });
    else if (numBalance >= 0.01) groups.low.push({ address, balance });
    else groups.empty.push({ address, balance });
  });
  
  return groups;
};

export const calculateTotalValue = (balances, prices = {}) => {
  let total = 0;
  
  Object.entries(balances).forEach(([chain, addresses]) => {
    Object.values(addresses).forEach(balance => {
      total += parseFloat(balance || 0);
    });
  });
  
  return total;
};

export const generateSweepRecommendations = (chainBalances, minSweepAmount = 1) => {
  const recommendations = [];
  
  Object.entries(chainBalances).forEach(([chain, addresses]) => {
    const sweepable = [];
    let totalSweepable = 0;
    
    Object.entries(addresses).forEach(([address, balance]) => {
      const numBalance = parseFloat(balance || 0);
      if (numBalance >= minSweepAmount) {
        sweepable.push({ address, balance: numBalance });
        totalSweepable += numBalance;
      }
    });
    
    if (sweepable.length > 0) {
      recommendations.push({
        chain,
        addresses: sweepable,
        totalAmount: totalSweepable,
        count: sweepable.length
      });
    }
  });
  
  return recommendations.sort((a, b) => b.totalAmount - a.totalAmount);
};

export const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

export const exportToCSV = (data, filename) => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + data.map(row => row.join(",")).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};