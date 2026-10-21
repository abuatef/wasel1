/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  B2BMerchant,
  Driver,
  Order,
  PricingConfig,
  WalletTransaction,
} from './types';
import {
  INITIAL_B2B_MERCHANTS,
  INITIAL_DRIVERS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
} from './data/mockData';
import { DEFAULT_PRICING_CONFIG, calculateDeliveryPrice, evaluateDriverDebtStatus } from './utils/pricing';
import { CustomerApp } from './components/Customer/CustomerApp';
import { DriverApp } from './components/Driver/DriverApp';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import {
  Package,
  Car,
  BarChart3,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RotateCcw,
  Fuel,
  Info,
} from 'lucide-react';

export default function App() {
  // Current Perspective View
  const [currentView, setCurrentView] = useState<'customer' | 'driver' | 'admin'>('customer');

  // Shared Global State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [b2bMerchants, setB2bMerchants] = useState<B2BMerchant[]>(INITIAL_B2B_MERCHANTS);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('drv_1');
  const [showSimNotice, setShowSimNotice] = useState<string | null>(null);

  const displayNotice = (msg: string) => {
    setShowSimNotice(msg);
    setTimeout(() => setShowSimNotice(null), 4000);
  };

  // 1. Order Creation
  const handleCreateOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    displayNotice(`تم تسجيل الطلب برقم ${newOrder.trackingNumber} وعرضه على كباتن رحلات العودة!`);
  };

  // 2. Driver accepts order
  const handleAcceptOrder = (orderId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    if (driver.isFrozen) {
      displayNotice('لا يمكن قبول الطلب: حساب الكابتن مجمد بسبب تجاوز سقف المديونية!');
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'in_transit',
              driverId: driver.id,
              driverName: driver.name,
            }
          : o
      )
    );

    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              assignedOrderIds: [...d.assignedOrderIds, orderId],
            }
          : d
      )
    );

    displayNotice(`قبل الكابتن ${driver.name} نقل الطرد كنقطة توقف على مسار عودته!`);
  };

  // 3. Complete delivery & PIN confirmation
  const handleCompleteDelivery = (orderId: string, enteredPin: string): { success: boolean; message: string } => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'الطلب غير موجود' };

    if (enteredPin.trim() !== order.securityPin) {
      return { success: false, message: 'رمز الأمان السري (PIN) غير صحيح! يرجى التأكد من المستلم.' };
    }

    const driver = drivers.find((d) => d.id === order.driverId);
    if (!driver) return { success: false, message: 'السائق غير موجود' };

    // Update order status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'delivered',
              deliveredAt: 'الآن',
            }
          : o
      )
    );

    // Financial split & wallet ledger updates
    if (order.paymentMethod === 'cash_on_delivery') {
      // Driver received cash from recipient. Deduct platform commission from driver wallet!
      const platformFee = order.priceBreakdown.platformRevenue;
      const newBalance = Number((driver.walletBalance - platformFee).toFixed(1));
      const debtCheck = evaluateDriverDebtStatus(newBalance, driver.creditLimit);

      const tx: WalletTransaction = {
        id: `tx_${Date.now()}`,
        driverId: driver.id,
        timestamp: 'الآن',
        type: 'cod_commission_debt',
        amount: -platformFee,
        orderId: order.id,
        note: `اقتطاع عمولة المنصة (${platformFee} ₪) من طلب كاش ${order.trackingNumber}`,
        balanceAfter: newBalance,
      };

      setTransactions((prev) => [tx, ...prev]);

      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driver.id
            ? {
                ...d,
                walletBalance: newBalance,
                isFrozen: debtCheck.isFrozen,
                assignedOrderIds: d.assignedOrderIds.filter((id) => id !== orderId),
              }
            : d
        )
      );

      return {
        success: true,
        message: `تم التسليم بنجاح! قبضت ${order.priceBreakdown.finalCustomerPrice} ₪ كاش. تم تسجيل عمولة المنصة (-${platformFee} ₪) بذمتك.`,
      };
    } else {
      // Digital payment: Platform releases escrow directly to driver wallet!
      const netPay = order.priceBreakdown.driverNetRevenue;
      const newBalance = Number((driver.walletBalance + netPay).toFixed(1));

      const tx: WalletTransaction = {
        id: `tx_${Date.now()}`,
        driverId: driver.id,
        timestamp: 'الآن',
        type: 'digital_payout',
        amount: netPay,
        orderId: order.id,
        note: `إيداع صافي أتعاب مشوار إلكتروني للطلب ${order.trackingNumber}`,
        balanceAfter: newBalance,
      };

      setTransactions((prev) => [tx, ...prev]);

      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driver.id
            ? {
                ...d,
                walletBalance: newBalance,
                assignedOrderIds: d.assignedOrderIds.filter((id) => id !== orderId),
              }
            : d
        )
      );

      return {
        success: true,
        message: `تم التسليم بنجاح! تم تحويل صافي أتعابك (${netPay} ₪) فوراً إلى محفظتك الإلكترونية.`,
      };
    }
  };

  // 4. Report checkpoint delay
  const handleReportCheckpointDelay = (orderId: string, checkpointName: string, delayMinutes: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              checkpointName,
              delayReportedMinutes: delayMinutes,
              priceBreakdown: calculateDeliveryPrice(
                o.priceBreakdown.distanceKm,
                o.priceBreakdown.estimatedMinutes + delayMinutes,
                o.size,
                o.deliveryType,
                true,
                pricingConfig
              ),
            }
          : o
      )
    );

    displayNotice(`تم تسجيل أزمة عند ${checkpointName} (+${delayMinutes} دقيقة) وإشعار العميل.`);
  };

  // 5. Driver Settle Debt (Jawwal Pay / PalPay)
  const handleSettleDebt = (driverId: string, amount: number, method: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;
        const newBalance = Number((d.walletBalance + amount).toFixed(1));
        return {
          ...d,
          walletBalance: newBalance,
          isFrozen: newBalance < -d.creditLimit,
        };
      })
    );

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      driverId,
      timestamp: 'الآن',
      type: 'settlement_payment',
      amount: amount,
      note: `سداد مستحقات المنصة عبر ${method === 'jawwal_pay' ? 'جوال باي' : 'بال باي'} لتصفير الذمة`,
      balanceAfter: 0,
    };

    setTransactions((prev) => [tx, ...prev]);
    displayNotice(`تم سداد ${amount.toFixed(1)} ₪ بنجاح وتفعيل الحساب بالكامل!`);
  };

  // 6. Admin freeze/unfreeze toggle
  const handleToggleFreezeDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, isFrozen: !d.isFrozen } : d))
    );
  };

  // 7. Reset Mock Data
  const handleResetData = () => {
    setOrders(INITIAL_ORDERS);
    setDrivers(INITIAL_DRIVERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setB2bMerchants(INITIAL_B2B_MERCHANTS);
    setPricingConfig(DEFAULT_PRICING_CONFIG);
    displayNotice('تمت استعادة البيانات النموذجية وحالة النظام الأولية بنجاح.');
  };

  // 8. Simulation Shortcut: Unfreeze Fadi
  const handleUnfreezeFadi = () => {
    handleSettleDebt('drv_4', 160, 'jawwal_pay');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-xl">
              و
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  واصل <span className="text-emerald-400">| Wasel</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  لوجستيات الميل الأخير ورحلات العودة
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                منصة النقل التشاركي للطرود والبضائع بين المدن الفلسطينية
              </div>
            </div>
          </div>

          {/* Perspective Selector (Tabs) */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentView('customer')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                currentView === 'customer'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>👤 تطبيق العميل</span>
            </button>

            <button
              onClick={() => setCurrentView('driver')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                currentView === 'driver'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>🚗 تطبيق السائق (الكابتن)</span>
            </button>

            <button
              onClick={() => setCurrentView('admin')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                currentView === 'admin'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>📊 لوحة تحكم الإدارة</span>
            </button>
          </div>
        </div>

        {/* Real-time Palestinian Transport & Pricing Benchmarks Ticker */}
        <div className="bg-slate-950 border-t border-slate-900 py-1.5 px-4 text-[11px] text-slate-400 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 whitespace-nowrap">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Fuel className="w-3.5 h-3.5" />
                سعر السولار المعتمد: <strong>{pricingConfig.dieselBenchmarkPrice.toFixed(2)} ₪/لتر</strong>
              </span>
              <span className="text-slate-700">•</span>
              <span>فتح العداد: <strong>{pricingConfig.baseFare.toFixed(1)} ₪</strong></span>
              <span className="text-slate-700">•</span>
              <span>سعر الكم بين المدن: <strong>{pricingConfig.perKmRate.toFixed(2)} ₪/كم</strong></span>
              <span className="text-slate-700">•</span>
              <span>دقيقة الانتظار: <strong>{pricingConfig.waitingRatePerMin.toFixed(2)} ₪/د</strong></span>
              <span className="text-slate-700">•</span>
              <span className="text-teal-300">خصم رحلة العودة (Backhaul): <strong>{(pricingConfig.backhaulDiscountPct * 100).toFixed(0)}% للزبون</strong></span>
              <span className="text-slate-700">•</span>
              <span>سقف مديونية الكاش: <strong>{pricingConfig.maxDriverDebtLimit} ₪</strong></span>
            </div>

            {/* Quick Actions & Simulation triggers */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUnfreezeFadi}
                className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition text-[10px]"
                title="سداد مديونية الكابتن فادي المجمد"
              >
                ⚡ سداد فادي المجمد (160 ₪)
              </button>
              <button
                onClick={handleResetData}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[10px] flex items-center gap-1"
                title="إعادة تعيين البيانات الافتراضية"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Real-time Toast/Notice */}
      {showSimNotice && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{showSimNotice}</span>
        </div>
      )}

      {/* Main Body Perspectives */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentView === 'customer' && (
          <CustomerApp
            orders={orders}
            pricingConfig={pricingConfig}
            onCreateOrder={handleCreateOrder}
            onSimulateAdvanceOrder={(orderId) => {
              const ord = orders.find((o) => o.id === orderId);
              if (ord) {
                handleCompleteDelivery(orderId, ord.securityPin);
              }
            }}
          />
        )}

        {currentView === 'driver' && (
          <DriverApp
            drivers={drivers}
            selectedDriverId={selectedDriverId}
            orders={orders}
            transactions={transactions}
            pricingConfig={pricingConfig}
            onSelectDriver={setSelectedDriverId}
            onUpdateDriver={(updated) => {
              setDrivers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
            }}
            onAcceptOrder={handleAcceptOrder}
            onCompleteDelivery={handleCompleteDelivery}
            onReportCheckpointDelay={handleReportCheckpointDelay}
            onSettleDebt={handleSettleDebt}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            orders={orders}
            drivers={drivers}
            transactions={transactions}
            b2bMerchants={b2bMerchants}
            pricingConfig={pricingConfig}
            onUpdatePricingConfig={(newCfg) => {
              setPricingConfig(newCfg);
              displayNotice('تم تحديث إعدادات محرك التسعير بنجاح!');
            }}
            onToggleFreezeDriver={handleToggleFreezeDriver}
            onLogSettlement={(driverId, amount) => handleSettleDebt(driverId, amount, 'jawwal_pay')}
            onAddMerchant={(merchant) => {
              setB2bMerchants((prev) => [merchant, ...prev]);
              displayNotice(`تم تسجيل عقد الشراكة مع ${merchant.name}!`);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>نظام واصل اللوجستي الذكي (Last-Mile Delivery & Backhauling) • فلسطين</span>
          <span>دعم المحافظ الرقمية: جوال باي (Jawwal Pay) • بال باي (PalPay) • رفاه (Refah)</span>
        </div>
      </footer>
    </div>
  );
}
