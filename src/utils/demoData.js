// Demo data for testing the History & Logs Management component
export const demoHistoryData = {
  trades: [
    {
      id: 1,
      userId: 'USR001',
      pair: 'BTC-USD',
      amount: 1250.50,
      status: 'WIN',
      createdAt: '2024-01-15T10:30:00Z',
      closedAt: '2024-01-15T11:30:00Z',
      profit: 125.75
    },
    {
      id: 2,
      userId: 'USR002',
      pair: 'ETH-USD',
      amount: 850.25,
      status: 'LOSS',
      createdAt: '2024-01-15T09:15:00Z',
      closedAt: '2024-01-15T10:45:00Z',
      profit: -85.25
    },
    {
      id: 3,
      userId: 'USR003',
      pair: 'BNB-USD',
      amount: 2100.00,
      status: 'OPEN',
      createdAt: '2024-01-15T14:20:00Z',
      closedAt: null,
      profit: null
    }
  ],
  income: [
    {
      id: 1,
      userId: 'USR001',
      type: 'REFERRAL_BONUS',
      amount: 25.00,
      fromUserId: 'USR002',
      createdAt: '2024-01-15T12:00:00Z',
      description: 'Referral bonus from new user registration'
    },
    {
      id: 2,
      userId: 'USR003',
      type: 'LEVEL_INCOME',
      amount: 150.50,
      fromUserId: 'USR004',
      createdAt: '2024-01-15T13:30:00Z',
      description: 'Level income from downline trading activity'
    }
  ],
  deposits: [
    {
      id: 1,
      userId: 'USR001',
      amount: 500.00,
      chain: 'BSC',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      status: 'SUCCESS',
      createdAt: '2024-01-15T08:00:00Z',
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    },
    {
      id: 2,
      userId: 'USR002',
      amount: 1000.00,
      chain: 'ETH',
      address: '0x9876543210fedcba9876543210fedcba98765432',
      status: 'PENDING',
      createdAt: '2024-01-15T15:30:00Z',
      txHash: null
    },
    {
      id: 3,
      userId: 'USR003',
      amount: 250.75,
      chain: 'POLYGON',
      address: '0x1111222233334444555566667777888899990000',
      status: 'FAILED',
      createdAt: '2024-01-15T16:45:00Z',
      txHash: null
    }
  ],
  withdrawals: [
    {
      id: 1,
      userId: 'USR001',
      amount: 300.00,
      type: 'WITHDRAW_WINNINGS',
      toAddress: '0xaaabbbcccdddeeefffaaabbbcccdddeeefffaaab',
      status: 'SUCCESS',
      createdAt: '2024-01-15T17:00:00Z',
      txHash: '0x1111111122222222333333334444444455555555666666667777777788888888'
    },
    {
      id: 2,
      userId: 'USR002',
      amount: 750.50,
      type: 'WITHDRAW_WORKING',
      toAddress: '0xbbbcccdddeeefffaaabbbcccdddeeefffaaabbb',
      status: 'PROCESSING',
      createdAt: '2024-01-15T18:15:00Z',
      txHash: null
    }
  ]
};

// Utility function to generate more demo data for pagination testing
export const generateDemoData = (type, count = 50) => {
  const baseData = demoHistoryData[type] || [];
  const generatedData = [];
  
  for (let i = 0; i < count; i++) {
    const baseItem = baseData[i % baseData.length];
    const newItem = {
      ...baseItem,
      id: i + 1,
      userId: `USR${String(i + 1).padStart(3, '0')}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: parseFloat((Math.random() * 2000 + 100).toFixed(2))
    };
    
    if (type === 'trades') {
      newItem.profit = Math.random() > 0.5 ? 
        parseFloat((newItem.amount * (Math.random() * 0.2 + 0.05)).toFixed(2)) : 
        -parseFloat((newItem.amount * (Math.random() * 0.15 + 0.02)).toFixed(2));
      newItem.status = newItem.profit > 0 ? 'WIN' : 'LOSS';
    }
    
    generatedData.push(newItem);
  }
  
  return generatedData;
};

export default demoHistoryData;