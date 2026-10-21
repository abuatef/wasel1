export type ParcelSize = 'small' | 'medium' | 'large' | 'trunk';

export type ParcelCategory =
  | 'documents'
  | 'apparel'
  | 'spare_parts'
  | 'electronics'
  | 'cartons'
  | 'food_produce';

export type DeliveryType = 'express' | 'backhaul';

export type OrderStatus =
  | 'pending'
  | 'matched'
  | 'picked_up'
  | 'in_transit'
  | 'checkpoint_delayed'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'cash_on_delivery'
  | 'jawwal_pay'
  | 'palpay'
  | 'refah'
  | 'credit_card';

export type VehicleType = 'servis' | 'private' | 'van';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CityData {
  id: string;
  nameAr: string;
  nameEn: string;
  region: 'north' | 'center' | 'south' | 'jerusalem' | 'gaza';
  coords: Coordinates;
  isMajorHub: boolean;
}

export interface PricingConfig {
  baseFare: number;              // 15 ILS
  perKmRate: number;             // 2.30 ILS/km
  waitingRatePerMin: number;     // 0.30 ILS/min
  dieselBenchmarkPrice: number;  // 7.85 ILS/Liter
  backhaulDiscountPct: number;   // 0.35 (35% discount for customer)
  expressCommissionPct: number;  // 0.20 (20% to platform)
  backhaulCommissionPct: number; // 0.15 (15% to platform)
  checkpointDelaySurcharge: number; // 1.25x
  maxDriverDebtLimit: number;    // 150 - 200 ILS
}

export interface PriceCalculationResult {
  baseFare: number;
  distanceKm: number;
  distanceCost: number;
  estimatedMinutes: number;
  timeDelayCost: number;
  sizeMultiplier: number;
  subtotalBeforeDiscounts: number;
  isCheckpointActive: boolean;
  checkpointSurcharge: number;
  rawExpressTotal: number;
  deliveryType: DeliveryType;
  backhaulDiscountAmount: number;
  finalCustomerPrice: number;
  platformCommissionPct: number;
  platformRevenue: number;
  driverGrossCut: number;
  driverNetRevenue: number;
  fuelEstimatedCost: number;
  driverNetProfitAboveFuel: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  rating: number;
  tripsCount: number;
  vehicleType: VehicleType;
  vehiclePlate: string; // "عمومي - أصفر (الخليل)" or "خصوصي - لوحة بيضاء"
  vehicleModel: string;
  currentCityId: string;
  currentLocation: Coordinates;
  isReturnTripActive: boolean;
  returnOriginCityId?: string;
  returnDestinationCityId?: string;
  returnCorridorToleranceKm?: number; // e.g. 8 km
  walletBalance: number; // negative means debt to platform (COD commissions)
  creditLimit: number; // e.g. 150 ILS
  isFrozen: boolean;
  assignedOrderIds: string[];
}

export interface Order {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  fromCityId: string;
  toCityId: string;
  pickupAddressDetails: string;
  dropoffAddressDetails: string;
  recipientName: string;
  recipientPhone: string;
  category: ParcelCategory;
  size: ParcelSize;
  weightKg: number;
  notes?: string;
  isFragile: boolean;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  priceBreakdown: PriceCalculationResult;
  status: OrderStatus;
  driverId?: string;
  driverName?: string;
  securityPin: string; // 4-digit code to confirm receipt
  createdAt: string;
  deliveredAt?: string;
  delayReportedMinutes?: number;
  checkpointName?: string;
}

export interface WalletTransaction {
  id: string;
  driverId: string;
  timestamp: string;
  type: 'cod_commission_debt' | 'digital_payout' | 'settlement_payment' | 'fuel_subsidy';
  amount: number; // positive = added to driver balance, negative = debt deducted
  orderId?: string;
  note: string;
  balanceAfter: number;
}

export interface CheckpointInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  locationNear: string;
  coords: Coordinates;
  status: 'normal' | 'crowded' | 'blocked';
  delayEstimateMins: number;
  reportedAt: string;
}

export interface B2BMerchant {
  id: string;
  name: string;
  sector: string;
  city: string;
  monthlyOrders: number;
  discountRate: number;
  activeContract: boolean;
}
