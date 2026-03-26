import { DealAnalysis } from './types';

export function calculateDealAnalysis(
  arv: number | null,
  askingPrice: number | null,
  repairEstimate: number | null,
  assignmentFee: number | null,
  lightRehabBudgetLow?: number | null,
  lightRehabBudgetHigh?: number | null,
  fullRehabBudgetLow?: number | null,
  fullRehabBudgetHigh?: number | null,
  lightRehabArv?: number | null,
  fullRehabArvLow?: number | null,
  fullRehabArvHigh?: number | null,
): DealAnalysis {
  const arvVal = arv || 0;
  const askVal = askingPrice || 0;
  const repairVal = repairEstimate || 0;
  const feeVal = assignmentFee || 0;

  const mao = arvVal * 0.7 - repairVal - feeVal;
  const potentialProfit = arvVal - askVal - repairVal;
  const totalInvestment = askVal + repairVal;
  const roi = totalInvestment > 0 ? (potentialProfit / totalInvestment) * 100 : 0;

  // Range-based profit calculations
  const lArv = lightRehabArv || 0;
  const lBudgetLow = lightRehabBudgetLow || 0;
  const lBudgetHigh = lightRehabBudgetHigh || 0;
  const fArvLow = fullRehabArvLow || 0;
  const fArvHigh = fullRehabArvHigh || 0;
  const fBudgetLow = fullRehabBudgetLow || 0;
  const fBudgetHigh = fullRehabBudgetHigh || 0;

  const profitLightRehabLow = lArv - askVal - lBudgetHigh;
  const profitLightRehabHigh = lArv - askVal - lBudgetLow;
  const profitFullRehabLow = fArvLow - askVal - fBudgetHigh;
  const profitFullRehabHigh = fArvHigh - askVal - fBudgetLow;

  return {
    mao,
    potentialProfit,
    roi,
    profitLightRehabLow,
    profitLightRehabHigh,
    profitFullRehabLow,
    profitFullRehabHigh,
  };
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

export function formatCurrencyRange(low: number | null | undefined, high: number | null | undefined): string {
  if (low == null && high == null) return '$0';
  if (low == null) return formatCurrency(high);
  if (high == null) return formatCurrency(low);
  if (low === high) return formatCurrency(low);
  return `${formatCurrency(low)} – ${formatCurrency(high)}`;
}
