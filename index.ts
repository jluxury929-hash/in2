import { apiServer } from './api/server';
import { config } from './config';
import logger from './utils/logger';

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  apiServer.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  apiServer.stop();
  process.exit(0);
});

// Start the application
async function startApp() {
  try {
    logger.info('Starting Massive Trading Engine API...');
    
    // Start API server
    apiServer.start();
    
    logger.info('Massive Trading Engine API started successfully!');
    logger.info(`API Server: http://localhost:${config.server.port}`);
    logger.info(`Environment: ${config.server.environment}`);
    
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

startApp();
export interface Config {
  server: {
    port: number;
    wsPort: number;
    environment: string;
  };
  trading: {
    maxTradesPerSecond: number;
    minProfitThresholdUSD: number;
    maxGasPriceGwei: number;
    enableFlashLoans: boolean;
    flashLoanAmountETH: number;
  };
  risk: {
    maxPositionSizeETH: number;
    maxDailyLossETH: number;
    stopLossPercent: number;
    enableRiskLimits: boolean;
  };
  strategies: {
    enableLowRisk: boolean;
    enableMediumRisk: boolean;
    enableHighRisk: boolean;
    maxActiveStrategies: number;
    rotationIntervalMs: number;
  };
  ai: {
    confidenceThreshold: number;
    enableOptimization: boolean;
    retrainingIntervalHours: number;
  };
}

export interface Strategy {
  id: string;
  name: string;
  type: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  enabled: boolean;
  priority: number;
  successRate: number;
  totalTrades: number;
  totalProfitUSD: number;
  parameters: Record<string, any>;
  lastExecution?: Date;
}

export interface TradeOpportunity {
  id: string;
  type: 'ARBITRAGE' | 'FLASH_LOAN' | 'MEV';
  tokenA: string;
  tokenB: string;
  exchangeA: string;
  exchangeB: string;
  priceA: number;
  priceB: number;
  profitUSD: number;
  profitPercent: number;
  gasEstimate: number;
  confidence: number;
  timestamp: Date;
}

export interface TradeResult {
  id: string;
  strategyId: string;
  opportunity: TradeOpportunity;
  success: boolean;
  profitUSD: number;
  gasUsed: number;
  transactionHash?: string;
  executionTime: number;
  timestamp: Date;
}

export interface PriceData {
  token: string;
  price: number;
  timestamp: Date;
  source: string;
  volume24h?: number;
  change24h?: number;
}

export interface FlashLoanOpportunity extends TradeOpportunity {
  loanAmount: number;
  protocol: 'AAVE' | 'DYDX';
  callback: string;
}

export interface WalletBalance {
  chain: string;
  token: string;
  balance: string;
  usdValue: number;
}

export interface PerformanceMetrics {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfitUSD: number;
  totalLossUSD: number;
  netProfitUSD: number;
  averageTradeTime: number;
  tradesPerSecond: number;
  successRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  timestamp: number;
}
import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    wsPort: parseInt(process.env.WS_PORT || '3001'),
    environment: process.env.NODE_ENV || 'development'
  },
  trading: {
    maxTradesPerSecond: parseInt(process.env.MAX_TRADES_PER_SECOND || '100000'),
    minProfitThresholdUSD: parseFloat(process.env.MIN_PROFIT_THRESHOLD_USD || '1.0'),
    maxGasPriceGwei: parseInt(process.env.MAX_GAS_PRICE_GWEI || '100'),
    enableFlashLoans: process.env.ENABLE_FLASH_LOANS === 'true',
    flashLoanAmountETH: parseFloat(process.env.FLASH_LOAN_AMOUNT_ETH || '100')
  },
  risk: {
    maxPositionSizeETH: parseFloat(process.env.MAX_POSITION_SIZE_ETH || '10'),
    maxDailyLossETH: parseFloat(process.env.MAX_DAILY_LOSS_ETH || '5'),
    stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT || '2'),
    enableRiskLimits: process.env.ENABLE_RISK_LIMITS === 'true'
  },
  strategies: {
    enableLowRisk: process.env.ENABLE_LOW_RISK_STRATEGIES !== 'false',
    enableMediumRisk: process.env.ENABLE_MEDIUM_RISK_STRATEGIES !== 'false',
    enableHighRisk: process.env.ENABLE_HIGH_RISK_STRATEGIES === 'true',
    maxActiveStrategies: parseInt(process.env.MAX_ACTIVE_STRATEGIES || '1000'),
    rotationIntervalMs: parseInt(process.env.STRATEGY_ROTATION_INTERVAL_MS || '1000')
  },
  ai: {
    confidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.75'),
    enableOptimization: process.env.ENABLE_AI_OPTIMIZATION !== 'false',
    retrainingIntervalHours: parseInt(process.env.AI_RETRAINING_INTERVAL_HOURS || '24')
  }
};

export const RPC_ENDPOINTS = {
  ethereum: [
    process.env.ETHEREUM_RPC_1,
    process.env.ETHEREUM_RPC_2,
    process.env.ETHEREUM_RPC_3,
    'https://rpc.ankr.com/eth',
    'https://eth.llamarpc.com'
  ].filter(Boolean) as string[],
  bsc: [
    process.env.BSC_RPC_1,
    process.env.BSC_RPC_2,
    'https://bsc-dataseed1.binance.org',
    'https://bsc-dataseed2.binance.org'
  ].filter(Boolean) as string[],
  polygon: [
    process.env.POLYGON_RPC_1,
    'https://polygon-rpc.com',
    'https://rpc.ankr.com/polygon'
  ].filter(Boolean) as string[],
  arbitrum: [
    process.env.ARBITRUM_RPC_1,
    'https://arb1.arbitrum.io/rpc',
    'https://rpc.ankr.com/arbitrum'
  ].filter(Boolean) as string[],
  optimism: [
    process.env.OPTIMISM_RPC_1,
    'https://mainnet.optimism.io',
    'https://rpc.ankr.com/optimism'
  ].filter(Boolean) as string[]
};

export const DEX_ADDRESSES = {
  uniswapV2Router: process.env.UNISWAP_V2_ROUTER || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  uniswapV3Router: process.env.UNISWAP_V3_ROUTER || '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  sushiswapRouter: process.env.SUSHISWAP_ROUTER || '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
  pancakeswapRouter: process.env.PANCAKESWAP_ROUTER || '0x10ED43C718714eb63d5aA57B78B54704E256024E'
};

export const FLASH_LOAN_PROVIDERS = {
  aaveLendingPool: process.env.AAVE_LENDING_POOL || '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
  dydxSoloMargin: process.env.DYDX_SOLO_MARGIN || '0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e'
};

export const WALLET_CONFIG = {
  privateKey: process.env.WALLET_PRIVATE_KEY || '',
  address: process.env.WALLET_ADDRESS || ''
};

export const API_KEYS = {
  binance: {
    key: process.env.BINANCE_API_KEY || '',
    secret: process.env.BINANCE_API_SECRET || ''
  },
  coinbase: process.env.COINBASE_API_KEY || '',
  coingecko: process.env.COINGECKO_API_KEY || '',
  etherscan: process.env.ETHERSCAN_API_KEY || '',
  bscscan: process.env.BSCSCAN_API_KEY || ''
};
