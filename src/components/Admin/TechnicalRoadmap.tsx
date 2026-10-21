import React, { useState } from 'react';
import {
  Compass,
  Database,
  Server,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Zap,
  Globe,
  Radio,
  Clock,
  Terminal,
  FileCode,
  DollarSign,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

export const TechnicalRoadmap: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'tables' | 'architecture' | 'stack'>('architecture');

  const phases = [
    {
      id: 1,
      title: 'المرحلة 1: بناء السيرفر الخلفي وقاعدة البيانات المكانية',
      subtitle: 'Backend Architecture & Spatial Database (PostGIS)',
      duration: '4 - 6 أسابيع',
      status: 'قيد التجهيز',
      goals: [
        'بناء خادم REST / GraphQL باستخدام Node.js (NestJS / Express) أو Go لتوفير أداء فائق في المعاملات اللوجستية.',
        'تأسيس قاعدة بيانات PostgreSQL مدعومة بامتداد PostGIS المخصص للاستعلامات الجغرافية والبحث الشعاعي (Spatial Queries).',
        'تطبيق خوارزمية البحث الشعاعي الميداني ST_DWithin للبحث عن الطرود في نطاق 5 إلى 15 كم حول مسار السائق.',
        'استخدام Redis لتخزين مواقع السائقين اللحظية (Geohashing) مع سرعة استجابة تقل عن 5ms.',
        'تجهيز بيئة حاويات Docker وسيرفرات سحابية مع بيئة CI/CD مؤتمتة.',
      ],
      deliverables: [
        'PostgreSQL + PostGIS Database Schema',
        'Authentication & Role-Based Access (JWT)',
        'Order Lifecycle State Machine API',
        'Dynamic Pricing Calculation Microservice',
      ],
    },
    {
      id: 2,
      title: 'المرحلة 2: تطبيقات الهواتف الذكية وتتبع GPS الحقيقي بالخلفية',
      subtitle: 'Native Mobile Apps & Background Geolocation Engine',
      duration: '6 - 8 أسابيع',
      status: 'مخططة',
      goals: [
        'تطوير تطبيق السائق (Driver App) لنظامي Android و iOS باستخدام React Native أو Flutter.',
        'دمج مكتبة تتبع الموقع في الخلفية (Background Geolocation) مع استهلاك بطارية فائق التوفير (Motion Detection).',
        'بث إحداثيات السائق الحية عبر قناة WebSockets / Socket.io أو Firebase Realtime إلى سيرفر المراقبة.',
        'تطوير تطبيق العميل (Customer App) مع إشعارات دفع فورية (Firebase Cloud Messaging - FCM) عند تغير حالة الطرد.',
        'توفير العمل في وضع عدم الاتصال (Offline-First Sync) لمواجهة انقطاع شبكة الهاتف على الطرق الالتفافية والوديان.',
      ],
      deliverables: [
        'تطبيق السائق (APK / TestFlight)',
        'تطبيق العميل (iOS / Android)',
        'نظام البث الحي للإحداثيات (Live Socket Gateway)',
        'نظام إشعارات الدفع (FCM Push Notifications)',
      ],
    },
    {
      id: 3,
      title: 'المرحلة 3: الربط المالي والمحافظ الإلكترونية الفلسطينية',
      subtitle: 'Palestinian e-Wallets (Jawwal Pay & PalPay) & Escrow Ledger',
      duration: '3 - 4 أسابيع',
      status: 'مخططة',
      goals: [
        'توقيع اتفاقيات الربط التجاري مع مزودي الدفع المحليين: شركة جوال (Jawwal Pay) وبنك فلسطين (PalPay) ورفاه (Refah).',
        'بناء بوابة دفع موحدة (Unified Payment Gateway Adapter) للتعامل مع Webhooks الخاصة بالخصم والإيداع الفوري.',
        'تطبيق نظام الحجز المالي الآمن (Escrow System): حجز قيمة التوصيل ولا يتم فك الحجز وإيداعه في محفظة السائق إلا بعد إدخال رمز الأمان (PIN).',
        'برمجة نظام دفتر الأستاذ الدقيق (Double-Entry Ledger) لتقييد عمولات الكاش بالسالب وتجميد حساب السائق تلقائياً عند تجاوز 150 ₪.',
        'توفير واجهة تسوية بنكية آلية وتصدير كشوفات الحسابات PDF و Excel للسائقين والشركات.',
      ],
      deliverables: [
        'Jawwal Pay / PalPay API Webhooks & Handlers',
        'Escrow Smart Hold & Release Service',
        'Automated Negative Wallet Freeze Engine',
        'Financial Audit & Invoicing Generator',
      ],
    },
    {
      id: 4,
      title: 'المرحلة 4: محرك الذكاء الاصطناعي والتنبؤ بأزمات الحواجز',
      subtitle: 'Smart Routing, Checkpoint Crowd-Sensing & Dynamic Surge',
      duration: '4 أسابيع',
      status: 'مخططة',
      goals: [
        'بناء خوارزمية تنبؤ بحركة المرور وأزمات الحواجز (واد النار، زعترة، قلنديا، حوارة) عبر الاستشعار الجماعي (Crowd-Sensing) لسرعة سيارات الكباتن.',
        'إعادة توجيه ذكية للمسار (Auto-Rerouting) في حال إغلاق طريق رئيسي، مع تنبيه العميل فوراً بتعديل موعد الوصول.',
        'تفعيل معامل الأزمات التلقائي (Dynamic Surcharge Engine 1.2x - 1.35x) عندما يتجاوز الانتظار 30 دقيقة.',
        'تحسين خوارزمية مطابقة رحلات العودة (Backhauling ML Matching) لتقليل وقت انتظار السائقين لأقل من 10 دقائق.',
      ],
      deliverables: [
        'حساس الازدحامات التلقائي (Checkpoint Crowd-Sensing)',
        'خوارزمية إعادة التوجيه الذكية',
        'محرك التسعير اللحظي التنبؤي (Predictive Surge Pricing)',
      ],
    },
    {
      id: 5,
      title: 'المرحلة 5: الامتثال القانوني، الشراكات الميدانية، والإطلاق التجاري',
      subtitle: 'Regulatory Compliance, Fleet Onboarding & Market Launch',
      duration: '4 أسابيع',
      status: 'مخططة',
      goals: [
        'الحصول على التراخيص الرسمية من وزارة النقل والمواصلات الفلسطينية ووزارة الاتصالات والاقتصاد الرقمي.',
        'عقد شراكات رسمية مع نقابات السائقين العموميين ومكاتب التاكسي والسرفيس (خطوط الخليل، رام الله، نابلس، جنين).',
        'توقيع عقود شحن B2B مع كبرى المتاجر الإلكترونية في الضفة الغربية والمصانع في الخليل ونابلس.',
        'تأمين وثيقة تأمين تجارية شاملة تضمن تعويض الطرود المفقودة أو التالفة حتى 1000 شيكل لكل شحنة.',
        'إطلاق حملة تسويقية ميدانية ورقمية لضم أول 500 كابتن و10,000 عميل.',
      ],
      deliverables: [
        'التراخيص الحكومية وشهادات الامتثال',
        'عقود الشراكة مع نقابات التاكسي والمتاجر',
        'إطلاق النسخة الإنتاجية (Production Launch)',
      ],
    },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Roadmap Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                خارطة الطريق الهندسية الشاملة
              </span>
              <span className="text-xs text-slate-400">من النموذج التجريبي إلى الإنتاج التجاري</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              خطة تطوير الواجهات الأمامية والخلفية لمنظومة "واصل" اللوجستية
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              دليل هندسي كامل يوضح معمارية النظام، قواعد البيانات، أطر العمل الموصى بها، مسارات الربط المالي في فلسطين، ومراحل الإطلاق التشغيلي الميداني خطوة بخطوة.
            </p>
          </div>

          {/* Sub-view toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch md:self-auto text-xs">
            <button
              onClick={() => setActiveSchemaTab('architecture')}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeSchemaTab === 'architecture'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>معمارية النظام (Architecture)</span>
            </button>

            <button
              onClick={() => setActiveSchemaTab('tables')}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeSchemaTab === 'tables'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>قاعدة البيانات (PostgreSQL)</span>
            </button>

            <button
              onClick={() => setActiveSchemaTab('stack')}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeSchemaTab === 'stack'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>حزمة التقنيات (Tech Stack)</span>
            </button>
          </div>
        </div>

        {/* 5 Phases Horizontal Timeline Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-5">
          {phases.map((p) => {
            const isSelected = selectedPhase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPhase(p.id)}
                className={`p-3 rounded-xl border text-right transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    المرحلة {p.id}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">{p.duration}</span>
                </div>
                <div className="text-xs font-bold text-white mt-2 line-clamp-1">{p.title.split(':')[1] || p.title}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{p.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Phase Deep Dive Card */}
      {(() => {
        const curPhase = phases.find((p) => p.id === selectedPhase) || phases[0];
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs font-semibold text-emerald-400 font-mono">المرحلة {curPhase.id} من 5 • المدة المقدرة: {curPhase.duration}</div>
                <h3 className="text-base font-bold text-white mt-0.5">{curPhase.title}</h3>
                <div className="text-xs text-slate-400">{curPhase.subtitle}</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {curPhase.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Detailed Tasks & Goals */}
              <div className="md:col-span-7 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>الأهداف والمهام الهندسية الأساسية:</span>
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {curPhase.goals.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deliverables & Technical Output */}
              <div className="md:col-span-5 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>المخرجات البرمجية للتسليم (Deliverables):</span>
                </h4>
                <div className="space-y-2">
                  {curPhase.deliverables.map((d, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-mono text-slate-200">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ARCHITECTURE DIAGRAM VIEW */}
      {activeSchemaTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">المعمارية التقنية المتكاملة للمنظومة (Full-Stack Architecture)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Layer 1: Clients */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>1. طبقة التطبيقات</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Client</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                واجهات المستخدمين والمشغلين المتصلة عبر شبكات الهواتف:
              </p>
              <div className="space-y-1.5 text-slate-300">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  📱 تطبيق السائق (Android / iOS)
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  📦 تطبيق العميل والمتاجر (Mobile Web / PWA)
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  🖥️ لوحة التحكم للإدارة والعمليات (Dispatch Control)
                </div>
              </div>
            </div>

            {/* Layer 2: API Gateway & Real-time */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-sky-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-4 h-4" />
                  <span>2. بوابة الاتصال والـ GPS</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Gateway</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                استقبال ومعالجة الطلبات وإحداثيات المركبات اللحظية:
              </p>
              <div className="space-y-1.5 text-slate-300">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  ⚡ WebSocket Gateway (Socket.io / WS)
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  🔒 RESTful API & Rate Limiting
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  🛡️ JWT Token Validation & RBAC
                </div>
              </div>
            </div>

            {/* Layer 3: Core Business Services */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>3. محركات المعالجة والذكاء</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Core Logic</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                الخوارزميات المسؤولة عن التسعير والمطابقة والمالية:
              </p>
              <div className="space-y-1.5 text-slate-300">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  📍 PostGIS Radial Corridor Matcher
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  💰 Dynamic Pricing & Surge Calculator
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  💳 Escrow Ledger & Debt Freeze Daemon
                </div>
              </div>
            </div>

            {/* Layer 4: Storage & 3P Integrations */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  <span>4. التخزين والربط المحلي</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Data & 3P</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                قواعد البيانات والتكامل مع المحافظ وشبكات الاتصال:
              </p>
              <div className="space-y-1.5 text-slate-300">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  🐘 PostgreSQL + PostGIS (Spatial Data)
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  ⚡ Redis Geohash & Live Driver State
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-medium">
                  🇵🇸 Jawwal Pay & PalPay Webhooks
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DATABASE SCHEMA VIEW */}
      {activeSchemaTab === 'tables' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">مخطط جداول قاعدة البيانات المقترح (PostgreSQL + PostGIS)</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Drizzle ORM / Prisma Compatible</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Table: drivers */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-slate-800 pb-1.5">
                <span>TABLE drivers</span>
                <span className="text-[10px] text-slate-500 font-normal">بيانات السائقين والديون</span>
              </div>
              <div className="text-slate-300 space-y-1 text-[11px]">
                <div>• id: UUID PRIMARY KEY</div>
                <div>• user_id: UUID REFERENCES users(id)</div>
                <div>• vehicle_type: VARCHAR(20) -- 'servis', 'private', 'van'</div>
                <div>• plate_number: VARCHAR(30) UNIQUE</div>
                <div>• return_corridor: GEOMETRY(LineString, 4326)</div>
                <div>• current_location: GEOMETRY(Point, 4326)</div>
                <div>• wallet_balance: NUMERIC(10, 2) DEFAULT 0.00</div>
                <div>• credit_limit: NUMERIC(10, 2) DEFAULT 150.00</div>
                <div>• is_frozen: BOOLEAN DEFAULT FALSE</div>
              </div>
            </div>

            {/* Table: orders */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-sky-400 font-bold border-b border-slate-800 pb-1.5">
                <span>TABLE orders</span>
                <span className="text-[10px] text-slate-500 font-normal">الطرود والشحنات</span>
              </div>
              <div className="text-slate-300 space-y-1 text-[11px]">
                <div>• id: UUID PRIMARY KEY</div>
                <div>• tracking_number: VARCHAR(20) UNIQUE</div>
                <div>• customer_id: UUID REFERENCES users(id)</div>
                <div>• driver_id: UUID REFERENCES drivers(id)</div>
                <div>• pickup_location: GEOMETRY(Point, 4326)</div>
                <div>• dropoff_location: GEOMETRY(Point, 4326)</div>
                <div>• delivery_type: VARCHAR(20) -- 'express', 'backhaul'</div>
                <div>• total_price: NUMERIC(10, 2)</div>
                <div>• platform_commission: NUMERIC(10, 2)</div>
                <div>• driver_net_pay: NUMERIC(10, 2)</div>
                <div>• security_pin: VARCHAR(6)</div>
                <div>• status: VARCHAR(25) -- 'pending', 'in_transit', 'delivered'</div>
              </div>
            </div>

            {/* Table: wallet_transactions */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-amber-400 font-bold border-b border-slate-800 pb-1.5">
                <span>TABLE wallet_transactions</span>
                <span className="text-[10px] text-slate-500 font-normal">دفتر الأستاذ المالي (Ledger)</span>
              </div>
              <div className="text-slate-300 space-y-1 text-[11px]">
                <div>• id: UUID PRIMARY KEY</div>
                <div>• driver_id: UUID REFERENCES drivers(id)</div>
                <div>• order_id: UUID REFERENCES orders(id)</div>
                <div>• transaction_type: VARCHAR(30) -- 'cod_fee_debt', 'digital_payout'</div>
                <div>• amount: NUMERIC(10, 2)</div>
                <div>• balance_after: NUMERIC(10, 2)</div>
                <div>• payment_gateway_ref: VARCHAR(100) -- JawwalPay/PalPay TX</div>
                <div>• created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()</div>
              </div>
            </div>

            {/* Table: checkpoints_crowdsource */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-rose-400 font-bold border-b border-slate-800 pb-1.5">
                <span>TABLE checkpoint_status</span>
                <span className="text-[10px] text-slate-500 font-normal">استشعار الأزمات وتعديل الأسعار</span>
              </div>
              <div className="text-slate-300 space-y-1 text-[11px]">
                <div>• id: VARCHAR(50) PRIMARY KEY -- 'wadi_alnar', 'zaatara'</div>
                <div>• name_ar: VARCHAR(100)</div>
                <div>• location: GEOMETRY(Point, 4326)</div>
                <div>• delay_minutes: INTEGER DEFAULT 0</div>
                <div>• is_congested: BOOLEAN DEFAULT FALSE</div>
                <div>• dynamic_surcharge_multiplier: NUMERIC(3, 2) DEFAULT 1.00</div>
                <div>• last_reported_at: TIMESTAMP WITH TIME ZONE</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TECH STACK RECOMMENDATION MATRIX */}
      {activeSchemaTab === 'stack' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">حزمة التقنيات الموصى بها للإنتاج التجاري (Recommended Production Stack)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">الطبقة البرمجية</th>
                  <th className="py-2.5 px-3">التقنية المختارة</th>
                  <th className="py-2.5 px-3">سبب الاختيار والميزة التنافسية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 px-3 font-bold text-white">تطبيقات الهواتف (السائق والزبون)</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">React Native أو Flutter</td>
                  <td className="py-3 px-3">كود موحد لـ Android و iOS مع دعم متقدم لخدمات الموقع في الخلفية (Background GPS).</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">الخادم الخلفي (Backend Core)</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">Node.js (NestJS) أو Go</td>
                  <td className="py-3 px-3">معمارية Microservices مرنة، معالجة فورية لملايين حزم الإحداثيات وتدفقات الـ WebSockets.</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">قاعدة البيانات المكانية (Database)</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">PostgreSQL + PostGIS</td>
                  <td className="py-3 px-3">المعيار الذهبي عالمياً لمعالجة البيانات الجغرافية، الاستعلامات الشعاعية ومضلعات الحواجز.</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">التخزين المؤقت والبث اللحظي</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">Redis + Socket.io</td>
                  <td className="py-3 px-3">تخزين إحداثيات السائقين عبر Geohash وتحديث خريطة العميل بتأخير يقل عن 50ms.</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">الخرائط والملاحة</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">Leaflet / OpenStreetMap + OSRM</td>
                  <td className="py-3 px-3">تكلفة منخفضة، حرية تامة في إضافة مسارات الضفة الغربية الالتفافية (واد النار) دون قيود ترخيص.</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">البنية التحتية والاستضافة</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">Docker + Kubernetes (GCP / AWS)</td>
                  <td className="py-3 px-3">قدرة توسع ديناميكية (Auto-scaling) تتكيف مع أوقات الذروة والمواسم كالأعياد والجمعة.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
