import { DealAnalysis } from './types';

export function calculateDealAnalysis(
  arv: number | null,
  askingPrice: number | null,
  repairEstimate: number | null,
  assignmentFee: number | null
): DealAnalysis {
  const arvVal = arv || 0;
  const askVal = askingPrice || 0;
  const repairVal = repairEstimate || 0;
  const feeVal = assignmentFee || 0;

  const mao = arvVal * 0.7 - repairVal - feeVal;
  const potentialProfit = arvVal - askVal - repairVal;
  const totalInvestment = askVal + repairVal;
  const roi = totalInvestment > 0 ? (potentialProfit / totalInvestment) * 100 : 0;

  return { mao, potentialProfit, roi };
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
