import React, { useState } from 'react';
import {
  B2BMerchant,
  Driver,
  Order,
  PricingConfig,
  WalletTransaction,
} from '../../types';
import { PALESTINIAN_CHECKPOINTS, PALESTINIAN_CITIES } from '../../utils/geo';
import { calculateDeliveryPrice } from '../../utils/pricing';
import { PalestineMap } from '../Map/PalestineMap';
import {
  Sliders,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Users,
  Briefcase,
  FileText,
  AlertTriangle,
  CheckCircle,
  Truck,
  RefreshCw,
  Fuel,
  Activity,
  Layers,
  Lock,
  Unlock,
  Compass,
} from 'lucide-react';
import { TechnicalRoadmap } from './TechnicalRoadmap';

interface AdminDashboardProps {
  orders: Order[];
  drivers: Driver[];
  transactions: WalletTransaction[];
  b2bMerchants: B2BMerchant[];
  pricingConfig: PricingConfig;
  onUpdatePricingConfig: (newConfig: PricingConfig) => void;
  onToggleFreezeDriver: (driverId: string) => void;
  onLogSettlement: (driverId: string, amount: number) => void;
  onAddMerchant: (merchant: B2BMerchant) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  drivers,
  transactions,
  b2bMerchants,
  pricingConfig,
  onUpdatePricingConfig,
  onToggleFreezeDriver,
  onLogSettlement,
  onAddMerchant,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'financial' | 'pricing' | 'monitoring' | 'b2b' | 'legal' | 'roadmap'>('financial');

  // Pricing config editing state
  const [baseFare, setBaseFare] = useState<number>(pricingConfig.baseFare);
  const [perKmRate, setPerKmRate] = useState<number>(pricingConfig.perKmRate);
  const [waitingRate, setWaitingRate] = useState<number>(pricingConfig.waitingRatePerMin);
  const [dieselPrice, setDieselPrice] = useState<number>(pricingConfig.dieselBenchmarkPrice);
  const [backhaulDiscount, setBackhaulDiscount] = useState<number>(pricingConfig.backhaulDiscountPct);
  const [checkpointSurge, setCheckpointSurge] = useState<number>(pricingConfig.checkpointDelaySurcharge);
  const [creditLimit, setCreditLimit] = useState<number>(pricingConfig.maxDriverDebtLimit);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // New Merchant form state
  const [showNewMerchantModal, setShowNewMerchantModal] = useState<boolean>(false);
  const [mName, setMName] = useState<string>('');
  const [mSector, setMSector] = useState<string>('');
  const [mCity, setMCity] = useState<string>('رام الله');
  const [mOrders, setMOrders] = useState<number>(100);

  // Compute Financial Aggregates
  const totalVolume = orders.reduce((sum, o) => sum + o.priceBreakdown.finalCustomerPrice, 0);
  const totalPlatformRevenue = orders.reduce((sum, o) => sum + o.priceBreakdown.platformRevenue, 0);
  const totalDriverNetRevenue = orders.reduce((sum, o) => sum + o.priceBreakdown.driverNetRevenue, 0);
  const totalDriverDebtOwed = drivers.reduce((sum, d) => (d.walletBalance < 0 ? sum + Math.abs(d.walletBalance) : sum), 0);
  const frozenDriversCount = drivers.filter((d) => d.isFrozen).length;

  // Real-time calculation preview for Hebron -> Ramallah benchmark journey
  const previewBenchmark = calculateDeliveryPrice(65, 80, 'medium', 'backhaul', false, {
    baseFare,
    perKmRate,
    waitingRatePerMin: waitingRate,
    dieselBenchmarkPrice: dieselPrice,
    backhaulDiscountPct: backhaulDiscount,
    checkpointDelaySurcharge: checkpointSurge,
    maxDriverDebtLimit: creditLimit,
  });

