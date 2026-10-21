import {
  DeliveryType,
  ParcelSize,
  PriceCalculationResult,
  PricingConfig,
} from '../types';

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  baseFare: 15.0,                  // 15 ILS
  perKmRate: 2.30,                 // 2.30 ILS / km
  waitingRatePerMin: 0.30,         // 0.30 ILS / minute
  dieselBenchmarkPrice: 7.85,      // 7.85 ILS / liter
  backhaulDiscountPct: 0.35,       // 35% discount for Backhaul
  expressCommissionPct: 0.20,      // 20% platform cut for Express
  backhaulCommissionPct: 0.15,     // 15% platform cut for Backhaul
  checkpointDelaySurcharge: 1.25,  // 1.25x traffic/barrier surge
  maxDriverDebtLimit: 150.0,       // Max COD debt before freezing
};

export const PARCEL_SIZE_MULTIPLIERS: Record<ParcelSize, number> = {
  small: 1.0,     // مستندات، أكياس صغيرة، هواتف
  medium: 1.0,    // كرتونة متوسطة، ملابس (matching benchmark standard)
  large: 1.25,    // كرتونة كبيرة، قطع غيار ثقيلة
  trunk: 1.6,     // تحميل الصندوق بالكامل
};

/**
 * Calculates delivery pricing accurately based on official Palestinian inter-city transport metrics.
 */
export function calculateDeliveryPrice(
  distanceKm: number,
  estimatedMinutes: number,
  size: ParcelSize = 'small',
  deliveryType: DeliveryType = 'express',
  hasSevereCheckpointDelay: boolean = false,
  customConfig: Partial<PricingConfig> = {}
): PriceCalculationResult {
  const config = { ...DEFAULT_PRICING_CONFIG, ...customConfig };

  const sizeMultiplier = PARCEL_SIZE_MULTIPLIERS[size] || 1.0;
  const baseFare = config.baseFare;
  const distanceCost = Number((distanceKm * config.perKmRate).toFixed(2));
  const timeDelayCost = Number((estimatedMinutes * config.waitingRatePerMin).toFixed(2));

  // Base raw trip cost (express standard before multipliers)
  const baseTripCost = baseFare + distanceCost + timeDelayCost;
  
  // Apply parcel size multiplier
  const sizeAdjustedCost = baseTripCost * sizeMultiplier;

  // Surcharge for severe delays/checkpoints if detected
  const checkpointSurcharge = hasSevereCheckpointDelay
    ? Number((sizeAdjustedCost * (config.checkpointDelaySurcharge - 1)).toFixed(2))
    : 0;

  const rawExpressTotal = Number((sizeAdjustedCost + checkpointSurcharge).toFixed(2));

  let finalCustomerPrice: number;
  let backhaulDiscountAmount = 0;
  let platformCommissionPct: number;

  if (deliveryType === 'backhaul') {
    // 35% discount for customer on return trips (benchmark: 188.5 -> 122.5 ILS)
    backhaulDiscountAmount = Number((rawExpressTotal * config.backhaulDiscountPct).toFixed(1));
    finalCustomerPrice = Number((rawExpressTotal - backhaulDiscountAmount).toFixed(1));
    platformCommissionPct = config.backhaulCommissionPct; // 15%
  } else {
    finalCustomerPrice = Number(rawExpressTotal.toFixed(1));
    platformCommissionPct = config.expressCommissionPct; // 20%
  }

  // Revenue splits: (e.g. 18.3 ILS platform, 104.2 ILS driver net)
  const platformRevenue = Number((finalCustomerPrice * platformCommissionPct).toFixed(1));
  const driverNetRevenue = Number((finalCustomerPrice - platformRevenue).toFixed(1));

  // Fuel consumption benchmark (~8.5 Liters per 100km for diesel servis / sedan)
  const fuelLiters = (distanceKm / 100) * 8.5;
  const fuelEstimatedCost = Number((fuelLiters * config.dieselBenchmarkPrice).toFixed(2));
  const driverNetProfitAboveFuel = Number((driverNetRevenue - fuelEstimatedCost).toFixed(2));

  return {
    baseFare,
    distanceKm,
    distanceCost,
    estimatedMinutes,
    timeDelayCost,
    sizeMultiplier,
    subtotalBeforeDiscounts: baseTripCost,
    isCheckpointActive: hasSevereCheckpointDelay,
    checkpointSurcharge,
    rawExpressTotal,
    deliveryType,
    backhaulDiscountAmount,
    finalCustomerPrice,
    platformCommissionPct,
    platformRevenue,
    driverGrossCut: finalCustomerPrice,
    driverNetRevenue,
    fuelEstimatedCost,
    driverNetProfitAboveFuel,
  };
}

/**
 * Checks driver wallet health and credit limit.
 * Negative balance indicates unpaid platform commission from Cash-on-Delivery trips.
 */
export function evaluateDriverDebtStatus(
  currentBalance: number,
  creditLimit: number = DEFAULT_PRICING_CONFIG.maxDriverDebtLimit
): {
  isFrozen: boolean;
  isWarning: boolean;
  debtAmount: number;
  remainingCredit: number;
  statusTextAr: string;
} {
  const debtAmount = currentBalance < 0 ? Math.abs(currentBalance) : 0;
  const remainingCredit = Math.max(0, creditLimit - debtAmount);
  const isFrozen = debtAmount >= creditLimit;
  const isWarning = !isFrozen && debtAmount >= creditLimit * 0.7; // 70% threshold

  let statusTextAr = 'المحفظة بحالة ممتازة';
  if (isFrozen) {
    statusTextAr = `الحساب مجمّد: تجاوزت حد المديونية (${creditLimit} ₪). يرجى السداد لتفعيل الحساب.`;
  } else if (isWarning) {
    statusTextAr = `تنبيه: اقتربت من حد المديونية. المتبقي لك: ${remainingCredit.toFixed(1)} ₪.`;
  }

  return {
    isFrozen,
    isWarning,
    debtAmount,
    remainingCredit,
    statusTextAr,
  };
}
