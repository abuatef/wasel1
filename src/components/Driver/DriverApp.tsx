import React, { useState } from 'react';
import { Driver, Order, PricingConfig, WalletTransaction } from '../../types';
import { PALESTINIAN_CHECKPOINTS, PALESTINIAN_CITIES, isParcelOnDriverCorridor } from '../../utils/geo';
import { evaluateDriverDebtStatus } from '../../utils/pricing';
import { PalestineMap } from '../Map/PalestineMap';
import {
  Car,
  Navigation,
  Wallet,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Compass,
  ArrowRightLeft,
  Phone,
  Banknote,
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  Fuel,
  Info,
  Clock,
  Layers,
} from 'lucide-react';

interface DriverAppProps {
  drivers: Driver[];
  selectedDriverId: string;
  orders: Order[];
  transactions: WalletTransaction[];
  pricingConfig: PricingConfig;
  onSelectDriver: (driverId: string) => void;
  onUpdateDriver: (updatedDriver: Driver) => void;
  onAcceptOrder: (orderId: string, driverId: string) => void;
  onCompleteDelivery: (orderId: string, pin: string) => { success: boolean; message: string };
  onReportCheckpointDelay: (orderId: string, checkpointName: string, delayMinutes: number) => void;
  onSettleDebt: (driverId: string, amount: number, method: string) => void;
}

