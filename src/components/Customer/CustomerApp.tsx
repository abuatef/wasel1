import React, { useState, useEffect } from 'react';
import {
  CityData,
  DeliveryType,
  Order,
  ParcelCategory,
  ParcelSize,
  PaymentMethod,
  PricingConfig,
} from '../../types';
import { PALESTINIAN_CITIES, getCheckpointsForRoute, getIntercityDistance } from '../../utils/geo';
import { calculateDeliveryPrice } from '../../utils/pricing';
import { interpolateDriverRouteLocation } from '../../utils/simulation';
import { PalestineMap } from '../Map/PalestineMap';
import {
  Package,
  Clock,
  Shield,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Truck,
  ArrowRightLeft,
  Banknote,
  Smartphone,
  Info,
  Car,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Radio,
  Gauge,
  Compass,
} from 'lucide-react';

interface CustomerAppProps {
  orders: Order[];
  pricingConfig: PricingConfig;
  onCreateOrder: (newOrder: Order) => void;
  onSimulateAdvanceOrder?: (orderId: string) => void;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({
  orders,
  pricingConfig,
  onCreateOrder,
  onSimulateAdvanceOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'tracking'>('create');

  // Form State
  const [fromCityId, setFromCityId] = useState<string>('ramallah');
  const [toCityId, setToCityId] = useState<string>('hebron');
  const [pickupAddress, setPickupAddress] = useState<string>('شارع الإرسال، بالقرب من دوار المنارة');
  const [dropoffAddress, setDropoffAddress] = useState<string>('دوار ابن رشد، مركز الخليل التجاري');
  const [recipientName, setRecipientName] = useState<string>('إبراهيم الشريف');
  const [recipientPhone, setRecipientPhone] = useState<string>('0569-123789');
  const [category, setCategory] = useState<ParcelCategory>('spare_parts');
  const [size, setSize] = useState<ParcelSize>('medium');
  const [weightKg, setWeightKg] = useState<number>(5.0);
  const [isFragile, setIsFragile] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('طرد مستعجل، يرجى الحذر أثناء النقل');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('backhaul');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  // Compute Route & Pricing preview in real time
  const routeDist = getIntercityDistance(fromCityId, toCityId);
  const activeCheckpoints = getCheckpointsForRoute(fromCityId, toCityId);
  const hasSevereDelay = activeCheckpoints.some((cp) => cp.status === 'crowded');

  const priceCalculation = calculateDeliveryPrice(
    routeDist.km,
    routeDist.mins,
    size,
    deliveryType,
    hasSevereDelay,
    pricingConfig
  );

  const expressComparison = calculateDeliveryPrice(
    routeDist.km,
    routeDist.mins,
    size,
    'express',
    hasSevereDelay,
    pricingConfig
  );

  const backhaulComparison = calculateDeliveryPrice(
    routeDist.km,
    routeDist.mins,
    size,
    'backhaul',
    hasSevereDelay,
    pricingConfig
  );

  const handleSwapCities = () => {
    const temp = fromCityId;
    setFromCityId(toCityId);
    setToCityId(temp);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const trackingCode = `WSL-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      trackingNumber: trackingCode,
      customerName: 'طارق عبد الله (الزبون الحالي)',
      customerPhone: '0599-556677',
      fromCityId,
      toCityId,
      pickupAddressDetails: pickupAddress,
      dropoffAddressDetails: dropoffAddress,
      recipientName,
      recipientPhone,
      category,
      size,
      weightKg,
      notes,
      isFragile,
      deliveryType,
      paymentMethod,
      priceBreakdown: priceCalculation,
      status: 'pending',
      securityPin: randomPin,
      createdAt: 'الآن',
      delayReportedMinutes: hasSevereDelay ? activeCheckpoints[0]?.delayEstimateMins : 0,
      checkpointName: hasSevereDelay ? activeCheckpoints[0]?.nameAr : undefined,
    };

    onCreateOrder(newOrder);
    setSelectedOrderId(newOrder.id);
    setOrderSuccessMessage(`تم إنشاء طلبك بنجاح برقم تتبع ${trackingCode}`);
    setActiveTab('tracking');

    setTimeout(() => {
      setOrderSuccessMessage(null);
    }, 5000);
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Real-time Live GPS Simulation state for in_transit orders
  const [simulatedProgress, setSimulatedProgress] = useState<number>(0.42);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Auto-progress simulation effect during in_transit state
  useEffect(() => {
    if (!isSimulating || !selectedOrder || selectedOrder.status !== 'in_transit') return;

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        const next = prev + 0.012 * simSpeed;
        if (next >= 1.0) {
          return 1.0;
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, selectedOrder?.status, simSpeed]);

  const liveTelemetry = interpolateDriverRouteLocation(
    selectedOrder?.fromCityId || 'ramallah',
    selectedOrder?.toCityId || 'hebron',
    simulatedProgress
  );
  const categoriesConfig: { id: ParcelCategory; labelAr: string; icon: string }[] = [
    { id: 'spare_parts', labelAr: 'قطع غيار سيارات', icon: '⚙️' },
    { id: 'documents', labelAr: 'أوراق ومستندات', icon: '📄' },
    { id: 'apparel', labelAr: 'ملابس وأحذية', icon: '👕' },
    { id: 'electronics', labelAr: 'إلكترونيات وهواتف', icon: '💻' },
    { id: 'cartons', labelAr: 'كرتونة شحن بضائع', icon: '📦' },
    { id: 'food_produce', labelAr: 'أغذية وحلويات', icon: '🍯' },
  ];

  const sizesConfig: { id: ParcelSize; labelAr: string; desc: string; badge: string }[] = [
    { id: 'small', labelAr: 'صغير (ظرف / كيس)', desc: 'مستندات، هاتف، مستلزمات خفيفة', badge: '1.0x' },
    { id: 'medium', labelAr: 'متوسط (كرتونة عادية)', desc: 'كرتونة حتى 10 كغم، طرد قياسي', badge: '1.0x' },
    { id: 'large', labelAr: 'كبير (كرتونة ضخمة)', desc: 'قطع غيار ثقيلة، طرد كبير حتى 25 كغم', badge: '1.25x' },
    { id: 'trunk', labelAr: 'صندوق كامل (Trunk)', desc: 'حجز كامل مساحة الصندوق الخلفي للسيارة', badge: '1.6x' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              خدمة التوصيل بين المحافظات
            </span>
            <span className="text-xs text-slate-400">فلسطين (الضفة الغربية والقدس)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            شحن الطرود والبضائع الذكي مع رحلات العودة (Backhaul)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            استفد من سيارات العمومي والسيارات الخاصة العائدة لمدينتها بتكلفة أقل بنسبة تصل إلى 35%، أو اطلب رحلة مستعجلة مخصصة.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'create'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>طلب إرسال طرد</span>
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'tracking'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>تتبع الطرود ({orders.length})</span>
          </button>
        </div>
      </div>

      {orderSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span className="text-sm font-medium">{orderSuccessMessage}</span>
        </div>
      )}

      {/* TAB 1: CREATE DELIVERY ORDER */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Column */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
            {/* Route Selection Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>1. مسار الرحلة ونقاط الاستلام والتسليم</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
                <div className="sm:col-span-5 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">من مدينة (الاستلام):</label>
                  <select
                    value={fromCityId}
                    onChange={(e) => setFromCityId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {PALESTINIAN_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr} ({c.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1 flex justify-center pt-4 sm:pt-4">
                  <button
                    type="button"
                    onClick={handleSwapCities}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="تبديل المدن"
                    aria-label="تبديل مدينتي الاستلام والتسليم"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">إلى مدينة (التسليم):</label>
                  <select
                    value={toCityId}
                    onChange={(e) => setToCityId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {PALESTINIAN_CITIES.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.id === fromCityId}>
                        {c.nameAr} ({c.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exact address fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-slate-400">عنوان الاستلام بالتفصيل:</label>
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="الشارع، المعلم، رقم البناية"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">عنوان التسليم بالتفصيل:</label>
                  <input
                    type="text"
                    required
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    placeholder="الشارع، المعلم، رقم البناية"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Highway distance & checkpoints badge */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">
                    المسافة الحقيقية عبر الشوارع: <strong>{routeDist.km} كم</strong>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">
                    الوقت التقديري: <strong>{routeDist.mins} دقيقة</strong>
                  </span>
                </div>

                {hasSevereDelay ? (
                  <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    <span>تنبيه: {activeCheckpoints[0]?.nameAr} يشهد أزمة مرورية</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حركة السير بين المدينتين سالكة</span>
                  </div>
                )}
              </div>
            </div>

            {/* Parcel Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>2. مواصفات ونوع الطرد</span>
              </h2>

              {/* Category pills */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">تصنيف البضاعة / الطرد:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categoriesConfig.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-right transition flex items-center gap-2 text-xs font-medium ${
                        category === cat.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span>{cat.labelAr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size cards */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">حجم الطرد المناسب للسيارة:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {sizesConfig.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id)}
                      className={`p-3 rounded-xl border text-right transition flex flex-col justify-between ${
                        size === s.id
                          ? 'border-emerald-500 bg-emerald-500/15 shadow-sm'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{s.labelAr}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {s.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight and Fragile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">الوزن التقديري:</span>
                    <span className="font-bold text-emerald-400 font-mono">{weightKg} كغم</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="50"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">طرد قابل للكسر / حساس</div>
                    <div className="text-[10px] text-slate-400">تنبيه الكابتن للتعامل بعناية فائقة</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFragile}
                    onChange={(e) => setIsFragile(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-slate-400">اسم المستلم عند الوصول:</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="الاسم الكامل"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">رقم هاتف المستلم (للتسليم):</label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="059X-XXXXXX أو 056X-XXXXXX"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Type: Express vs Backhaul Carpooling */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-emerald-400" />
                  <span>3. نوع الرحلة والنموذج التشغيلي</span>
                </span>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  خوارزمية رحلات العودة
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Backhaul option */}
                <button
                  type="button"
                  onClick={() => setDeliveryType('backhaul')}
                  className={`p-4 rounded-xl border text-right transition relative overflow-hidden flex flex-col justify-between ${
                    deliveryType === 'backhaul'
                      ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/50 shadow-lg'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="absolute -top-3 -left-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-extrabold px-5 py-1 rotate-[-12deg] shadow">
                    وفّر 35%
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-white">رحلة عودة تشاركية (Backhaul)</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      استغلال سيارة عمومي أو خاصة عائدة إلى {PALESTINIAN_CITIES.find((c) => c.id === toCityId)?.nameAr} فارغة. تسليم باب إلى باب وسعر مدعوم واقتصادي.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">التكلفة الإجمالية:</span>
                    <div>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        {backhaulComparison.finalCustomerPrice} ₪
                      </span>
                      <span className="text-xs text-slate-500 line-through mr-2 font-mono">
                        {expressComparison.finalCustomerPrice} ₪
                      </span>
                    </div>
                  </div>
                </button>

                {/* Direct Express option */}
                <button
                  type="button"
                  onClick={() => setDeliveryType('express')}
                  className={`p-4 rounded-xl border text-right transition flex flex-col justify-between ${
                    deliveryType === 'express'
                      ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/50 shadow-lg'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-400" />
                      <span className="text-sm font-bold text-white">طلب مباشر ومستعجل (Direct Express)</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      سيارة تخرج فوراً ومخصوصاً لطردك بدون انتظار أي رحلة عودة أو نقاط توقف إضافية على الطريق.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">التكلفة الإجمالية:</span>
                    <span className="text-lg font-black text-white font-mono">
                      {expressComparison.finalCustomerPrice} ₪
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>4. طريقة الدفع والأمان المالي</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`p-3 rounded-xl border text-right transition flex flex-col gap-1 ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-emerald-500 bg-emerald-500/15'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">الدفع كاش (COD)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">الدفع نقداً للكابتن عند استلام الطرد</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('jawwal_pay')}
                  className={`p-3 rounded-xl border text-right transition flex flex-col gap-1 ${
                    paymentMethod === 'jawwal_pay'
                      ? 'border-emerald-500 bg-emerald-500/15'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">جوال باي (Jawwal Pay)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">دفع فوري آمن ومحجوز كوسيط (Escrow)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('palpay')}
                  className={`p-3 rounded-xl border text-right transition flex flex-col gap-1 ${
                    paymentMethod === 'palpay'
                      ? 'border-emerald-500 bg-emerald-500/15'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">بال باي (PalPay) / بطاقة</span>
                  </div>
                  <span className="text-[11px] text-slate-400">محفظة بال باي أو بطاقات البنوك</span>
                </button>
              </div>

              {paymentMethod !== 'cash_on_delivery' && (
                <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-xl text-xs text-sky-200 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>حماية الدفع الإلكتروني (Escrow):</strong> سيتم حجز المبلغ مؤقتاً في حساب المنصة ولن يتم تحويله لمحفظة السائق إلا بعد إدخال رمز الأمان السري وتأكيد استلام الطرد بنجاح.
                  </span>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition shadow-xl flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <Package className="w-5 h-5" />
              <span>تأكيد الطلب وحجز الرحلة ({priceCalculation.finalCustomerPrice} ₪)</span>
            </button>
          </form>

          {/* Real-time Dynamic Price Breakdown & Route Preview (Right Column) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Map Preview */}
            <div className="h-64 sm:h-72">
              <PalestineMap
                highlightRoute={{ fromCityId, toCityId }}
                showCheckpoints={true}
                showCorridor={deliveryType === 'backhaul'}
              />
            </div>

            {/* Transparent Dynamic Pricing Engine Breakdown Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <h3 className="text-sm font-bold text-white">حاسبة التسعير الديناميكي المعتمدة</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">وزارة النقل / وقود 7.85 ₪</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">رسوم فتح العداد والتشغيل (ثابت):</span>
                  <span className="font-mono font-medium text-white">{priceCalculation.baseFare.toFixed(2)} ₪</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <div>
                    <span className="text-slate-400">مسافة الطريق الفعلية:</span>
                    <span className="text-[10px] text-slate-500 mr-1 font-mono">
                      ({priceCalculation.distanceKm} كم × {pricingConfig.perKmRate} ₪/كم)
                    </span>
                  </div>
                  <span className="font-mono font-medium text-white">{priceCalculation.distanceCost.toFixed(2)} ₪</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <div>
                    <span className="text-slate-400">رسوم الانتظار والأزمات:</span>
                    <span className="text-[10px] text-slate-500 mr-1 font-mono">
                      ({priceCalculation.estimatedMinutes} دقيقة × {pricingConfig.waitingRatePerMin} ₪/د)
                    </span>
                  </div>
                  <span className="font-mono font-medium text-white">{priceCalculation.timeDelayCost.toFixed(2)} ₪</span>
                </div>

                {priceCalculation.sizeMultiplier > 1.0 && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60 text-amber-300">
                    <span>معامل حجم/وزن الطرد الإضافي:</span>
                    <span className="font-mono font-medium">{priceCalculation.sizeMultiplier}x</span>
                  </div>
                )}

                {priceCalculation.isCheckpointActive && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60 text-rose-300">
                    <span>معامل أزمات الحواجز (Dynamic Surcharge):</span>
                    <span className="font-mono font-medium">+{priceCalculation.checkpointSurcharge.toFixed(2)} ₪</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 text-slate-400">
                  <span>سعر الطلب المباشر الكامل:</span>
                  <span className="font-mono">{priceCalculation.rawExpressTotal.toFixed(2)} ₪</span>
                </div>

                {deliveryType === 'backhaul' && (
                  <div className="flex justify-between items-center py-1.5 px-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-bold">
                    <span>خصم رحلة العودة (Backhaul Discount 35%):</span>
                    <span className="font-mono">-{priceCalculation.backhaulDiscountAmount.toFixed(2)} ₪</span>
                  </div>
                )}
              </div>

              {/* Total final */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">المبلغ الإجمالي المطلوب:</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                    {priceCalculation.finalCustomerPrice.toFixed(1)} ₪
                  </div>
                </div>
                <div className="text-left text-[11px] text-slate-400">
                  <div>طريقة الدفع: <span className="text-white font-medium">{paymentMethod === 'cash_on_delivery' ? 'كاش عند الاستلام' : paymentMethod === 'jawwal_pay' ? 'جوال باي' : 'بال باي'}</span></div>
                  <div>نوع الرحلة: <span className="text-emerald-400 font-semibold">{deliveryType === 'backhaul' ? 'تشاركية (عودة)' : 'مباشرة ومستعجلة'}</span></div>
                </div>
              </div>

              {/* Platform & Driver Split Transparency */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 mb-1">تقسيم التدفق المالي التلقائي:</div>
                <div className="flex justify-between">
                  <span>صافي ربح السائق (يغطي الوقود وزيادة):</span>
                  <span className="font-mono text-emerald-400 font-bold">{priceCalculation.driverNetRevenue.toFixed(1)} ₪</span>
                </div>
                <div className="flex justify-between">
                  <span>عمولة المنصة ({priceCalculation.platformCommissionPct * 100}%):</span>
                  <span className="font-mono text-slate-300 font-medium">{priceCalculation.platformRevenue.toFixed(1)} ₪</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE PARCEL TRACKING */}
      {activeTab === 'tracking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Order list and selector */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>قائمة طرودك النشطة ({orders.length})</span>
            </h2>

            <div className="space-y-3">
              {orders.map((order) => {
                const isSelected = order.id === selectedOrder?.id;
                const fromCity = PALESTINIAN_CITIES.find((c) => c.id === order.fromCityId);
                const toCity = PALESTINIAN_CITIES.find((c) => c.id === order.toCityId);

                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full p-4 rounded-xl border text-right transition flex flex-col gap-2 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 shadow-md'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">{order.trackingNumber}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          order.status === 'delivered'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : order.status === 'in_transit'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {order.status === 'delivered'
                          ? 'تم التسليم'
                          : order.status === 'in_transit'
                          ? 'على الطريق'
                          : order.status === 'matched'
                          ? 'تم تعيين السائق'
                          : 'قيد المطابقة'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{fromCity?.nameAr}</span>
                      <span className="text-slate-500">←</span>
                      <span>{toCity?.nameAr}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>{order.notes?.slice(0, 24)}...</span>
                      <span className="font-mono font-bold text-white">{order.priceBreakdown.finalCustomerPrice} ₪</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Order Detail View */}
          <div className="lg:col-span-8 space-y-6">
            {selectedOrder ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {selectedOrder.trackingNumber}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {selectedOrder.deliveryType === 'backhaul' ? 'رحلة عودة تشاركية' : 'طلب مباشر مستعجل'}
                      </span>
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      من {PALESTINIAN_CITIES.find((c) => c.id === selectedOrder.fromCityId)?.nameAr} إلى{' '}
                      {PALESTINIAN_CITIES.find((c) => c.id === selectedOrder.toCityId)?.nameAr}
                    </div>
                  </div>

                  {/* Security PIN for handover */}
                  <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-emerald-500/40 text-center">
                    <div className="text-[10px] text-slate-400">رمز التسليم السري (أعطه للكابتن فقط):</div>
                    <div className="text-xl font-black text-emerald-400 font-mono tracking-widest mt-0.5">
                      {selectedOrder.securityPin}
                    </div>
                  </div>
                </div>

                {/* Tracking Progress Stepper */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-300">مراحل رحلة الطرد الحية:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        selectedOrder.status !== 'pending'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">1. إنشاء الطلب</div>
                      <div className="text-[10px] mt-0.5 text-slate-400">{selectedOrder.createdAt}</div>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        selectedOrder.driverId
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">2. قبول الكابتن</div>
                      <div className="text-[10px] mt-0.5 text-slate-400">
                        {selectedOrder.driverName || 'جاري التعيين'}
                      </div>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        selectedOrder.status === 'in_transit' || selectedOrder.status === 'delivered'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">3. على الطريق</div>
                      <div className="text-[10px] mt-0.5 text-slate-400">
                        {selectedOrder.checkpointName ? `تأخير: ${selectedOrder.checkpointName}` : 'سالك'}
                      </div>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        selectedOrder.status === 'delivered'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">4. تم التسليم</div>
                      <div className="text-[10px] mt-0.5 text-slate-400">
                        {selectedOrder.deliveredAt || 'قيد الوصول'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Real-Time Driver Telemetry HUD (for in_transit tracking) */}
                {selectedOrder.status === 'in_transit' && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold text-white">تتبع GPS الحي والمباشر لمركبة الكابتن</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                          بث حي متصل
                        </span>
                      </div>

                      {/* Simulation Controls: Play/Pause, Speed, Reset */}
                      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsSimulating(!isSimulating)}
                          className={`p-1.5 rounded text-xs transition flex items-center gap-1 ${
                            isSimulating
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                          title={isSimulating ? 'إيقاف مؤقت' : 'تشغيل المحاكاة'}
                          aria-label={isSimulating ? 'إيقاف مؤقت للتتبع الحي' : 'تشغيل التتبع الحي'}
                        >
                          {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{isSimulating ? 'مباشر' : 'إيقاف'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 4 : 1)}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] font-mono font-bold"
                          title="تغيير سرعة المحاكاة"
                          aria-label="تغيير سرعة المحاكاة"
                        >
                          {simSpeed}x
                        </button>

                        <button
                          type="button"
                          onClick={() => setSimulatedProgress(0.0)}
                          className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white transition"
                          title="إعادة بدء الرحلة من نقطة الانطلاق"
                          aria-label="إعادة بدء الرحلة"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Telemetry Metrics Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                          <Gauge className="w-3 h-3 text-emerald-400" />
                          <span>السرعة اللحظية:</span>
                        </div>
                        <div className="text-sm font-black text-white font-mono mt-0.5">
                          {liveTelemetry.speedKmh} <span className="text-[10px] font-normal text-slate-400">كم/س</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                          <Truck className="w-3 h-3 text-emerald-400" />
                          <span>المسافة المتبقية:</span>
                        </div>
                        <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                          {liveTelemetry.remainingDistanceKm} <span className="text-[10px] font-normal text-slate-400">كم</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span>وقت الوصول (ETA):</span>
                        </div>
                        <div className="text-sm font-black text-white font-mono mt-0.5">
                          {liveTelemetry.remainingMinutes} <span className="text-[10px] font-normal text-slate-400">دقيقة</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                          <Compass className="w-3 h-3 text-emerald-400" />
                          <span>إنجاز المسار:</span>
                        </div>
                        <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                          {liveTelemetry.progressPct}%
                        </div>
                      </div>
                    </div>

                    {/* Location Landmark & Milestone Notice */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                      <div className="text-slate-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>
                          الموقع الحي الحالي: <strong className="text-white">{liveTelemetry.currentLandmark}</strong>
                        </span>
                      </div>

                      {liveTelemetry.isNearDestination ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          🔔 الكابتن يقترب من نقطة التسليم!
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          إحداثيات GPS: {liveTelemetry.currentCoords.lat.toFixed(4)}, {liveTelemetry.currentCoords.lng.toFixed(4)}
                        </span>
                      )}
                    </div>

                    {/* Interactive Progress Scrubber */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{PALESTINIAN_CITIES.find((c) => c.id === selectedOrder.fromCityId)?.nameAr}</span>
                        <span>شريط تقدم المركبة على الشارع (اسحب للمعاينة)</span>
                        <span>{PALESTINIAN_CITIES.find((c) => c.id === selectedOrder.toCityId)?.nameAr}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={simulatedProgress}
                        onChange={(e) => setSimulatedProgress(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                        aria-label="شريط مسار المركبة"
                      />
                    </div>
                  </div>
                )}

                {/* Map View with Live Simulated Coordinates */}
                <div className="h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                  <PalestineMap
                    highlightRoute={{
                      fromCityId: selectedOrder.fromCityId,
                      toCityId: selectedOrder.toCityId,
                    }}
                    showCheckpoints={true}
                    showCorridor={true}
                    simulatedDriverCoords={selectedOrder.status === 'in_transit' ? liveTelemetry.currentCoords : undefined}
                    simulatedHeadingDeg={liveTelemetry.bearingDeg}
                    simulatedSpeedKmh={liveTelemetry.speedKmh}
                    simulatedLandmark={liveTelemetry.currentLandmark}
                    passedBreadcrumbs={selectedOrder.status === 'in_transit' ? liveTelemetry.passedWaypoints : []}
                  />
                </div>

                {/* Assigned Driver Card */}
                {selectedOrder.driverName ? (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                        🚗
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{selectedOrder.driverName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300">
                            سائق موثق
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          سرفيس عمومي (خط الخليل - رام الله) • تقييم 4.9 ★
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href="tel:0599000000"
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>اتصال بالكابتن</span>
                      </a>

                      {onSimulateAdvanceOrder && selectedOrder.status !== 'delivered' && (
                        <button
                          type="button"
                          onClick={() => onSimulateAdvanceOrder(selectedOrder.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>محاكاة تسليم الطرد</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                    جاري مطابقة الطرد مع سيارة عمومي أو خاصة متجهة إلى{' '}
                    {PALESTINIAN_CITIES.find((c) => c.id === selectedOrder.toCityId)?.nameAr}...
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
                لا يوجد طلبات نشطة حالياً.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