  const previewExpress = calculateDeliveryPrice(65, 80, 'medium', 'express', false, {
    baseFare,
    perKmRate,
    waitingRatePerMin: waitingRate,
    dieselBenchmarkPrice: dieselPrice,
    checkpointDelaySurcharge: checkpointSurge,
  });

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePricingConfig({
      ...pricingConfig,
      baseFare,
      perKmRate,
      waitingRatePerMin: waitingRate,
      dieselBenchmarkPrice: dieselPrice,
      backhaulDiscountPct: backhaulDiscount,
      checkpointDelaySurcharge: checkpointSurge,
      maxDriverDebtLimit: creditLimit,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreateMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName) return;
    const newM: B2BMerchant = {
      id: `m_${Date.now()}`,
      name: mName,
      sector: mSector || 'تجارة وتوزيع',
      city: mCity,
      monthlyOrders: mOrders,
      discountRate: mOrders > 200 ? 0.12 : 0.08,
      activeContract: true,
    };
    onAddMerchant(newM);
    setShowNewMerchantModal(false);
    setMName('');
    setMSector('');
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              لوحة التحكم والإدارة المركزية
            </span>
            <span className="text-xs text-slate-400">الضفة الغربية والقدس</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            إدارة المنصة، خوارزمية التسعير، والرقابة المالية
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            مراقبة العمولات الحية، إدارة مديونية السائقين بالكاش، وضبط تسعيرة النقل وفق مؤشرات الوقود الرسمية.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto gap-1">
          <button
            onClick={() => setActiveAdminTab('financial')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeAdminTab === 'financial'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>الأرباح والذمم</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('pricing')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeAdminTab === 'pricing'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>محرك التسعير</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('monitoring')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeAdminTab === 'monitoring'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>مراقبة الأسطول</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('b2b')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeAdminTab === 'b2b'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>عقود الشركات (B2B)</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('legal')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeAdminTab === 'legal'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الشروط والضمان القانوني</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('roadmap')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeAdminTab === 'roadmap'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>خارطة طريق التطوير التقني</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>صافي أرباح المنصة (عمولات):</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {totalPlatformRevenue.toFixed(1)} ₪
          </div>
          <div className="text-[10px] text-slate-500 mt-1">15% رحلات عودة • 20% مباشر</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>إجمالي حجم التداول (GMV):</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {totalVolume.toFixed(1)} ₪
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{orders.length} طلبات مسجلة</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ذمم الكاش المعلقة بالسوق:</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {totalDriverDebtOwed.toFixed(1)} ₪
          </div>
          <div className="text-[10px] text-slate-500 mt-1">عمولات بذمة السائقين (COD)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>حسابات السائقين المجمدة:</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {frozenDriversCount} سائق
          </div>
          <div className="text-[10px] text-slate-500 mt-1">تجاوزوا حد المديونية ({pricingConfig.maxDriverDebtLimit} ₪)</div>
        </div>
      </div>

      {/* TAB 1: FINANCIAL & DRIVER LEDGERS */}
      {activeAdminTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Driver Debt Ledger Table */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>جدول ذمم السائقين وتسوية الكاش (Driver Debt Ledger)</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  مراقبة السائقين الذين يقبضون كاش عند تسليم الطرد وتتراكم عليهم نسبة المنصة
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">الكابتن</th>
                    <th className="py-2.5 px-3">نوع المركبة</th>
                    <th className="py-2.5 px-3">رصيد المحفظة</th>
                    <th className="py-2.5 px-3">حالة الحساب</th>
                    <th className="py-2.5 px-3">إجراءات الإدارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {drivers.map((drv) => {
                    const isDebt = drv.walletBalance < 0;
                    return (
                      <tr key={drv.id} className="hover:bg-slate-950/40 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{drv.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{drv.phone}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-slate-300">
                            {drv.vehicleType === 'servis' ? 'سرفيس عمومي' : 'سيارة خاصة'}
                          </span>
                          <div className="text-[10px] text-slate-500">{drv.vehiclePlate}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isDebt ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {drv.walletBalance.toFixed(1)} ₪
                          </span>
                          <div className="text-[10px] text-slate-500">حد: {drv.creditLimit} ₪</div>
                        </td>

                        <td className="py-3 px-3">
                          {drv.isFrozen ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                              مجمد لتجاوز الدين
                            </span>
                          ) : isDebt ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-medium">
                              مديونية نشطة
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-medium">
                              حساب سليم
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {isDebt && (
                              <button
                                onClick={() => onLogSettlement(drv.id, Math.abs(drv.walletBalance))}
                                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition"
                                title="تسجيل سداد مستحقات الكاش"
                              >
                                تسوية كاملة
                              </button>
                            )}

                            <button
                              onClick={() => onToggleFreezeDriver(drv.id)}
                              className={`p-1.5 rounded transition ${
                                drv.isFrozen
                                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                              }`}
                              title={drv.isFrozen ? 'إلغاء التجميد يدوياً' : 'تجميد الحساب يدوياً'}
                            >
                              {drv.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Ledger Stream */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>سجل التدفق المالي الحي (Ledger Stream)</span>
            </h2>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{tx.note}</span>
                    <span
                      className={`font-mono font-bold ${
                        tx.amount < 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount.toFixed(1)}` : tx.amount.toFixed(1)} ₪
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{tx.timestamp}</span>
                    <span>الرصيد بعد الحركة: {tx.balanceAfter.toFixed(1)} ₪</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DYNAMIC PRICING ENGINE CONTROLS */}
      {activeAdminTab === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form */}
          <form onSubmit={handleSavePricing} className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>معايرة خوارزمية التسعير التلقائي (Dynamic Pricing)</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  تعديل الأسعار بضغطة زر للتكيف مع أسعار السولار ومواسم الأعياد وأزمات الحواجز
                </p>
              </div>

              {saveSuccess && (
                <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  تم حفظ وتفعيل الإعدادات
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Base fare */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">رسوم فتح العداد والقبول:</span>
                  <span className="font-mono font-bold text-emerald-400">{baseFare} ₪</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={baseFare}
                  onChange={(e) => setBaseFare(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500">تغطي تكلفة وصول السائق لنقطة الاستلام</span>
              </div>

              {/* Per km rate */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">سعر الكيلومتر الفعلي:</span>
                  <span className="font-mono font-bold text-emerald-400">{perKmRate.toFixed(2)} ₪/كم</span>
                </div>
                <input
                  type="range"
                  min="1.50"
                  max="3.50"
                  step="0.05"
                  value={perKmRate}
                  onChange={(e) => setPerKmRate(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500">يتراوح رسمياً بين 2.20 و 2.50 ₪/كم</span>
              </div>

              {/* Waiting / Delay minute rate */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">رسوم الانتظار والأزمات:</span>
                  <span className="font-mono font-bold text-emerald-400">{waitingRate.toFixed(2)} ₪/دقيقة</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={waitingRate}
                  onChange={(e) => setWaitingRate(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500">التعرفة المعتمدة: 0.30 ₪ لكل دقيقة انتظار</span>
              </div>

              {/* Diesel benchmark index */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">سعر لتر السولار المرجعي:</span>
                  <span className="font-mono font-bold text-emerald-400">{dieselPrice.toFixed(2)} ₪/لتر</span>
                </div>
                <input
                  type="range"
                  min="6.50"
                  max="9.50"
                  step="0.05"
                  value={dieselPrice}
                  onChange={(e) => setDieselPrice(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500">نشرة الهيئة العامة للبترول الرسمية</span>
              </div>

              {/* Backhaul discount percentage */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">نسبة خصم رحلة العودة (Backhaul):</span>
                  <span className="font-mono font-bold text-emerald-400">{(backhaulDiscount * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.50"
                  step="0.05"
                  value={backhaulDiscount}
                  onChange={(e) => setBackhaulDiscount(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500">الخصم التشجيعي الممنوح للزبون</span>
              </div>

              {/* Checkpoint Surge Multiplier */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">مضاعف أزمة الحواجز (Surge):</span>
                  <span className="font-mono font-bold text-emerald-400">{checkpointSurge.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="1.6"
                  step="0.05"
                  value={checkpointSurge}
                  onChange={(e) => setCheckpointSurge(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500">عند رصد أزمة تتجاوز 30 دقيقة (واد النار/زعترة)</span>
              </div>

              {/* Max Driver Debt Limit */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 sm:col-span-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">الحد الأقصى لمديونية السائق بالكاش (Credit Limit):</span>
                  <span className="font-mono font-bold text-rose-400">{creditLimit} ₪</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="300"
                  step="25"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseInt(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500">
                  عند وصول ديون السائق لهذا الرقم يجمد حسابه تلقائياً حتى السداد
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تطبيق وتحديث المعايير على النظام فوراً</span>
            </button>
          </form>

          {/* Live Simulator Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-emerald-400" />
                  <span>محاكاة التأثير الحي (سيناريو الخليل - رام الله)</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">65 كم • 80 دقيقة</span>
              </div>

              {/* Express preview */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">الطلب المباشر والمستعجل:</span>
                  <span className="text-base font-black text-white font-mono">
                    {previewExpress.finalCustomerPrice.toFixed(1)} ₪
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <div>عمولة المنصة (20%): <strong className="text-emerald-400 font-mono">{previewExpress.platformRevenue.toFixed(1)} ₪</strong></div>
                  <div>صافي الكابتن (80%): <strong className="text-white font-mono">{previewExpress.driverNetRevenue.toFixed(1)} ₪</strong></div>
                </div>
              </div>

              {/* Backhaul preview */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400">طلب رحلة العودة (Backhaul):</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {previewBenchmark.finalCustomerPrice.toFixed(1)} ₪
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t border-emerald-500/20">
                  <div>عمولة المنصة (15%): <strong className="text-white font-mono">{previewBenchmark.platformRevenue.toFixed(1)} ₪</strong></div>
                  <div>صافي الكابتن (85%): <strong className="text-emerald-300 font-mono">{previewBenchmark.driverNetRevenue.toFixed(1)} ₪</strong></div>
                </div>
                <div className="text-[10px] text-emerald-300/80 pt-1">
                  ✓ تكلفة وقود السولار التقديرية للرحلة: <strong>{previewBenchmark.fuelEstimatedCost.toFixed(1)} ₪</strong>. يتبقى للسائق ربح صافي إضافي: <strong>{previewBenchmark.driverNetProfitAboveFuel.toFixed(1)} ₪</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FLEET & ROUTE SAFETY MONITORING */}
      {activeAdminTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-96">
              <PalestineMap showCheckpoints={true} showCorridor={true} />
            </div>

            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>حالة الحواجز ونقاط الاختناق المرورية</span>
              </h2>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {PALESTINIAN_CHECKPOINTS.map((cp) => (
                  <div
                    key={cp.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{cp.nameAr}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          cp.status === 'crowded'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {cp.status === 'crowded' ? 'أزمة خانقة' : 'سالك'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{cp.locationNear}</div>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>تأخير متوقع: {cp.delayEstimateMins} دقيقة</span>
                      <span>{cp.reportedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: B2B ENTERPRISE MERCHANTS */}
      {activeAdminTab === 'b2b' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>عقود المتاجر والشركات والمصانع (B2B Partnerships)</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                تقديم اشتراكات وأسعار شحن مخفضة للمتاجر الإلكترونية والمصانع التي تشحن يومياً بين المدن
              </p>
            </div>
            <button
              onClick={() => setShowNewMerchantModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              + إضافة عقد متجر جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {b2bMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{merchant.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    عقد نشط
                  </span>
                </div>
                <div className="text-slate-400">{merchant.sector} • {merchant.city}</div>
                <div className="flex justify-between pt-2 border-t border-slate-800/60 text-slate-300">
                  <span>الطرود الشهرية: <strong>{merchant.monthlyOrders} طرد</strong></span>
                  <span className="text-emerald-400 font-bold">خصم {(merchant.discountRate * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: LEGAL TERMS & CARGO PROTECTION */}
      {activeAdminTab === 'legal' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              الشروط والأحكام والضمانات القانونية وحماية الطرود
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h3 className="font-bold text-white text-sm">1. نطاق المسؤولية وضمان سلامة الطرد</h3>
              <p>
                تضمن المنصة تعويض صاحب الطرد في حال حدوث أي تلف مادي مباشر أو فقدان للطرد ناتج عن إهمال السائق، وذلك بحد أقصى يعادل قيمة التصريح المسجلة للطلب (حتى 1000 شيكل)، شريطة إبلاغ الدعم الفني فور استلام الطرد وعدم إعطاء رمز التسليم السري (PIN) إلا بعد معاينة الطرد والتأكد من سلامته.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h3 className="font-bold text-white text-sm">2. المواد المحظورة والامتثال لتعليمات النقل</h3>
              <p>
                يُحظر منعاً باتاً نقل المواد القابلة للاشتعال، الألعاب النارية، الأسلحة، والمواد غير المصرح بها رسمياً وفق قوانين وزارة النقل والمواصلات الفلسطينية. يتحمل الراسل المسؤولية الجنائية والمدنية الكاملة في حال إخفاء محتويات الطرد.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h3 className="font-bold text-white text-sm">3. الظروف القاهرة والحواجز العسكرية</h3>
              <p>
                نظراً لخصوصية الطرق في الضفة الغربية وما قد يطرأ من إغلاقات مفاجئة على حواجز مثل واد النار وزعترة، لا تعتبر المنصة مسؤولة عن التأخير الناتج عن أسباب قاهرة خارجة عن إرادة السائق، مع استمرار حفظ الطرد وإعادته أو توصيله فور فتح الطريق.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h3 className="font-bold text-white text-sm">4. ضوابط التحصيل المالي ومكافحة التهرب</h3>
              <p>
                يلتزم الكابتن بتسديد عمولة المنصة الناتجة عن طلبات الكاش فور وصول مديونيته إلى السقف المحدد ({pricingConfig.maxDriverDebtLimit} شيكل). يعتبر استلام الكاش من الزبون أمانة مالية في ذمة السائق لصالح المنصة ويجمد حسابه آلياً عند الإخلال بها.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TECHNICAL & PRODUCT ROADMAP */}
      {activeAdminTab === 'roadmap' && <TechnicalRoadmap />}

      {/* MODAL: ADD B2B MERCHANT */}
      {showNewMerchantModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span>إضافة عقد متجر أو شركة جديدة (B2B)</span>
            </h3>

            <form onSubmit={handleCreateMerchant} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">اسم المتجر أو المنشأة:</label>
                <input
                  type="text"
                  required
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  placeholder="مثال: شركة القدس للتجارة"
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">النشاط التجاري:</label>
                <input
                  type="text"
                  required
                  value={mSector}
                  onChange={(e) => setMSector(e.target.value)}
                  placeholder="مثال: تجارة إلكترونية، أحذية، مواد غذائية"
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">المدينة الرئيسية:</label>
                <select
                  value={mCity}
                  onChange={(e) => setMCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:border-emerald-500"
                >
                  {PALESTINIAN_CITIES.map((c) => (
                    <option key={c.id} value={c.nameAr}>
                      {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">الطرود الشهرية المتوقعة:</label>
                <input
                  type="number"
                  min="20"
                  max="5000"
                  step="10"
                  value={mOrders}
                  onChange={(e) => setMOrders(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewMerchantModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
                >
                  حفظ العقد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