export const DriverApp: React.FC<DriverAppProps> = ({
  drivers,
  selectedDriverId,
  orders,
  transactions,
  pricingConfig,
  onSelectDriver,
  onUpdateDriver,
  onAcceptOrder,
  onCompleteDelivery,
  onReportCheckpointDelay,
  onSettleDebt,
}) => {
  const activeDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  // Return trip config state
  const [returnOrigin, setReturnOrigin] = useState<string>(activeDriver.returnOriginCityId || activeDriver.currentCityId);
  const [returnDest, setReturnDest] = useState<string>(activeDriver.returnDestinationCityId || 'hebron');
  const [toleranceKm, setToleranceKm] = useState<number>(activeDriver.returnCorridorToleranceKm || 10);
  const [returnTripActive, setReturnTripActive] = useState<boolean>(activeDriver.isReturnTripActive);

  // Delivery confirmation modal state
  const [handoverOrderId, setHandoverOrderId] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [handoverError, setHandoverError] = useState<string | null>(null);
  const [handoverSuccess, setHandoverSuccess] = useState<string | null>(null);

  // Checkpoint alert state
  const [reportingOrderId, setReportingOrderId] = useState<string | null>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>('حاجز واد النار (الكونتينر)');
  const [delayMinutes, setDelayMinutes] = useState<number>(30);

  // Debt settlement modal state
  const [showSettlementModal, setShowSettlementModal] = useState<boolean>(false);
  const [settlementMethod, setSettlementMethod] = useState<string>('jawwal_pay');

  // Evaluate driver debt
  const debtStatus = evaluateDriverDebtStatus(activeDriver.walletBalance, activeDriver.creditLimit);

  // Driver transactions
  const driverTxList = transactions.filter((tx) => tx.driverId === activeDriver.id);

  // Active in-progress orders assigned to this driver
  const assignedOrders = orders.filter((o) => o.driverId === activeDriver.id && o.status !== 'delivered');

  // Filter available marketplace orders based on Return Trip corridor
  const availableOrders = orders.filter((o) => o.status === 'pending');

  const matchedOrders = availableOrders.map((order) => {
    if (!returnTripActive) {
      return { order, isMatch: true, score: 70, detourKm: 0, reasonAr: 'طلب متاح عام' };
    }
    const match = isParcelOnDriverCorridor(
      returnOrigin,
      returnDest,
      order.fromCityId,
      order.toCityId,
      toleranceKm
    );
    return { order, ...match };
  }).filter((item) => (returnTripActive ? item.isMatch : true));

  const handleToggleReturnTrip = () => {
    const updated = !returnTripActive;
    setReturnTripActive(updated);
    onUpdateDriver({
      ...activeDriver,
      isReturnTripActive: updated,
      returnOriginCityId: returnOrigin,
      returnDestinationCityId: returnDest,
      returnCorridorToleranceKm: toleranceKm,
    });
  };

  const handleConfirmHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverOrderId) return;

    const result = onCompleteDelivery(handoverOrderId, enteredPin);
    if (result.success) {
      setHandoverSuccess(result.message);
      setHandoverError(null);
      setTimeout(() => {
        setHandoverOrderId(null);
        setEnteredPin('');
        setHandoverSuccess(null);
      }, 2000);
    } else {
      setHandoverError(result.message);
    }
  };

  const handleReportDelaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingOrderId) return;
    onReportCheckpointDelay(reportingOrderId, selectedCheckpoint, delayMinutes);
    setReportingOrderId(null);
  };

  const handlePerformSettlement = () => {
    const amountToSettle = Math.abs(activeDriver.walletBalance);
    onSettleDebt(activeDriver.id, amountToSettle, settlementMethod);
    setShowSettlementModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Driver Persona Switcher Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
            {activeDriver.vehicleType === 'servis' ? '🚕' : activeDriver.vehicleType === 'van' ? '🚚' : '🚗'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{activeDriver.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {activeDriver.phone}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {activeDriver.vehiclePlate} • {activeDriver.vehicleModel}
            </div>
          </div>
        </div>

        {/* Persona quick switch */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">تبديل حساب الكابتن:</span>
          <select
            value={activeDriver.id}
            onChange={(e) => onSelectDriver(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:border-emerald-500"
          >
            {drivers.map((drv) => (
              <option key={drv.id} value={drv.id}>
                {drv.name} ({drv.vehicleType === 'servis' ? 'سرفيس عمومي' : 'سيارة خاصة'}) - رصيد: {drv.walletBalance} ₪
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Driver Debt / Wallet Warning Banner if Frozen or Warning */}
      {debtStatus.isFrozen ? (
        <div className="bg-rose-500/15 border-2 border-rose-500/60 rounded-2xl p-5 shadow-xl text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-white">تنبيه أمان: تم تجميد حساب الكابتن مؤقتاً!</div>
              <div className="text-xs text-rose-200 mt-1">
                تجاوزت ذمم الكاش المسجلة بحقك حد المديونية المسموح به (
                <strong className="text-white font-mono">{activeDriver.creditLimit} ₪</strong>). الرصيد الحالي:{' '}
                <strong className="text-rose-400 font-mono">{activeDriver.walletBalance} ₪</strong>.
                تم إيقاف ظهور أي طلبات جديدة حتى تصفية الحساب.
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSettlementModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition shadow cursor-pointer whitespace-nowrap"
          >
            سداد المستحقات عبر جوال باي / بال باي
          </button>
        </div>
      ) : debtStatus.isWarning ? (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4 text-amber-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>
              <strong>تنبيه ذمم الكاش:</strong> أنت قريب من حد المديونية ({activeDriver.creditLimit} ₪). المتبقي لك قبل تجميد الحساب: <strong>{debtStatus.remainingCredit.toFixed(1)} ₪</strong>.
            </span>
          </div>
          <button
            onClick={() => setShowSettlementModal(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition whitespace-nowrap"
          >
            سداد جزء الآن
          </button>
        </div>
      ) : null}

      {/* Main Grid: Return Trip Mode (Left) & Active Trip HUD / Available Radar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Return Trip Configuration & Digital Wallet */}
        <div className="lg:col-span-5 space-y-6">
          {/* RETURN TRIP MODE PANEL */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">خاصية رحلة العودة (Return Trip Mode)</h2>
              </div>
              <button
                type="button"
                onClick={handleToggleReturnTrip}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  returnTripActive ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                aria-label="تفعيل أو تعطيل خاصية رحلة العودة"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    returnTripActive ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              أدخل وجهة عودتك؛ سيقوم النظام بفلترة وإظهار الطرود التي تقع على نفس خط سيرك فقط، مما يضمن لك عدم العودة فارغاً وتغطية تكلفة الوقود بالكامل.
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs text-slate-400 block mb-1">أنا الآن في مدينة:</label>
                <select
                  value={returnOrigin}
                  onChange={(e) => setReturnOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 focus:border-emerald-500"
                >
                  {PALESTINIAN_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameAr} ({c.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">وعائد إلى مدينتي:</label>
                <select
                  value={returnDest}
                  onChange={(e) => setReturnDest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 focus:border-emerald-500"
                >
                  {PALESTINIAN_CITIES.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.id === returnOrigin}>
                      {c.nameAr} ({c.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Radial search tolerance */}
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">نطاق البحث الشعاعي لنقاط التوقف (Radial Corridor):</span>
                  <span className="font-bold text-emerald-400 font-mono">{toleranceKm} كم</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  value={toleranceKm}
                  onChange={(e) => setToleranceKm(parseInt(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>على نفس الشارع (3 كم)</span>
                  <span>توقف مرن (10 كم)</span>
                  <span>تغطية موسعة (20 كم)</span>
                </div>
              </div>
            </div>

            {/* Benefit teaser card */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2.5">
              <Fuel className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                طرد واحد في طريق عودتك من <strong>{PALESTINIAN_CITIES.find((c) => c.id === returnOrigin)?.nameAr}</strong> إلى <strong>{PALESTINIAN_CITIES.find((c) => c.id === returnDest)?.nameAr}</strong> يغطي ثمن وقود السولار بالكامل ويزيد!
              </span>
            </div>
          </div>

          {/* DRIVER WALLET & CASH LEDGER */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">محفظة الكابتن وسجل الذمم (Ledger)</h2>
              </div>
              <button
                onClick={() => setShowSettlementModal(true)}
                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition font-medium"
              >
                تسديد المستحقات
              </button>
            </div>

            {/* Balance gauge */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[11px] text-slate-400">رصيد المحفظة الحالي:</div>
                  <div
                    className={`text-2xl font-black font-mono mt-0.5 ${
                      activeDriver.walletBalance < 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {activeDriver.walletBalance.toFixed(1)} ₪
                  </div>
                </div>
                <div className="text-left text-xs">
                  <span className="text-slate-400">حد المديونية: </span>
                  <span className="text-white font-mono font-bold">{activeDriver.creditLimit} ₪</span>
                </div>
              </div>

              {/* Progress bar of debt vs credit limit */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    debtStatus.isFrozen
                      ? 'bg-rose-500'
                      : debtStatus.isWarning
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (debtStatus.debtAmount / activeDriver.creditLimit) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>ديون كاش مسجلة: {debtStatus.debtAmount.toFixed(1)} ₪</span>
                <span>المتبقي قبل التجميد: {debtStatus.remainingCredit.toFixed(1)} ₪</span>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="text-[11px] text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>كيف تدار الأموال؟</strong> عند تسليم طرد كاش، تقبض كامل المبلغ نقداً من الزبون، ويقيد النظام نسبة المنصة بالسالب في محفظتك. لا تجعل ديونك تصل لـ {activeDriver.creditLimit} ₪ لتجنب تجميد الحساب.
              </span>
            </div>

            {/* Recent Ledger Transactions */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">آخر حركات المحفظة:</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {driverTxList.length > 0 ? (
                  driverTxList.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="text-slate-300 font-medium">{tx.note}</div>
                        <div className="text-[10px] text-slate-500">{tx.timestamp}</div>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          tx.amount < 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount.toFixed(1)}` : tx.amount.toFixed(1)} ₪
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-slate-500 py-2">لا توجد حركات حديثة</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Trips HUD & Available Orders Radar */}
        <div className="lg:col-span-7 space-y-6">
          {/* ACTIVE IN-TRANSIT TRIP HUD */}
          {assignedOrders.length > 0 ? (
            assignedOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-5 shadow-lg space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-sm font-bold text-white">رحلة جارية الآن | {ord.trackingNumber}</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {ord.deliveryType === 'backhaul' ? 'رحلة عودة تشاركية' : 'طلب مباشر مستعجل'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-400">وجهة التسليم:</div>
                    <div className="text-sm font-bold text-white">
                      {PALESTINIAN_CITIES.find((c) => c.id === ord.toCityId)?.nameAr} - {ord.dropoffAddressDetails}
                    </div>
                    <div className="text-slate-300">
                      المستلم: <strong>{ord.recipientName}</strong> ({ord.recipientPhone})
                    </div>
                  </div>

                  <div className="space-y-1 text-xs sm:text-left">
                    <div className="text-slate-400">طريقة التحصيل ومستحقاتك:</div>
                    <div className="text-base font-black text-emerald-400 font-mono">
                      {ord.priceBreakdown.finalCustomerPrice} ₪{' '}
                      <span className="text-xs text-slate-400 font-normal">
                        ({ord.paymentMethod === 'cash_on_delivery' ? 'كاش عند التسليم' : 'دفع إلكتروني محجوز'})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      صافي ربحك: <strong className="text-white font-mono">{ord.priceBreakdown.driverNetRevenue} ₪</strong>
                    </div>
                  </div>
                </div>

                {/* Road Checkpoint Notice if any */}
                {ord.checkpointName && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>
                        تم تسجيل تأخير عند <strong>{ord.checkpointName}</strong> (+{ord.delayReportedMinutes} دقيقة)
                      </span>
                    </div>
                  </div>
                )}

                {/* Map snippet */}
                <div className="h-56 rounded-xl overflow-hidden border border-slate-800">
                  <PalestineMap
                    highlightRoute={{ fromCityId: ord.fromCityId, toCityId: ord.toCityId }}
                    activeDriver={activeDriver}
                    showCheckpoints={true}
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingOrderId(ord.id)}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs transition flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>الإبلاغ عن حاجز / أزمة مرورية</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHandoverOrderId(ord.id);
                      setEnteredPin('');
                      setHandoverError(null);
                    }}
                    className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>تسليم الطرد وقبض المبلغ</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
              <div className="text-3xl">🚗</div>
              <div className="text-sm font-bold text-white">لا توجد رحلة جارية لك حالياً</div>
              <p className="text-xs text-slate-400">
                تفقد قائمة الطرود المتاحة بالأسفل والمطابقة لمسار رحلة عودتك لقبولها فوراً.
              </p>
            </div>
          )}

          {/* AVAILABLE ORDERS RADAR (BACKHAUL CORRIDOR) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>الطرود المتاحة المتوافقة مع مسارك ({matchedOrders.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {returnTripActive
                    ? `مطابقة في محيط مسار: ${PALESTINIAN_CITIES.find((c) => c.id === returnOrigin)?.nameAr} ← ${PALESTINIAN_CITIES.find((c) => c.id === returnDest)?.nameAr}`
                    : 'جميع الطرود العامة المتاحة للنقل'}
                </span>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {matchedOrders.length} طلب جاهز
              </span>
            </div>

            {debtStatus.isFrozen ? (
              <div className="p-6 rounded-xl bg-slate-950 border border-rose-500/30 text-center text-xs text-rose-300">
                تم حجب استعراض وقبول الطرود حتى تسديد ذمم الكاش المعلقة.
              </div>
            ) : matchedOrders.length > 0 ? (
              <div className="space-y-3">
                {matchedOrders.map(({ order, isMatch, score, detourKm, reasonAr }) => {
                  const fromCity = PALESTINIAN_CITIES.find((c) => c.id === order.fromCityId);
                  const toCity = PALESTINIAN_CITIES.find((c) => c.id === order.toCityId);

                  return (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 transition space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {order.trackingNumber}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {order.deliveryType === 'backhaul' ? 'رحلة عودة' : 'طلب مباشر'}
                            </span>
                            {detourKm === 0 ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                                تطابق 100% بدون انحراف
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                                انحراف +{detourKm} كم فقط
                              </span>
                            )}
                          </div>

                          <div className="text-sm font-bold text-white mt-1.5 flex items-center gap-2">
                            <span>{fromCity?.nameAr}</span>
                            <span className="text-slate-500">←</span>
                            <span>{toCity?.nameAr}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{order.notes}</div>
                        </div>

                        <div className="text-left">
                          <div className="text-xs text-slate-400">صافي ربحك:</div>
                          <div className="text-lg font-black text-emerald-400 font-mono">
                            {order.priceBreakdown.driverNetRevenue} ₪
                          </div>
                          <div className="text-[10px] text-slate-500">
                            (الزبون يدفع {order.priceBreakdown.finalCustomerPrice} ₪)
                          </div>
                        </div>
                      </div>

                      {/* Corridor Reasoning Badge */}
                      <div className="text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/60 flex items-center justify-between">
                        <span>{reasonAr}</span>
                        <span className="font-mono text-emerald-400 font-bold">{order.weightKg} كغم</span>
                      </div>

                      {/* Accept Button */}
                      <button
                        type="button"
                        onClick={() => onAcceptOrder(order.id, activeDriver.id)}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>قبول ونقل الطرد كـ نقطة توقف (Accept Waypoint)</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                لا توجد طرود حالياً مطابقة لهذا المسار بالكامل. جرب توسيع نطاق البحث الشعاعي أو التبديل للوضع العام.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: DELIVERY CONFIRMATION WITH CUSTOMER PIN */}
      {handoverOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>تأكيد تسليم الطرد وإنهاء الرحلة</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              لضمان حقوقك وحقوق العميل ومنع النزاعات، يرجى طلب <strong>رمز الأمان السري (4 أرقام)</strong> من مستلم الطرد وإدخاله أدناه.
            </p>

            <form onSubmit={handleConfirmHandover} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">رمز الأمان السري (PIN):</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="مثال: 4821"
                  className="w-full bg-slate-950 border border-slate-700 text-center tracking-widest text-2xl font-mono text-emerald-400 rounded-xl py-3 focus:border-emerald-500"
                />
              </div>

              {handoverError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {handoverError}
                </div>
              )}

              {handoverSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                  {handoverSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setHandoverOrderId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                >
                  تأكيد وقبض المبلغ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT CHECKPOINT DELAY */}
      {reportingOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>الإبلاغ عن حاجز أو أزمة مرورية مفاجئة</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              يقوم النظام تلقائياً بتحديث وقت الوصول المتوقع لدى العميل واحتساب معامل التأخير الديناميكي لتعويض وقتك وجهدك.
            </p>

            <form onSubmit={handleReportDelaySubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">اسم الحاجز أو المنطقة:</label>
                <select
                  value={selectedCheckpoint}
                  onChange={(e) => setSelectedCheckpoint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 focus:border-emerald-500"
                >
                  {PALESTINIAN_CHECKPOINTS.map((cp) => (
                    <option key={cp.id} value={cp.nameAr}>
                      {cp.nameAr} ({cp.locationNear})
                    </option>
                  ))}
                  <option value="أزمة خانقة على مفرق زعترة">أزمة خانقة على مفرق زعترة</option>
                  <option value="إغلاق واد النار">إغلاق واد النار بالاتجاهين</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">مدة التأخير المتوقعة (بالدقائق):</label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  step="5"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-sm font-mono text-white rounded-xl px-3 py-2.5 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingOrderId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  إرسال التقرير وتحديث المسار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SETTLE CASH COMMISSIONS (JAWWAL PAY / PALPAY) */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span>تسديد عمولات المنصة وتصفية الذمم</span>
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400">إجمالي المديونية المستحقة للمنصة:</div>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                {Math.abs(activeDriver.walletBalance).toFixed(1)} ₪
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">اختر وسيلة التسديد الفوري:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSettlementMethod('jawwal_pay')}
                  className={`p-3 rounded-xl border text-right transition flex flex-col gap-1 ${
                    settlementMethod === 'jawwal_pay'
                      ? 'border-emerald-500 bg-emerald-500/15'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-white">جوال باي (Jawwal Pay)</span>
                  <span className="text-[10px] text-slate-400">خصم آلي من رصيدك</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettlementMethod('palpay')}
                  className={`p-3 rounded-xl border text-right transition flex flex-col gap-1 ${
                    settlementMethod === 'palpay'
                      ? 'border-emerald-500 bg-emerald-500/15'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-white">بال باي (PalPay)</span>
                  <span className="text-[10px] text-slate-400">تطبيق أو نقطة بيع</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSettlementModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={handlePerformSettlement}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                تأكيد السداد وتصفير الذمم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
