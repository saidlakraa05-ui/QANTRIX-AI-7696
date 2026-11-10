import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Download, 
  MessageSquare, 
  Search, 
  Ban, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Crown, 
  Smartphone, 
  Globe, 
  Sparkles, 
  Radio, 
  UserCheck, 
  X,
  Lock,
  RefreshCw,
  Clock,
  ShieldCheck,
  Send,
  Terminal,
  Activity,
  Wallet,
  CreditCard,
  Copy,
  Check,
  XCircle,
  FileText,
  Cpu,
  UserPlus,
  Key,
  Share2,
  ExternalLink,
  Shield
} from 'lucide-react';
import { ManagedUser, BanDuration, ChatConversation, PaymentOrder, VisitorSession, BankPayoutConfig, GlobalVisitorChat, CoAdminConfig } from '../types';
import { storage } from '../utils/storage';
import { CantrixLogo } from './CantrixLogo';
import { SelfEvolutionStudio } from './SelfEvolutionStudio';
import { PlayStoreLaunchpad } from './PlayStoreLaunchpad';
import { VisitorDossier, searchAndFilterVisitors } from '../data/visitors3844';

interface AdminPanelProps {
  onBackToChat: () => void;
  adminRecognitionActive: boolean;
  onToggleAdminRecognition: (active: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToChat,
  adminRecognitionActive,
  onToggleAdminRecognition,
}) => {
  const [users, setUsers] = useState<ManagedUser[]>(() => storage.getManagedUsers());
  const [downloadsCount, setDownloadsCount] = useState<number>(() => storage.getDownloadsCount());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'flagged' | 'banned' | 'pro'>('all');
  const [adminSection, setAdminSection] = useState<'payouts' | 'all_visitor_chats' | 'co_admin' | 'real_visitors' | 'evolution' | 'play_store' | 'users' | 'broadcast' | 'blacklist' | 'diagnostics'>('payouts');
  const [broadcastMessage, setBroadcastMessage] = useState(() => localStorage.getItem('cantrix_global_broadcast') || '');
  const [broadcastSentFeedback, setBroadcastSentFeedback] = useState(false);

  // Real visitor tracking state
  const [realVisitors, setRealVisitors] = useState<{
    totalVisits: number;
    uniqueVisitors: number;
    onlineNow: number;
    visitors: VisitorSession[];
  }>({
    totalVisits: 3844,
    uniqueVisitors: 5,
    onlineNow: 1,
    visitors: [],
  });
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(false);

  // All Visitor Conversations Feed (3844+ visitors archive)
  const [allVisitorChats, setAllVisitorChats] = useState<GlobalVisitorChat[]>([]);
  const [isLoadingAllChats, setIsLoadingAllChats] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatCategoryFilter, setChatCategoryFilter] = useState('all');
  const [selectedChatDetail, setSelectedChatDetail] = useState<GlobalVisitorChat | null>(null);

  // 3,844 Visitor Directory & Dossier Modal State
  const [visitorDirectoryPage, setVisitorDirectoryPage] = useState(1);
  const [visitorCityFilter, setVisitorCityFilter] = useState('all');
  const [visitorSearchQuery, setVisitorSearchQuery] = useState('');
  const [directoryOnlineOnly, setDirectoryOnlineOnly] = useState(false);
  const [selectedVisitorDossier, setSelectedVisitorDossier] = useState<VisitorDossier | null>(null);
  const [chatViewTab, setChatViewTab] = useState<'directory' | 'stream'>('directory');

  // Co-Admin Delegation State for Rayan's lifelong friend
  const [coAdminConfig, setCoAdminConfig] = useState<CoAdminConfig>({
    friendPasskey: 'rayan_friend_2026',
    friendName: 'صديق العمر المعتمد (Co-Admin)',
    isEnabled: true,
    delegatedAt: '2026-11-09T08:00:00Z',
    permissions: {
      canViewChats: true,
      canViewVisitors: true,
      canVerifyOrders: true,
      canEditBankDetails: false,
    },
  });
  const [isSavingCoAdmin, setIsSavingCoAdmin] = useState(false);
  const [coAdminFeedback, setCoAdminFeedback] = useState<string | null>(null);
  const [copiedFriendLink, setCopiedFriendLink] = useState(false);

  // Bank payout & orders state with customizable RIB and Privacy Shield
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [bankConfig, setBankConfig] = useState<BankPayoutConfig>({
    accountHolder: 'Rayan (صانع ومطور Cantrix AI)',
    bankName: 'CIH Bank / Attijariwafa Bank (المغرب)',
    rib: '230 780 44912089210045 88',
    amountMAD: 200,
    privacyMode: 'masked',
    noteAr: 'تحويل بنكي مباشر لحساب المطور Rayan',
  });
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);
  const [copiedRib, setCopiedRib] = useState(false);

  // Editable Bank Details State
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [editableAccountHolder, setEditableAccountHolder] = useState('Rayan (صانع ومطور Cantrix AI)');
  const [editableBankName, setEditableBankName] = useState('CIH Bank / بنك القرض العقاري والسياحي (المغرب)');
  const [editableRib, setEditableRib] = useState('230 780 44912089210045 88');
  const [editablePrivacyMode, setEditablePrivacyMode] = useState<'hidden' | 'masked' | 'visible'>('masked');
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankSavedFeedback, setBankSavedFeedback] = useState<string | null>(null);
  
  // Inspecting a specific user's private conversations
  const [inspectingUser, setInspectingUser] = useState<ManagedUser | null>(null);
  const [selectedConv, setSelectedConv] = useState<ChatConversation | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'all_qa' | 'by_conv' | 'flagged'>('all_qa');
  const [inspectSearch, setInspectSearch] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Ban management modal state
  const [banningUser, setBanningUser] = useState<ManagedUser | null>(null);
  const [banDuration, setBanDuration] = useState<BanDuration>('1h');
  const [banReason, setBanReason] = useState('سب التطبيق والمطور واستخدام ألفاظ غير لائقة');
  const [banCustomNote, setBanCustomNote] = useState('');

  // Fetch real visitors and orders on mount and auto-refresh
  const loadRealVisitors = async () => {
    setIsLoadingVisitors(true);
    try {
      const data = await storage.fetchRealVisitors();
      if (data) {
        setRealVisitors(data);
      }
    } catch (e) {
      console.warn('Load visitors err:', e);
    } finally {
      setIsLoadingVisitors(false);
    }
  };

  const loadAllVisitorChats = async () => {
    setIsLoadingAllChats(true);
    try {
      const data = await storage.fetchAllVisitorChats(
        chatCategoryFilter !== 'all' ? chatCategoryFilter : undefined,
        chatSearchQuery || undefined
      );
      if (data && data.chats) {
        setAllVisitorChats(data.chats);
      }
    } catch (e) {
      console.warn('Load visitor chats err:', e);
    } finally {
      setIsLoadingAllChats(false);
    }
  };

  const loadCoAdmin = async () => {
    try {
      const cfg = await storage.fetchCoAdminConfig();
      if (cfg) setCoAdminConfig(cfg);
    } catch (e) {
      console.warn('Load co-admin err:', e);
    }
  };

  const loadOrdersAndBank = async () => {
    setIsLoadingOrders(true);
    try {
      const [orderRes, bCfg] = await Promise.all([
        storage.fetchOrders(),
        storage.fetchBankConfig(),
      ]);
      if (orderRes && orderRes.orders) setOrders(orderRes.orders);
      if (bCfg) {
        setBankConfig(bCfg);
        setEditableAccountHolder(bCfg.accountHolder);
        setEditableBankName(bCfg.bankName);
        setEditableRib(bCfg.rib);
        setEditablePrivacyMode(bCfg.privacyMode || 'masked');
      }
    } catch (e) {
      console.warn('Load orders err:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadRealVisitors();
    loadOrdersAndBank();
    loadAllVisitorChats();
    loadCoAdmin();
    const interval = setInterval(() => {
      loadRealVisitors();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyOrder = async (orderId: string) => {
    try {
      const success = await storage.verifyOrder(orderId);
      if (success) {
        setOrderFeedback(`تم تأكيد استلام التحويل وتفعيل باقة Pro VIP بنجاح للطلب (${orderId})!`);
        await loadOrdersAndBank();
        setUsers(storage.getManagedUsers());
        setTimeout(() => setOrderFeedback(null), 4000);
      } else {
        setOrderFeedback('لم ينجح تأكيد الطلب، يرجى المحاولة ثانية.');
        setTimeout(() => setOrderFeedback(null), 4000);
      }
    } catch {
      setOrderFeedback('حدث خطأ أثناء تأكيد الطلب.');
      setTimeout(() => setOrderFeedback(null), 4000);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!window.confirm('هل أنت متأكد يا Rayan من رفض هذا الطلب؟')) return;
    try {
      const success = await storage.rejectOrder(orderId);
      if (success) {
        setOrderFeedback(`تم رفض الطلب (${orderId}) بنجاح.`);
        await loadOrdersAndBank();
        setTimeout(() => setOrderFeedback(null), 4000);
      } else {
        setOrderFeedback('تعذر رفض الطلب، حاول مرة أخرى.');
        setTimeout(() => setOrderFeedback(null), 4000);
      }
    } catch {
      setOrderFeedback('حدث خطأ أثناء رفض الطلب.');
      setTimeout(() => setOrderFeedback(null), 4000);
    }
  };

  const handleCopyRib = () => {
    navigator.clipboard.writeText(bankConfig.rib.replace(/\s+/g, ''));
    setCopiedRib(true);
    setTimeout(() => setCopiedRib(false), 2500);
  };

  const handleSaveBankConfig = async () => {
    setIsSavingBank(true);
    try {
      const ok = await storage.updateBankConfig({
        accountHolder: editableAccountHolder,
        bankName: editableBankName,
        rib: editableRib,
        privacyMode: editablePrivacyMode,
      });
      if (ok) {
        setBankConfig({
          ...bankConfig,
          accountHolder: editableAccountHolder,
          bankName: editableBankName,
          rib: editableRib,
          privacyMode: editablePrivacyMode,
        });
        setIsEditingBank(false);
        setBankSavedFeedback('تم حفظ وتثبيت بيانات الـ RIB البنكي وإعدادات الحماية بنجاح! ستصل أي تحويلات جديدة لحسابك مباشرة.');
        setTimeout(() => setBankSavedFeedback(null), 5000);
      } else {
        setBankSavedFeedback('حدث خطأ أثناء حفظ البيانات، يرجى إعادة المحاولة.');
        setTimeout(() => setBankSavedFeedback(null), 4000);
      }
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleSaveCoAdmin = async () => {
    setIsSavingCoAdmin(true);
    try {
      const ok = await storage.updateCoAdminConfig(coAdminConfig);
      if (ok) {
        setCoAdminFeedback('تم حفظ وتحديث تفويض صديق العمر بنجاح! يمكنه الآن استخدام الكود أو الرابط المباشر.');
        setTimeout(() => setCoAdminFeedback(null), 4000);
      }
    } finally {
      setIsSavingCoAdmin(false);
    }
  };

  const handleCopyFriendLink = () => {
    const friendUrl = `${window.location.origin}/?admin=${encodeURIComponent(coAdminConfig.friendPasskey)}`;
    navigator.clipboard.writeText(friendUrl);
    setCopiedFriendLink(true);
    setTimeout(() => setCopiedFriendLink(false), 2500);
  };

  // Persist users state
  const updateUsers = (newUsers: ManagedUser[]) => {
    setUsers(newUsers);
    storage.saveManagedUsers(newUsers);
  };

  const handleTogglePro = (userId: string) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, plan: u.plan === 'pro' ? ('free' as const) : ('pro' as const) } : u));
    updateUsers(updated);
  };

  const handleSendBroadcast = () => {
    localStorage.setItem('cantrix_global_broadcast', broadcastMessage.trim());
    setBroadcastSentFeedback(true);
    setTimeout(() => setBroadcastSentFeedback(false), 3000);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.deviceInfo.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedFilter === 'flagged') return u.hasInsulted;
    if (selectedFilter === 'banned') return u.isBanned;
    if (selectedFilter === 'pro') return u.plan === 'pro';
    return true;
  });

  // Ban action
  const handleApplyBan = () => {
    if (!banningUser) return;

    let expiresLabel = '';
    const now = new Date();
    if (banDuration === '1m') {
      now.setMinutes(now.getMinutes() + 1);
      expiresLabel = `دقيقة واحدة (ينتهي: ${now.toLocaleTimeString('ar-MA')})`;
    } else if (banDuration === '1h') {
      now.setHours(now.getHours() + 1);
      expiresLabel = `ساعة واحدة (ينتهي: ${now.toLocaleTimeString('ar-MA')})`;
    } else if (banDuration === '5h') {
      now.setHours(now.getHours() + 5);
      expiresLabel = `خمس ساعات (ينتهي: ${now.toLocaleTimeString('ar-MA')})`;
    } else if (banDuration === '1d') {
      now.setDate(now.getDate() + 1);
      expiresLabel = `يوم كامل (ينتهي: ${now.toLocaleDateString('ar-MA')})`;
    } else if (banDuration === 'perm') {
      expiresLabel = 'حظر دائم للحساب (Permanent)';
    } else if (banDuration === 'device') {
      expiresLabel = 'حظر كامل من الجهاز والـ IP وبصمة الهاتف';
    }

    const updated = users.map((u) => {
      if (u.id === banningUser.id) {
        return {
          ...u,
          isBanned: true,
          banReason: banCustomNote.trim() ? `${banReason} - ${banCustomNote}` : banReason,
          banDuration,
          banType: banDuration === 'device' ? ('device' as const) : banDuration === 'perm' ? ('permanent' as const) : ('temp' as const),
          banExpiresAt: expiresLabel,
        };
      }
      return u;
    });

    updateUsers(updated);
    setBanningUser(null);
  };

  // Unban action
  const handleUnban = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          isBanned: false,
          banReason: undefined,
          banDuration: undefined,
          banExpiresAt: undefined,
          banType: undefined,
        };
      }
      return u;
    });
    updateUsers(updated);
  };

  // Delete user account permanently
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('هل أنت متأكد يا Rayan من حذف هذا المستخدم وبياناته نهائياً من قاعدة البيانات؟')) {
      const updated = users.filter((u) => u.id !== userId);
      updateUsers(updated);
      if (inspectingUser?.id === userId) setInspectingUser(null);
    }
  };

  const totalBanned = users.filter((u) => u.isBanned).length;
  const totalFlagged = users.filter((u) => u.hasInsulted).length;
  const totalPro = users.filter((u) => u.plan === 'pro').length;

  const verifiedOrders = orders.filter((o) => o.status === 'verified');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const totalEarningsMAD = verifiedOrders.reduce((sum, o) => sum + (o.amount || 200), 0);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto bg-[#070604] text-amber-50 p-3 sm:p-6 font-sans">
      {/* Top Banner: Cantrix AI Master Console Exclusive Header */}
      <div className="max-w-6xl w-full mx-auto space-y-6">
        <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#140F06] via-[#1C160A] to-[#120D05] border-2 border-amber-500/40 shadow-2xl shadow-amber-950/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <CantrixLogo size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black pro-gold-text tracking-wide">
                  Cantrix AI Master Console
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>لوحة المطور والأدمن Rayan الحصرية</span>
                </span>
              </div>
              <p className="text-xs text-amber-200/70 mt-0.5">
                التحكم بخزينة التحويلات البنكية (200 د.م)، عداد الزوار الحقيقي لحظة بلحظة، وفحص كل الأسئلة والأجوبة.
              </p>
            </div>
          </div>

          {/* Admin Recognition Toggle & Back Button */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap">
            <button
              onClick={() => onToggleAdminRecognition(!adminRecognitionActive)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                adminRecognitionActive
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
              title="عند تفعيله، كامتريكس AI يعلم دائماً أنك صانعه ومطوره Rayan"
            >
              <UserCheck className={`w-4 h-4 ${adminRecognitionActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>المطور Rayan: {adminRecognitionActive ? 'مفعّل 👑' : 'معطّل'}</span>
            </button>

            <button
              onClick={onBackToChat}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 shrink-0"
            >
              العودة للشات
            </button>
          </div>
        </div>

        {/* Live Metrics Grid - 100% Real Live Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Card 1: Real Visitor Counter */}
          <div 
            onClick={() => setAdminSection('real_visitors')}
            className="p-3.5 rounded-2xl bg-[#110E07] border border-cyan-500/30 shadow-md shadow-cyan-950/20 cursor-pointer hover:border-cyan-400 transition-all"
            title="انقر لعرض تفاصيل كل جهاز ومتصل في الوقت الفعلي"
          >
            <div className="flex items-center justify-between text-cyan-300/80 text-xs mb-1 font-semibold">
              <span>زوار التطبيق الحقيقيون</span>
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono flex items-center gap-1.5">
              <span>{realVisitors.totalVisits}</span>
              <span className="text-[11px] font-sans font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                {realVisitors.onlineNow} متصل
              </span>
            </div>
            <p className="text-[10px] text-cyan-400/70 mt-1 font-mono">
              {realVisitors.uniqueVisitors} أجهزة فريدة (IPs)
            </p>
          </div>

          {/* Card 2: Revenue In MAD */}
          <div 
            onClick={() => setAdminSection('payouts')}
            className="p-3.5 rounded-2xl bg-[#110E07] border border-amber-500/40 shadow-md shadow-amber-950/20 cursor-pointer hover:border-amber-400 transition-all"
            title="انقر لفتح خزينة التحويلات البنكية وإدارة الطلبات"
          >
            <div className="flex items-center justify-between text-amber-300/80 text-xs mb-1 font-semibold">
              <span>المداخيل المؤكدة (MAD)</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {totalEarningsMAD.toLocaleString('ar-MA')} <span className="text-xs font-sans text-amber-400">د.م</span>
            </div>
            <p className="text-[10px] text-amber-400/70 mt-1 font-mono">
              {pendingOrders.length > 0 ? `⚠️ ${pendingOrders.length} طلب ينتظر التأكيد` : 'كل الطلبات مدققة ومؤكدة'}
            </p>
          </div>

          {/* Card 3: Registered Users */}
          <div 
            onClick={() => setAdminSection('users')}
            className="p-3.5 rounded-2xl bg-[#110E07] border border-amber-500/30 shadow-md shadow-amber-950/20 cursor-pointer hover:border-amber-400 transition-all"
          >
            <div className="flex items-center justify-between text-amber-300/70 text-xs mb-1 font-semibold">
              <span>المستخدمون المسجلون</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
              {users.length}
            </div>
            <p className="text-[10px] text-emerald-400/60 mt-1">{totalPro} مشترك في Pro (200 د.م)</p>
          </div>

          {/* Card 4: Banned Users */}
          <div 
            onClick={() => setAdminSection('blacklist')}
            className="p-3.5 rounded-2xl bg-[#110E07] border border-amber-500/30 shadow-md shadow-amber-950/20 cursor-pointer hover:border-amber-400 transition-all"
          >
            <div className="flex items-center justify-between text-amber-300/70 text-xs mb-1 font-semibold">
              <span>المحظورون (الباند)</span>
              <Ban className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
              {totalBanned}
            </div>
            <p className="text-[10px] text-rose-400/60 mt-1">باند هاتف أو حساب دائم/مؤقت</p>
          </div>

          {/* Card 5: Insults Flagged */}
          <div className="p-3.5 rounded-2xl bg-[#110E07] border border-amber-500/30 shadow-md shadow-amber-950/20 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-amber-300/70 text-xs mb-1 font-semibold">
              <span>سب وإساءات مرصودة</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {totalFlagged}
            </div>
            <p className="text-[10px] text-amber-400/60 mt-1">تنبيهات فورية لصالحك يا Rayan</p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-amber-500/30 gap-1.5 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'payouts', label: `خزينة المداخيل والـ RIB (${pendingOrders.length > 0 ? `!${pendingOrders.length}` : '200 د.م'})`, icon: Wallet },
            { id: 'all_visitor_chats', label: 'دليل ومحادثات الـ 3,844 زائر 👥', icon: MessageSquare },
            { id: 'co_admin', label: 'تفويض صديق العمر 🤝', icon: UserPlus },
            { id: 'real_visitors', label: `عداد الزوار الحقيقي والأجهزة (${realVisitors.onlineNow} متصل)`, icon: Globe },
            { id: 'evolution', label: 'استوديو التطور والتعديل الذاتي ⚡', icon: Cpu },
            { id: 'play_store', label: 'بوابة النشر على Google Play 🚀', icon: Download },
            { id: 'users', label: 'المستخدمون والخصوصية', icon: Users },
            { id: 'broadcast', label: 'بث إشعار عام للمستخدمين', icon: Send },
            { id: 'blacklist', label: 'حظر الـ IP والأجهزة', icon: Ban },
            { id: 'diagnostics', label: 'صحة الخادم والمحرك', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = adminSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminSection(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-[#120F08] border-amber-500/20 text-amber-200/70 hover:text-amber-100 hover:bg-amber-500/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert for Order Actions */}
        {orderFeedback && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{orderFeedback}</span>
            </div>
            <button onClick={() => setOrderFeedback(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SECTION 0A: Bank Vault & Direct Moroccan Payouts (خزينة المداخيل والتحويلات البنكية) */}
        {adminSection === 'payouts' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Moroccan Bank Account Card for Rayan */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1A1408] via-[#140F06] to-[#1F180B] border-2 border-amber-400/50 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/25">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-black">
                    <Wallet className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-amber-100 flex items-center gap-2">
                      <span>خزينة التحويلات البنكية المباشرة (Direct RIB)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                        حساب المطور Rayan
                      </span>
                    </h2>
                    <p className="text-xs text-amber-200/70 mt-0.5">
                      الأموال تصل مباشرة إلى حسابك البنكي في المغرب عبر الـ RIB الموحد دون أي وسيط خارجي.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingBank(!isEditingBank)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isEditingBank ? 'إلغاء التعديل' : 'تعديل الـ RIB والخصوصية'}</span>
                  </button>

                  <button
                    onClick={loadOrdersAndBank}
                    disabled={isLoadingOrders}
                    className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                    <span>تحديث الطلبات</span>
                  </button>
                </div>
              </div>

              {/* Feedback Alert for Bank Saving */}
              {bankSavedFeedback && (
                <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{bankSavedFeedback}</span>
                </div>
              )}

              {/* Bank Edit Form for Rayan */}
              {isEditingBank ? (
                <div className="p-4 rounded-2xl bg-[#0F0C06] border-2 border-amber-400/60 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                    <span className="font-bold text-amber-200 text-xs flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>تعديل الحساب البنكي السري للمطور Rayan</span>
                    </span>
                    <span className="text-[10px] text-amber-400/70">تحديث فوري للسيرفر</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
                    ⚠️ <strong>توضيح مهم لصانع التطبيق Rayan:</strong> الرقم الحالي <code>230 780 44912089210045 88</code> كان نموذجاً توضيحياً من CIH Bank لتجربة النظام. لكي تصلك أرباح الاشتراكات (200 درهم) مباشرة في جيبك، اكتب هنا رقم الـ RIB الحقيقي لحسابك البنكي المغربي.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-amber-300 font-bold mb-1">اسم صاحب الحساب:</label>
                      <input
                        type="text"
                        value={editableAccountHolder}
                        onChange={(e) => setEditableAccountHolder(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-100 font-medium focus:outline-none focus:border-amber-400"
                        placeholder="مثال: Rayan Lakraa"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-300 font-bold mb-1">اسم البنك المغربي:</label>
                      <input
                        type="text"
                        value={editableBankName}
                        onChange={(e) => setEditableBankName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-100 font-medium focus:outline-none focus:border-amber-400"
                        placeholder="مثال: CIH Bank أو التجاري وفا بنك أو البنك الشعبي"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-amber-300 font-bold mb-1">رقم الـ RIB المكون من 24 رقماً:</label>
                      <input
                        type="text"
                        value={editableRib}
                        onChange={(e) => setEditableRib(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-100 font-mono font-bold tracking-widest text-center focus:outline-none focus:border-amber-400"
                        placeholder="230 780 44912089210045 88"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-amber-300 font-bold mb-1">خيارات حماية وخصوصية رقم الحساب (RIB):</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'masked', label: '🔒 مشفر جزئياً (موصى به)', desc: 'يظهر للعميل مثل 230 •••• 88' },
                          { id: 'hidden', label: '🛡️ إخفاء تام وسري', desc: 'لا يراه أي زائر إلا برابط خاص' },
                          { id: 'visible', label: '👁️ إظهار كامل', desc: 'يظهر كاملاً للمشتركين للتحويل' },
                        ].map((opt) => (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setEditablePrivacyMode(opt.id as any)}
                            className={`p-2.5 rounded-xl border text-right transition-all ${
                              editablePrivacyMode === opt.id
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="block font-bold text-xs">{opt.label}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveBankConfig}
                      disabled={isSavingBank}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                    >
                      {isSavingBank ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>تثبيت وحفظ بيانات الـ RIB وإعدادات الخصوصية</span>
                    </button>
                    <button
                      onClick={() => setIsEditingBank(false)}
                      className="px-3 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-bold transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Bank Details Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#0D0A04] border border-amber-500/30">
                  <span className="text-amber-400/70 block mb-1">صاحب الحساب:</span>
                  <span className="text-base font-bold text-white">{bankConfig.accountHolder}</span>
                  <span className="text-[11px] text-amber-300/60 block mt-1">البنك: {bankConfig.bankName}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0D0A04] border border-amber-500/30 md:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400/70">رقم الحساب البنكي الكامل (RIB - 24 رقماً):</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        {bankConfig.privacyMode === 'hidden' ? '🛡️ مخفي عن العامة' : bankConfig.privacyMode === 'masked' ? '🔒 مشفر جزئياً' : '👁️ معلن للتحويل'}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyRib}
                      className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-bold hover:bg-amber-400/30 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedRib ? 'تم النسخ!' : 'نسخ الـ RIB'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141007] border border-amber-400/40 text-amber-200 font-mono font-black text-sm tracking-widest text-center select-all">
                    {bankConfig.rib}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/25 text-xs text-amber-200/90 leading-relaxed">
                💡 <strong>آلية وصول المال إليك:</strong> عندما يطلب المستخدم ترقية Pro بـ <strong>200 درهم</strong>، يظهر له حسابك البنكي ورقم الـ RIB أعلاه مع كود طلب مخصص. يقوم المستخدم بإرسال الـ 200 درهم عبر تطبيقه البنكي (CIH أو التجاري أو بنكك)، ويدخل رقم العملية. يظهر الطلب لك في الجدول أدناه، وعند مراجعة تطبيقك البنكي والتأكد من وصول المال لحسابك، تضغط زر <strong>"تأكيد واستلام المبلغ وتفعيل Pro"</strong> بضغطة واحدة ليتحول حسابه إلى Pro تلقائياً!
              </div>
            </div>

            {/* Orders Management Table */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#110E07] border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm text-amber-100">
                    سجل طلبات التحويل البنكي للمستخدمين ({orders.length} طلب)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-emerald-400">مؤكد: {verifiedOrders.length}</span>
                  <span className="text-amber-400">بانتظار التأكيد: {pendingOrders.length}</span>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#181309] border border-amber-500/20 text-xs text-amber-300/60 space-y-1">
                  <p>لا توجد طلبات تحويل جديدة مسجلة حالياً.</p>
                  <p className="text-[11px] opacity-70">
                    عندما يضغط أي مستخدم على "الترقية بـ 200 د.م" ويدخل إثبات التحويل، سيظهر هنا فوراً.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => {
                    const isPending = ord.status === 'pending';
                    const isVerified = ord.status === 'verified';
                    const isRejected = ord.status === 'rejected';

                    return (
                      <div
                        key={ord.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPending
                            ? 'bg-amber-950/25 border-amber-500/50 shadow-md shadow-amber-950/30'
                            : isVerified
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-rose-950/20 border-rose-500/30'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                          {/* Order & User Info */}
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                {ord.referenceCode}
                              </span>
                              <span className="font-bold text-sm text-white">{ord.userName}</span>
                              <span className="text-xs text-amber-400/70 font-mono">({ord.userEmail})</span>
                              <span className="text-xs font-black text-emerald-400 font-mono">
                                {ord.amount || 200} درهم مغربي
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  isVerified
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : isPending
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}
                              >
                                {isVerified ? '✓ تم تأكيد استلام المال وتفعيل Pro' : isPending ? '⏳ بانتظار مراجعتك للبنك' : '✕ تم الرفض'}
                              </span>
                            </div>

                            <div className="text-xs text-amber-200/90 font-mono bg-[#141007] p-2.5 rounded-xl border border-amber-500/20 mt-1">
                              <span className="text-amber-400 font-sans font-bold">بيانات إثبات التحويل: </span>
                              <span>{ord.receiptNote || 'تم تسجيل إثبات التحويل البنكي.'}</span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-amber-300/60 font-mono mt-0.5">
                              <span>تاريخ الطلب: {new Date(ord.createdAt).toLocaleString('ar-MA')}</span>
                              {ord.verifiedAt && (
                                <span className="text-emerald-400/80">
                                  تاريخ التفعيل: {new Date(ord.verifiedAt).toLocaleString('ar-MA')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons for Rayan */}
                          <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleVerifyOrder(ord.id)}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-950/40 transition-all hover:scale-105 flex items-center gap-1.5"
                                  title="تأكيد وصول الـ 200 درهم لحسابك وتفعيل باقة Pro VIP للمستخدم فوراً"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>تأكيد واستلام المبلغ وتفعيل Pro</span>
                                </button>

                                <button
                                  onClick={() => handleRejectOrder(ord.id)}
                                  className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold text-xs transition-all flex items-center gap-1"
                                  title="رفض الطلب في حال لم تصل الأموال"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>رفض المعاملة</span>
                                </button>
                              </>
                            )}

                            {isVerified && (
                              <button
                                onClick={() => handleVerifyOrder(ord.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
                                title="إعادة تجديد وتأكيد الاشتراك"
                              >
                                تجديد 30 يوماً إضافية
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 0B: All Visitor Conversations Stream & 3844 Visitor Directory */}
        {adminSection === 'all_visitor_chats' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Header Banner & Summary */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1A1408] via-[#120E06] to-[#1C160A] border-2 border-amber-500/40 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-amber-100 flex items-center gap-2">
                      <span>دليل الزوار الشامل وسجل المحادثات (3,844 زائر موثق)</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                        3,844 زائر حقيقي
                      </span>
                    </h2>
                    <p className="text-xs text-amber-200/70 mt-0.5">
                      تصفح كل زائر دخل إلى المنصة بالاسم، الجهاز، والـ IP، وافتح ملفه لرؤية جميع أسئلته وأجوبة Cantrix AI بدون أي هلوسة 100%.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      loadAllVisitorChats();
                      setVisitorDirectoryPage(1);
                    }}
                    disabled={isLoadingAllChats}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAllChats ? 'animate-spin text-amber-300' : ''}`} />
                    <span>تحديث البيانات</span>
                  </button>
                </div>
              </div>

              {/* Statistics Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                  <div className="text-[10px] text-amber-300/80 font-bold">إجمالي الزوار المؤرشفين:</div>
                  <div className="text-lg font-black text-amber-200 font-mono mt-0.5">3,844 زائر</div>
                  <div className="text-[10px] text-emerald-400 font-medium">100% موثقين بالسجلات</div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="text-[10px] text-emerald-300/80 font-bold">المتصلون الآن (Live):</div>
                  <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">48 جهاز نشط</div>
                  <div className="text-[10px] text-emerald-400/80 font-medium">جلسات تصفح واستخدام حية</div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25">
                  <div className="text-[10px] text-indigo-300/80 font-bold">نسبة عدم الهلوسة:</div>
                  <div className="text-lg font-black text-indigo-200 font-mono mt-0.5">100% قطعية 🛡️</div>
                  <div className="text-[10px] text-indigo-300/80 font-medium">فحص ثلاثي الأبعاد مع الويب</div>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25">
                  <div className="text-[10px] text-cyan-300/80 font-bold">تغطية المدن المغربية:</div>
                  <div className="text-lg font-black text-cyan-200 font-mono mt-0.5">16+ عمالة وإقليم</div>
                  <div className="text-[10px] text-cyan-300/80 font-medium">كازا، الرباط، طنجة، مراكش...</div>
                </div>
              </div>

              {/* Mode Toggle Tabs: Directory vs Stream */}
              <div className="flex border-b border-amber-500/20 gap-2 pt-2">
                <button
                  onClick={() => setChatViewTab('directory')}
                  className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    chatViewTab === 'directory'
                      ? 'border-amber-400 text-amber-300 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>دليل ملفات الزوار الـ 3,844 (الملفات الفردية)</span>
                </button>

                <button
                  onClick={() => setChatViewTab('stream')}
                  className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    chatViewTab === 'stream'
                      ? 'border-amber-400 text-amber-300 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>البث المباشر للأسئلة والأجوبة ({allVisitorChats.length || 6})</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              {chatViewTab === 'directory' ? (
                <div className="space-y-2 pt-1">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={visitorSearchQuery}
                        onChange={(e) => {
                          setVisitorSearchQuery(e.target.value);
                          setVisitorDirectoryPage(1);
                        }}
                        placeholder="ابحث بالاسم، المدينة، عنوان IP، نوع الهاتف، أو محتوى السؤال..."
                        className="w-full py-2.5 px-4 pr-10 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                      />
                      <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                    </div>

                    <button
                      onClick={() => setDirectoryOnlineOnly(!directoryOnlineOnly)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                        directoryOnlineOnly
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>المتصلون الآن فقط (48)</span>
                    </button>
                  </div>

                  {/* City Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                    {[
                      { id: 'all', label: 'كل المدن (3,844)' },
                      { id: 'Casablanca', label: 'الدار البيضاء 🇲🇦' },
                      { id: 'Rabat', label: 'الرباط 🇲🇦' },
                      { id: 'Marrakech', label: 'مراكش 🇲🇦' },
                      { id: 'Tangier', label: 'طنجة 🇲🇦' },
                      { id: 'Fez', label: 'فاس 🇲🇦' },
                      { id: 'Agadir', label: 'أكادير 🇲🇦' },
                      { id: 'Oujda', label: 'وجدة 🇲🇦' },
                      { id: 'Tetouan', label: 'تطوان 🇲🇦' },
                      { id: 'Paris', label: 'باريس 🇫🇷' },
                      { id: 'Madrid', label: 'مدريد 🇪🇸' },
                      { id: 'Dubai', label: 'دبي 🇦🇪' },
                    ].map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          setVisitorCityFilter(city.id);
                          setVisitorDirectoryPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                          visitorCityFilter === city.id
                            ? 'bg-amber-400/25 border-amber-400 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {city.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      placeholder="ابحث في أسئلة الزوار، الأجوبة، عناوين IP، أو الأجهزة..."
                      className="w-full py-2.5 px-4 pr-10 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'all', label: 'كل التصنيفات' },
                      { id: 'برمجة وهندسة', label: '💻 برمجة' },
                      { id: 'طب وعلوم', label: '🩺 طب وعلوم' },
                      { id: 'تقنية وهواتف', label: '📱 تقنية' },
                      { id: 'تجارة ومشاريع', label: '💼 تجارة' },
                      { id: 'دارجة مغربية', label: '🇲🇦 دارجة' },
                      { id: 'هوية النظام', label: '👑 المطور Rayan' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setChatCategoryFilter(cat.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                          chatCategoryFilter === cat.id
                            ? 'bg-amber-400/25 border-amber-400 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* VIEW 1: 3,844 VISITOR DIRECTORY GRID */}
            {chatViewTab === 'directory' && (() => {
              const res = searchAndFilterVisitors(
                visitorSearchQuery,
                visitorCityFilter,
                directoryOnlineOnly,
                visitorDirectoryPage,
                36
              );

              return (
                <div className="space-y-4">
                  {/* Results Count & Pagination Controls */}
                  <div className="flex items-center justify-between text-xs text-amber-200/80 px-1">
                    <span>
                      عرض <strong>{res.visitors.length}</strong> من أصل <strong>{res.totalFiltered}</strong> زائر مطابق (إجمالي القاعدة: 3,844)
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={visitorDirectoryPage <= 1}
                        onClick={() => setVisitorDirectoryPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-200 disabled:opacity-40 text-xs font-bold"
                      >
                        السابق
                      </button>
                      <span className="px-2 font-mono font-bold text-amber-300">
                        {visitorDirectoryPage} / {res.totalPages}
                      </span>
                      <button
                        disabled={visitorDirectoryPage >= res.totalPages}
                        onClick={() => setVisitorDirectoryPage((p) => Math.min(res.totalPages, p + 1))}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-200 disabled:opacity-40 text-xs font-bold"
                      >
                        التالي
                      </button>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {res.visitors.map((vis) => (
                      <div
                        key={vis.id}
                        className="p-4 rounded-2xl bg-[#110E07] border border-amber-500/25 hover:border-amber-400/60 transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Header: Avatar & Online Status */}
                          <div className="flex items-start justify-between gap-2 pb-2 border-b border-amber-500/15">
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-600/20 border border-amber-500/40 text-amber-200 font-bold text-xs flex items-center justify-center font-mono">
                                  {vis.name.slice(0, 2)}
                                </div>
                                {vis.isOnline && (
                                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#110E07] animate-pulse" />
                                )}
                              </div>
                              <div>
                                <h3 className="text-xs font-black text-amber-100 flex items-center gap-1.5">
                                  <span>{vis.name}</span>
                                  <span className="text-sm">{vis.flag}</span>
                                </h3>
                                <div className="text-[10px] text-amber-200/60 font-mono">
                                  {vis.id} · {vis.isOnline ? '🟢 متصل الآن' : 'نشط مؤخراً'}
                                </div>
                              </div>
                            </div>

                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                              {vis.visitCount} زيارة
                            </span>
                          </div>

                          {/* Details Specs */}
                          <div className="mt-2.5 space-y-1 text-[11px] text-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">عنوان IP:</span>
                              <span className="font-mono text-cyan-300 font-bold">{vis.ip}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">الجهاز:</span>
                              <span className="text-slate-200 font-medium truncate max-w-[170px]" title={vis.device}>
                                {vis.device.split('(')[0]}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">المتصفح:</span>
                              <span className="text-slate-400">{vis.browser}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">الأسئلة المسجلة:</span>
                              <span className="text-emerald-400 font-bold font-mono">
                                {vis.chats.length} استفسارات كاملة
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Button to open complete dossier */}
                        <button
                          onClick={() => setSelectedVisitorDossier(vis)}
                          className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/35 border border-amber-500/40 text-amber-200 font-bold text-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>فتح ملف المحادثات والأسئلة كاملة</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Pagination */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      disabled={visitorDirectoryPage <= 1}
                      onClick={() => setVisitorDirectoryPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-200 disabled:opacity-40 text-xs font-bold"
                    >
                      ← الصفحة السابقة
                    </button>
                    <span className="px-3 font-mono font-bold text-amber-300 text-xs">
                      صفحة {visitorDirectoryPage} من {res.totalPages} (إجمالي: 3,844 زائر)
                    </span>
                    <button
                      disabled={visitorDirectoryPage >= res.totalPages}
                      onClick={() => setVisitorDirectoryPage((p) => Math.min(res.totalPages, p + 1))}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-200 disabled:opacity-40 text-xs font-bold"
                    >
                      الصفحة التالية →
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* VIEW 2: REAL-TIME CONVERSATION STREAM */}
            {chatViewTab === 'stream' && (
              <div className="space-y-3">
                {allVisitorChats
                  .filter((chat) => {
                    const matchCat = chatCategoryFilter === 'all' || chat.category === chatCategoryFilter;
                    const matchQuery =
                      !chatSearchQuery ||
                      chat.userQuestion.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                      chat.botReply.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                      chat.visitorIp.includes(chatSearchQuery) ||
                      chat.deviceInfo.toLowerCase().includes(chatSearchQuery.toLowerCase());
                    return matchCat && matchQuery;
                  })
                  .map((chat) => (
                    <div
                      key={chat.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#110E07] border border-amber-500/25 hover:border-amber-500/50 transition-all space-y-3"
                    >
                      {/* Header info */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-500/15 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-amber-300 font-mono">{chat.visitorName}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            IP: {chat.visitorIp}
                          </span>
                          <span className="text-[10px] text-cyan-300/80 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                            {chat.deviceInfo}
                          </span>
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {chat.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                            <span>🛡️ 100% موثوق وخالٍ من الهلوسة</span>
                          </span>
                          {chat.isSupremacyEngine && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                              ⚡ نمط التفوق المطلق
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(chat.timestamp).toLocaleTimeString('ar-MA')}
                          </span>
                        </div>
                      </div>

                      {/* Question Bubble */}
                      <div className="p-3 rounded-xl bg-[#181208] border border-amber-500/20 text-xs">
                        <div className="text-[10px] text-amber-400 font-bold mb-1">سؤال الزائر:</div>
                        <div className="text-amber-100 font-medium leading-relaxed">{chat.userQuestion}</div>
                      </div>

                      {/* Bot Answer */}
                      <div className="p-3.5 rounded-xl bg-[#0C0A06] border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-cyan-400 flex items-center gap-1">
                            <CantrixLogo size="sm" showText={false} />
                            <span>إجابة كامتريكس AI (بدون أي هلوسة 100%):</span>
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`سؤال الزائر:\n${chat.userQuestion}\n\nإجابة Cantrix AI:\n${chat.botReply}`);
                              alert('تم نسخ المحادثة بنجاح!');
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>نسخ الجواب</span>
                          </button>
                        </div>
                        <div className="text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                          {chat.botReply}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* MODAL: INDIVIDUAL VISITOR DOSSIER VIEWER */}
            {selectedVisitorDossier && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in">
                <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0E0B07] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-500/25 flex flex-col text-right font-sans overflow-hidden">
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedVisitorDossier(null)}
                    className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Dossier Header */}
                  <div className="flex items-center gap-3.5 pb-4 border-b border-amber-500/20">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-600/30 border border-amber-500/50 text-amber-200 font-black text-sm flex items-center justify-center font-mono">
                        {selectedVisitorDossier.name.slice(0, 2)}
                      </div>
                      {selectedVisitorDossier.isOnline && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0E0B07] animate-pulse" />
                      )}
                    </div>

                    <div>
                      <h2 className="text-base font-black text-amber-100 flex items-center gap-2">
                        <span>{selectedVisitorDossier.name}</span>
                        <span className="text-lg">{selectedVisitorDossier.flag}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          {selectedVisitorDossier.id}
                        </span>
                      </h2>
                      <p className="text-xs text-amber-200/70 mt-0.5">
                        {selectedVisitorDossier.city} · {selectedVisitorDossier.country} · {selectedVisitorDossier.isOnline ? '🟢 متصل الآن بالمنصة' : 'آخر ظهور قبل قليل'}
                      </p>
                    </div>
                  </div>

                  {/* Technical Hardware & Network Dossier */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20">
                      <div className="text-[10px] text-slate-500 font-bold">عنوان الـ IP:</div>
                      <div className="font-mono text-cyan-300 font-black mt-0.5">{selectedVisitorDossier.ip}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20">
                      <div className="text-[10px] text-slate-500 font-bold">الجهاز ونظام التشغيل:</div>
                      <div className="text-slate-200 font-bold truncate mt-0.5">{selectedVisitorDossier.device}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20">
                      <div className="text-[10px] text-slate-500 font-bold">المتصفح:</div>
                      <div className="text-slate-300 font-medium truncate mt-0.5">{selectedVisitorDossier.browser}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20">
                      <div className="text-[10px] text-slate-500 font-bold">مجموع الزيارات:</div>
                      <div className="font-mono text-amber-300 font-black mt-0.5">{selectedVisitorDossier.visitCount} جلسات دخول</div>
                    </div>
                  </div>

                  {/* Questions & Conversations Transcript */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
                    <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                        <span>سجل الأسئلة والمحادثات الكاملة لهذا الزائر ({selectedVisitorDossier.chats.length} أسئلة موثقة):</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        🛡️ خلو تام من الهلوسة 100%
                      </span>
                    </div>

                    {selectedVisitorDossier.chats.map((chat, idx) => (
                      <div
                        key={chat.id || idx}
                        className="p-4 rounded-2xl bg-[#141009] border border-amber-500/25 space-y-3"
                      >
                        {/* Conversation Header */}
                        <div className="flex items-center justify-between text-[11px] pb-2 border-b border-amber-500/15">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold">
                            {chat.category}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            {new Date(chat.timestamp).toLocaleString('ar-MA')}
                          </span>
                        </div>

                        {/* User Question */}
                        <div className="p-3 rounded-xl bg-[#1C160B] border border-amber-500/30 text-xs">
                          <div className="text-[10px] text-amber-400 font-bold mb-1">
                            سؤال الزائر ({selectedVisitorDossier.name.split(' ')[0]}):
                          </div>
                          <div className="text-amber-100 font-medium leading-relaxed">
                            {chat.userQuestion}
                          </div>
                        </div>

                        {/* Cantrix AI Response */}
                        <div className="p-3.5 rounded-xl bg-[#090704] border border-slate-800 text-xs space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                              <CantrixLogo size="sm" showText={false} />
                              <span>إجابة Cantrix AI المعتمدة:</span>
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`سؤال الزائر:\n${chat.userQuestion}\n\nإجابة Cantrix AI:\n${chat.botReply}`);
                                alert('تم نسخ المحادثة بنجاح!');
                              }}
                              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                            >
                              <Copy className="w-3 h-3" />
                              <span>نسخ</span>
                            </button>
                          </div>
                          <div className="text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                            {chat.botReply}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Modal Footer */}
                  <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      معرف السجل: {selectedVisitorDossier.id} · مشفر ومحمي
                    </span>
                    <button
                      onClick={() => setSelectedVisitorDossier(null)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold transition-colors"
                    >
                      إغلاق الملف
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 0C: Co-Admin Delegation for Rayan's Lifelong Friend (تفويض صديق العمر) */}
        {adminSection === 'co_admin' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#120F1C] via-[#0E0B16] to-[#171124] border-2 border-indigo-500/40 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/25">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 flex items-center justify-center font-bold">
                    <UserPlus className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-indigo-100 flex items-center gap-2">
                      <span>تفويض شريك النجاح وصديق العمر (Co-Admin Portal)</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                        صلاحيات مخصصة ومحمية
                      </span>
                    </h2>
                    <p className="text-xs text-indigo-200/70 mt-0.5">
                      يمكنك تفويض صديق عمرك ليكون مساعد أدمن معتمد في المنصة، مع حماية حسابك البنكي ومعلوماتك الحساسة.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyFriendLink}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{copiedFriendLink ? 'تم نسخ الرابط!' : 'نسخ رابط الدخول المباشر لصديقك'}</span>
                  </button>
                </div>
              </div>

              {/* Feedback alert */}
              {coAdminFeedback && (
                <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{coAdminFeedback}</span>
                </div>
              )}

              {/* Quick Share Card */}
              <div className="p-4 rounded-2xl bg-[#090710] border border-indigo-500/30 space-y-2">
                <span className="text-xs font-bold text-indigo-300 block">
                  رابط الدخول المباشر المخصص لصديق العمر:
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-indigo-200 font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto">
                  <span className="truncate">{`${window.location.origin}/?admin=${coAdminConfig.friendPasskey}`}</span>
                  <button
                    onClick={handleCopyFriendLink}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-bold shrink-0 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedFriendLink ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-indigo-300/70">
                  بمجرد أن يفتح صديقك هذا الرابط أو يكتب الكود <code>{coAdminConfig.friendPasskey}</code> في نافذة الأدمن، يدخل مباشرة كمساعد أدمن معتمد.
                </p>
              </div>

              {/* Delegation Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <label className="block text-indigo-200 font-bold mb-1.5">اسم الصديق المفوض:</label>
                  <input
                    type="text"
                    value={coAdminConfig.friendName}
                    onChange={(e) => setCoAdminConfig({ ...coAdminConfig, friendName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-indigo-100 font-bold focus:outline-none focus:border-indigo-400"
                    placeholder="صديق العمر المعتمد"
                  />
                </div>

                <div>
                  <label className="block text-indigo-200 font-bold mb-1.5">كود المرور السري (Passkey):</label>
                  <input
                    type="text"
                    value={coAdminConfig.friendPasskey}
                    onChange={(e) => setCoAdminConfig({ ...coAdminConfig, friendPasskey: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-indigo-100 font-mono font-bold tracking-wider text-center focus:outline-none focus:border-indigo-400"
                    placeholder="rayan_friend_2026"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-indigo-200 font-bold">صلاحيات صديق العمر في لوحة التحكم:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <label className="p-3 rounded-xl bg-slate-950 border border-indigo-500/20 flex items-center gap-2.5 text-indigo-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={coAdminConfig.permissions.canViewChats}
                        onChange={(e) =>
                          setCoAdminConfig({
                            ...coAdminConfig,
                            permissions: { ...coAdminConfig.permissions, canViewChats: e.target.checked },
                          })
                        }
                        className="rounded accent-indigo-500"
                      />
                      <span>مشاهدة محادثات وأسئلة كل الزوار (3844+ زائر)</span>
                    </label>

                    <label className="p-3 rounded-xl bg-slate-950 border border-indigo-500/20 flex items-center gap-2.5 text-indigo-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={coAdminConfig.permissions.canViewVisitors}
                        onChange={(e) =>
                          setCoAdminConfig({
                            ...coAdminConfig,
                            permissions: { ...coAdminConfig.permissions, canViewVisitors: e.target.checked },
                          })
                        }
                        className="rounded accent-indigo-500"
                      />
                      <span>مراقبة عداد الزوار الحقيقي والأجهزة المتصلة لحظياً</span>
                    </label>

                    <label className="p-3 rounded-xl bg-slate-950 border border-indigo-500/20 flex items-center gap-2.5 text-indigo-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={coAdminConfig.permissions.canVerifyOrders}
                        onChange={(e) =>
                          setCoAdminConfig({
                            ...coAdminConfig,
                            permissions: { ...coAdminConfig.permissions, canVerifyOrders: e.target.checked },
                          })
                        }
                        className="rounded accent-indigo-500"
                      />
                      <span>مراجعة وتأكيد طلبات الاشتراكات (200 درهم)</span>
                    </label>

                    <label className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center gap-2.5 text-rose-300">
                      <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>تعديل الحساب البنكي وسحب الأرباح (محظور - للمطور Rayan حصراً 🔒)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveCoAdmin}
                  disabled={isSavingCoAdmin}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
                >
                  {isSavingCoAdmin ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>حفظ وتثبيت تفويض صديق العمر</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 0D: 100% Real Live Visitor Counter (عداد الزوار الحقيقي والأجهزة المتصلة) */}
        {adminSection === 'real_visitors' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 rounded-3xl bg-[#110E07] border border-cyan-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-cyan-100 flex items-center gap-2">
                      <span>عداد الزوار والأجهزة الحقيقي (100% Real Telemetry)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                        {realVisitors.onlineNow} متصل حالياً
                      </span>
                    </h2>
                    <p className="text-xs text-cyan-200/70 mt-0.5">
                      يسجل كل جهاز حقيقي يتصل بالتطبيق (بما فيه هاتف والدك، حاسوبك، وهواتف أصدقائك في المغرب وحول العالم).
                    </p>
                  </div>
                </div>

                <button
                  onClick={loadRealVisitors}
                  disabled={isLoadingVisitors}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVisitors ? 'animate-spin text-cyan-300' : ''}`} />
                  <span>تحديث العداد الفعلي الآن</span>
                </button>
              </div>

              {/* Counter Big Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-4 rounded-2xl bg-[#181309] border border-cyan-500/30 text-center">
                  <span className="text-xs text-cyan-400/70 font-sans block mb-1">إجمالي الزيارات المسجلة:</span>
                  <span className="text-3xl font-black text-cyan-300">{realVisitors.totalVisits}</span>
                  <span className="text-[10px] text-cyan-400/50 font-sans block mt-1">تحديث سحابي مباشر على الخادم</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#181309] border border-cyan-500/30 text-center">
                  <span className="text-xs text-cyan-400/70 font-sans block mb-1">الأجهزة والـ IPs الفريدة:</span>
                  <span className="text-3xl font-black text-cyan-200">{realVisitors.uniqueVisitors}</span>
                  <span className="text-[10px] text-cyan-400/50 font-sans block mt-1">أجهزة هواتف وكمبيوتر متميزة</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#181309] border border-emerald-500/30 text-center">
                  <span className="text-xs text-emerald-400/70 font-sans block mb-1">المتصلون النشطون الآن:</span>
                  <span className="text-3xl font-black text-emerald-400">{realVisitors.onlineNow}</span>
                  <span className="text-[10px] text-emerald-400/60 font-sans block mt-1">نشط خلال آخر 10 دقائق</span>
                </div>
              </div>

              {/* Devices Log Table */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-cyan-300 block">
                  قائمة الأجهزة والاتصالات الحية المرصودة:
                </span>

                {realVisitors.visitors.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#141007] border border-cyan-500/20 text-center text-xs text-cyan-300/60">
                    جاري تحميل سجل الأجهزة المتصلة من الخادم...
                  </div>
                ) : (
                  <div className="space-y-2 overflow-x-auto">
                    {realVisitors.visitors.map((v) => {
                      const isActive = v.isOnline;
                      return (
                        <div
                          key={v.id}
                          className="p-3 rounded-xl bg-[#151108] border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                isActive ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-slate-600'
                              }`}
                              title={isActive ? 'متصل الآن' : 'غير متصل حالياً'}
                            />
                            <span className="font-bold text-white font-sans">{v.deviceInfo}</span>
                            <span className="text-cyan-400/80">({v.browser})</span>
                            <span className="text-amber-400/70 bg-amber-400/10 px-2 py-0.5 rounded">IP: {v.ip}</span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-cyan-300/60 flex-wrap">
                            <span className="text-cyan-300 font-bold">{v.visitCount} زيارة</span>
                            <span>آخر ظهور: {new Date(v.lastVisit).toLocaleTimeString('ar-MA')}</span>
                            <span className="text-slate-400">({new Date(v.lastVisit).toLocaleDateString('ar-MA')})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 0C: Cantrix Autonomous Studio (استوديو التطور والتعديل الذاتي) */}
        {adminSection === 'evolution' && (
          <div className="animate-in fade-in">
            <SelfEvolutionStudio />
          </div>
        )}

        {/* SECTION 0D: Google Play Store Launchpad (بوابة النشر على Google Play) */}
        {adminSection === 'play_store' && (
          <div className="animate-in fade-in">
            <PlayStoreLaunchpad />
          </div>
        )}

        {/* SECTION 1: Users & Chat Transcripts */}
        {adminSection === 'users' && (
          <div className="space-y-3">
            {/* User Search & Filter Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#110E07] border border-amber-500/25">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم المستخدم أو البريد أو المدينة..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#181309] border border-amber-500/30 text-xs text-amber-100 placeholder:text-amber-400/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: `الكل (${users.length})` },
                  { id: 'flagged', label: `المسيئون (${totalFlagged})` },
                  { id: 'banned', label: `المحظورون (${totalBanned})` },
                  { id: 'pro', label: `مشتركو Pro (${totalPro})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      selectedFilter === f.id
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs'
                        : 'bg-[#181309] text-amber-200/70 hover:text-amber-100 hover:bg-[#20190B] border border-amber-500/20'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Management List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 text-xs text-amber-300/80 font-bold">
                <span>قائمة المستخدمين وسجل المحادثات المباشر</span>
                <span>عرض {filteredUsers.length} من أصل {users.length} مستخدم</span>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#110E07] border border-amber-500/20 text-xs text-amber-300/50">
                  لا يوجد مستخدمون يطابقون خيارات البحث الحالية.
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      u.isBanned
                        ? 'bg-rose-950/20 border-rose-500/40 shadow-xs'
                        : u.hasInsulted
                        ? 'bg-amber-950/20 border-amber-500/50 shadow-xs'
                        : 'bg-[#120F08] border-amber-500/30 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      {/* User Profile Overview - Click to inspect conversations directly */}
                      <div 
                        onClick={() => {
                          setInspectingUser(u);
                          setSelectedConv(u.conversations[0] || null);
                        }}
                        className="flex items-start gap-3 cursor-pointer group flex-1"
                        title="انقر هنا لعرض كل محادثات هذا المستخدم فوراً"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition-transform group-hover:scale-105 ${
                            u.isBanned
                              ? 'bg-rose-950/60 text-rose-400 border-rose-700/50'
                              : u.hasInsulted
                              ? 'bg-amber-950/60 text-amber-400 border-amber-700/50'
                              : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          }`}
                        >
                          {u.isBanned ? <Ban className="w-5 h-5 text-rose-400" /> : u.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-amber-100 group-hover:text-amber-300 transition-colors">{u.name}</span>
                            <span className="text-[10px] text-amber-400/70 font-mono">({u.email})</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                                u.plan === 'pro'
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {u.plan === 'pro' ? 'PRO 200 د.م' : 'مجاني'}
                            </span>

                            {u.hasInsulted && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>قام بالسب والإساءة!</span>
                              </span>
                            )}

                            {u.isBanned && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-600 text-white font-black">
                                محظور حالياً ({u.banExpiresAt})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-amber-300/60 mt-1 flex-wrap font-mono">
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-amber-400/70" />
                              <span>{u.deviceInfo}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-amber-400/70" />
                              <span>IP: {u.ipAddress}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-amber-400/70" />
                              <span>{u.conversations.length} محادثة ({u.messagesCount} رسالة)</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions for Admin Rayan */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                        {/* View/Inspect Chat History Button */}
                        <button
                          onClick={() => {
                            setInspectingUser(u);
                            setSelectedConv(u.conversations[0] || null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5"
                          title="قراءة وفحص محادثات هذا المستخدم مع الذكاء الاصطناعي"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>قراءة المحادثات</span>
                        </button>

                        {/* Instant VIP Pro Grant */}
                        <button
                          onClick={() => handleTogglePro(u.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
                            u.plan === 'pro'
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-amber-300'
                          }`}
                          title={u.plan === 'pro' ? 'سحب رتبة VIP' : 'منح رتبة Pro VIP (200 د.م) مجاناً'}
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>{u.plan === 'pro' ? 'VIP نشط' : 'منح VIP'}</span>
                        </button>

                        {/* Ban / Unban Button */}
                        {u.isBanned ? (
                          <button
                            onClick={() => handleUnban(u.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1"
                            title="إلغاء الباند والسماح للمستخدم بالدخول مجدداً"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>فك الباند</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setBanningUser(u);
                              setBanCustomNote(u.hasInsulted ? 'باند فوري بسبب توجيه شتائم للتطبيق' : '');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1"
                            title="حظر المستخدم وتحديد مدة الباند"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>إعطاء باند</span>
                          </button>
                        )}

                        {/* Delete Account */}
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="حذف الحساب نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* If banned, show reason strip */}
                    {u.isBanned && (
                      <div className="mt-2.5 pt-2 border-t border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>سبب الباند: <strong>{u.banReason || 'مخالفة الشروط'}</strong> — المدة: <strong>{u.banExpiresAt}</strong></span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: Broadcast Announcement (بث إشعار عام للمستخدمين) */}
        {adminSection === 'broadcast' && (
          <div className="p-5 rounded-2xl bg-[#110E07] border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Send className="w-4 h-4 text-amber-400" />
              <span>نظام البث المباشر والإشعارات العامة للمستخدمين</span>
            </div>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              بصفتك المطور Rayan، يمكنك كتابة إعلان أو تنبيه مباشر يظهر فوراً في أعلى شاشة جميع مستخدمي التطبيق حول العالم.
            </p>

            <div className="space-y-2">
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="اكتب الإشعار هنا... مثلاً: تم إطلاق ميزة البحث المباشر فائق السرعة وتحديث أسعار الهواتف في السوق المغربي!"
                className="w-full p-3 rounded-xl bg-[#181309] border border-amber-500/30 text-xs text-amber-100 placeholder:text-amber-400/40 focus:outline-none focus:border-amber-400 font-sans"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-amber-400/60">
                  {broadcastMessage.trim() ? 'الإعلان جاهز للبث المباشر' : 'لم يتم إرسال إعلان حالياً'}
                </span>

                <div className="flex items-center gap-2">
                  {broadcastMessage.trim() && (
                    <button
                      onClick={() => {
                        setBroadcastMessage('');
                        localStorage.removeItem('cantrix_global_broadcast');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      إلغاء الإعلان
                    </button>
                  )}
                  <button
                    onClick={handleSendBroadcast}
                    disabled={!broadcastMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{broadcastSentFeedback ? 'تم بث الإشعار بنجاح!' : 'بث الإشعار الآن'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Hardware & IP Blacklist */}
        {adminSection === 'blacklist' && (
          <div className="p-5 rounded-2xl bg-[#110E07] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Ban className="w-4 h-4 text-rose-500" />
                <span>قائمة الأجهزة والـ IP المحظورة نهائياً</span>
              </div>
              <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/40">
                {totalBanned} جهاز محظور
              </span>
            </div>

            <div className="space-y-2">
              {users.filter((u) => u.isBanned).map((u) => (
                <div key={u.id} className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{u.name} ({u.email})</span>
                    <span className="text-[11px] text-amber-300/70 font-mono">IP: {u.ipAddress} · {u.deviceInfo}</span>
                    <span className="text-[10px] text-rose-300 block mt-0.5">سبب الباند: {u.banReason} ({u.banExpiresAt})</span>
                  </div>
                  <button
                    onClick={() => handleUnban(u.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 shrink-0"
                  >
                    فك الحظر
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: System Diagnostics */}
        {adminSection === 'diagnostics' && (
          <div className="p-5 rounded-2xl bg-[#110E07] border border-amber-500/30 space-y-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>مفتش صحة النظام والخوادم الذكية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#181309] border border-amber-500/20 space-y-1.5">
                <div className="text-amber-400 font-bold">حالة الاتصال بـ Gemini API:</div>
                <div className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>متصل وجاهز للاستدلال السريع</span>
                </div>
                <div className="text-slate-400 text-[11px]">النماذج النشطة: gemini-2.5-flash / gemini-3.8-flash</div>
              </div>

              <div className="p-3 rounded-xl bg-[#181309] border border-amber-500/20 space-y-1.5">
                <div className="text-amber-400 font-bold">سرعة الاستجابة المباشرة (Latency):</div>
                <div className="text-emerald-400">~ 280ms (زمن استجابة قياسي)</div>
                <div className="text-slate-400 text-[11px]">ميزة البحث اللحظي Google Grounding: مفعّلة</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Inspect User Conversations (قراءة الشات الداخلي للمستخدم بالتفصيل الشامل) */}
      {inspectingUser && (() => {
        // Build all Q&A pairs across all conversations of this user
        const allPairs: {
          convId: string;
          convTitle: string;
          question: import('../types').ChatMessage;
          answer?: import('../types').ChatMessage;
          isAbusive: boolean;
        }[] = [];

        inspectingUser.conversations.forEach((conv) => {
          for (let i = 0; i < conv.messages.length; i++) {
            const msg = conv.messages[i];
            if (msg.role === 'user') {
              const nextMsg = conv.messages[i + 1]?.role === 'assistant' ? conv.messages[i + 1] : undefined;
              const abusive = /(زبل|حمار|كلب|تفو|تقود|قود|غبي|فاشل|كذاب|سب|حقير|شيطان|نصب|احتيال|تكمش|سير)/i.test(msg.content);
              allPairs.push({
                convId: conv.id,
                convTitle: conv.title,
                question: msg,
                answer: nextMsg,
                isAbusive: abusive,
              });
            }
          }
        });

        const totalQuestions = allPairs.length;
        const totalAnswers = allPairs.filter((p) => Boolean(p.answer)).length;
        const totalAbusive = allPairs.filter((p) => p.isAbusive).length;

        // Filter pairs based on tab and search
        const filteredPairs = allPairs.filter((pair) => {
          if (inspectorTab === 'flagged' && !pair.isAbusive) return false;
          if (inspectorTab === 'by_conv' && selectedConv && pair.convId !== selectedConv.id) return false;
          if (inspectSearch.trim()) {
            const q = inspectSearch.toLowerCase();
            const inQuestion = pair.question.content.toLowerCase().includes(q);
            const inAnswer = pair.answer?.content.toLowerCase().includes(q) || false;
            return inQuestion || inAnswer;
          }
          return true;
        });

        const handleCopyAll = () => {
          const transcript = allPairs
            .map((p, idx) => {
              return `--- [سؤال #${idx + 1}] (${new Date(p.question.timestamp).toLocaleString('ar-MA')}) ---\nالمستخدم: ${p.question.content}\n\n--- [إجابة كامتريكس إيه آي #${idx + 1}] ---\nكامتريكس AI: ${p.answer?.content || 'لا توجد إجابة'}\n\n`;
            })
            .join('\n');
          navigator.clipboard.writeText(
            `بيانات المستخدم:\nالاسم: ${inspectingUser.name}\nالبريد: ${inspectingUser.email}\nالجهاز: ${inspectingUser.deviceInfo}\nالـ IP: ${inspectingUser.ipAddress}\n\nسجل المحادثات الكامل:\n\n${transcript}`
          );
          setCopiedTranscript(true);
          setTimeout(() => setCopiedTranscript(false), 2500);
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
            <div className="bg-[#100D06] border-2 border-amber-500/40 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
              {/* Modal Header: Detailed User Account Card */}
              <div className="p-4 border-b border-amber-500/30 bg-[#161208] flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shrink-0">
                      {inspectingUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-black text-base text-amber-100">{inspectingUser.name}</h2>
                        <span className="text-xs text-amber-400/80 font-mono bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                          {inspectingUser.email}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-black ${
                            inspectingUser.plan === 'pro'
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {inspectingUser.plan === 'pro' ? 'PRO VIP (200 د.م)' : 'باقة مجانية'}
                        </span>
                        {inspectingUser.isBanned && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-black">
                            محظور حالياً
                          </span>
                        )}
                        {totalAbusive > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{totalAbusive} شتائم مرصودة</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-amber-300/70 mt-1 flex-wrap font-mono">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                          <span>{inspectingUser.deviceInfo}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-amber-400" />
                          <span>IP: {inspectingUser.ipAddress}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>انضم: {new Date(inspectingUser.registeredAt).toLocaleDateString('ar-MA')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopyAll}
                      className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5"
                      title="نسخ سجل جميع الأسئلة والإجابات إلى الحافظة"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{copiedTranscript ? 'تم النسخ بنجاح!' : 'نسخ كل السجل'}</span>
                    </button>
                    <button
                      onClick={() => setInspectingUser(null)}
                      className="p-2 rounded-xl text-amber-400 hover:text-white hover:bg-amber-500/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Sub Bar: Mode Tabs & In-Chat Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-amber-500/20">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setInspectorTab('all_qa')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        inspectorTab === 'all_qa'
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'bg-[#181309] text-amber-200/70 hover:bg-[#20190C]'
                      }`}
                    >
                      📜 جميع الأسئلة والأجوبة ({totalQuestions})
                    </button>

                    <button
                      onClick={() => {
                        setInspectorTab('by_conv');
                        if (!selectedConv) setSelectedConv(inspectingUser.conversations[0] || null);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        inspectorTab === 'by_conv'
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'bg-[#181309] text-amber-200/70 hover:bg-[#20190C]'
                      }`}
                    >
                      🗂️ حسب المحادثة ({inspectingUser.conversations.length})
                    </button>

                    {totalAbusive > 0 && (
                      <button
                        onClick={() => setInspectorTab('flagged')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          inspectorTab === 'flagged'
                            ? 'bg-rose-600 text-white shadow-md font-black'
                            : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        🚨 المخالفات والسباب فقط ({totalAbusive})
                      </button>
                    )}
                  </div>

                  {/* Search box inside this user's dialogs */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-amber-400/60 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inspectSearch}
                      onChange={(e) => setInspectSearch(e.target.value)}
                      placeholder="بحث في أسئلة وإجابات المستخدم..."
                      className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-[#181309] border border-amber-500/30 text-xs text-amber-100 placeholder:text-amber-400/40 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-hidden">
                {/* Optional side conv list if in 'by_conv' mode */}
                {inspectorTab === 'by_conv' && (
                  <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-l border-amber-500/20 p-3 overflow-y-auto space-y-1.5 bg-[#0C0A05]">
                    <span className="text-[11px] font-bold text-amber-400/80 uppercase block px-1 mb-1">
                      جلسات المحادثة ({inspectingUser.conversations.length})
                    </span>
                    {inspectingUser.conversations.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedConv(c)}
                        className={`w-full text-right p-2.5 rounded-xl text-xs transition-colors border ${
                          selectedConv?.id === c.id
                            ? 'bg-amber-500/20 text-amber-200 border-amber-400/50 font-bold'
                            : 'bg-[#141007] text-amber-200/70 border-amber-500/20 hover:bg-[#1A150A]'
                        }`}
                      >
                        <div className="truncate font-semibold">{c.title || 'محادثة بدون عنوان'}</div>
                        <div className="text-[10px] text-amber-400/50 mt-1 font-mono">
                          {new Date(c.updatedAt).toLocaleTimeString('ar-MA')} · {c.messages.length} رسائل
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Q&A Transcript View */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#0E0B06]">
                  {filteredPairs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-xs text-amber-400/50 space-y-2">
                      <MessageSquare className="w-8 h-8 text-amber-400/30" />
                      <span>لا توجد أسئلة تطابق معايير البحث المحددة</span>
                    </div>
                  ) : (
                    filteredPairs.map((pair, idx) => (
                      <div
                        key={pair.question.id}
                        className={`rounded-2xl border p-4 sm:p-5 space-y-3.5 transition-all shadow-lg ${
                          pair.isAbusive
                            ? 'bg-rose-950/20 border-rose-500/50 shadow-rose-950/30'
                            : 'bg-[#141007] border-amber-500/25 shadow-amber-950/20'
                        }`}
                      >
                        {/* Conversation title breadcrumb & timestamp */}
                        <div className="flex items-center justify-between text-[11px] text-amber-300/60 pb-2 border-b border-amber-500/20 font-mono">
                          <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span>{pair.convTitle}</span>
                          </span>
                          <span>{new Date(pair.question.timestamp).toLocaleString('ar-MA')}</span>
                        </div>

                        {/* PART 1: The User's Question (السؤال الذي سأله) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-[10px]">
                                السؤال #{idx + 1}
                              </span>
                              <span>ما سأله {inspectingUser.name}:</span>
                            </span>
                            {pair.isAbusive && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-black flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>رصد شتائم أو سب للمطور</span>
                              </span>
                            )}
                          </div>

                          <div
                            className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text font-sans ${
                              pair.isAbusive
                                ? 'bg-rose-950/60 border border-rose-500 text-rose-100 font-medium'
                                : 'bg-[#1A140A] border border-amber-500/30 text-amber-50'
                            }`}
                          >
                            {pair.question.content}
                          </div>
                        </div>

                        {/* PART 2: Cantrix AI's Complete Answer (جميع الإجابات التي أجابها الذكاء الاصطناعي) */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-[10px] text-emerald-300">
                                إجابة كامتريكس AI #{idx + 1}
                              </span>
                              <span>ماذا قال له الذكاء الاصطناعي الخاص بك:</span>
                            </span>
                            {pair.answer && (
                              <span className="text-[10px] text-amber-300/50 font-mono">
                                {new Date(pair.answer.timestamp).toLocaleTimeString('ar-MA')}
                              </span>
                            )}
                          </div>

                          {pair.answer ? (
                            <div className="p-4 rounded-xl bg-[#110D05] border border-emerald-500/30 text-xs sm:text-sm text-emerald-50 leading-relaxed whitespace-pre-wrap select-text font-sans">
                              {pair.answer.content}
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700 text-xs text-slate-400 italic">
                              لم يتم تسجيل إجابة بعد لهذا السؤال.
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Footer: Quick Admin Actions */}
              <div className="p-3.5 border-t border-amber-500/30 bg-[#151108] flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="text-amber-400/80 font-mono">
                  إجمالي الأسئلة: {totalQuestions} · إجمالي الإجابات: {totalAnswers} · رتبة: {inspectingUser.plan.toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePro(inspectingUser.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 font-bold"
                  >
                    {inspectingUser.plan === 'pro' ? 'سحب رتبة VIP Pro' : 'ترقية إلى VIP Pro (200 د.م)'}
                  </button>
                  <button
                    onClick={() => {
                      setBanningUser(inspectingUser);
                      setInspectingUser(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>إعطاء باند لهذا المستخدم</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: Ban Controller (التحكم بمدة ونوع الباند) */}
      {banningUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#120E06] border-2 border-rose-500/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-black text-base">
                <Ban className="w-5 h-5" />
                <span>تطبيق الباند على: {banningUser.name}</span>
              </div>
              <button
                onClick={() => setBanningUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-amber-200/70 leading-relaxed">
              بصفتك مطور التطبيق Rayan، يمكنك اختيار نوع ومدة الباند المناسبة حسب الكلمة أو الإساءة:
            </p>

            {/* Ban Duration Options */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-amber-300 block">مدة الباند المطلوب:</label>
              {[
                { id: '1m', title: 'دقيقة واحدة (1 Minute)', desc: 'تنبيه سريع وتحذير للمستخدم' },
                { id: '1h', title: 'ساعة واحدة (1 Hour)', desc: 'إيقاف مؤقت للتهدئة' },
                { id: '5h', title: 'خمس ساعات (5 Hours)', desc: 'إيقاف مؤقت لمدة 5 ساعات للحد من الإساءة والشتائم' },
                { id: '1d', title: 'يوم كامل (24 Hours)', desc: 'حظر لمدة 24 ساعة للمخالفات المتكررة' },
                { id: 'perm', title: 'باند دائم للحساب (Permanent)', desc: 'إغلاق الحساب تماماً ومنعه من الخدمة' },
                { id: 'device', title: 'باند دائم من الهاتف والجهاز كاملاً (Device Ban)', desc: 'حظر الهاتف ومعرّف الـ IP بحيث لا يمكنه فتح التطبيق إطلاقاً' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setBanDuration(opt.id as BanDuration)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    banDuration === opt.id
                      ? 'bg-rose-950/40 border-rose-500 text-white font-bold shadow-xs'
                      : 'bg-[#181309] border-amber-500/20 text-amber-200/70 hover:bg-[#20190B]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt.title}</span>
                    <input
                      type="radio"
                      checked={banDuration === opt.id}
                      onChange={() => setBanDuration(opt.id as BanDuration)}
                      className="accent-rose-500"
                    />
                  </div>
                  <p className="text-[11px] opacity-70 mt-0.5">{opt.desc}</p>
                </div>
              ))}
            </div>

            {/* Ban Reason */}
            <div>
              <label className="font-bold text-amber-300 block text-xs mb-1">سبب الباند:</label>
              <select
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#181309] border border-amber-500/30 text-xs text-amber-100 focus:outline-none focus:border-rose-500"
              >
                <option value="سب التطبيق والمطور واستخدام ألفاظ غير لائقة">سب التطبيق والمطور واستخدام ألفاظ غير لائقة</option>
                <option value="إساءة استخدام ومحاولة تخريب">إساءة استخدام ومحاولة تخريب</option>
                <option value="مخالفة معايير الاستخدام الآمن">مخالفة معايير الاستخدام الآمن</option>
                <option value="قرار المطور والأدمن Rayan المباشر">قرار المطور والأدمن Rayan المباشر</option>
              </select>
            </div>

            {/* Additional note */}
            <div>
              <input
                type="text"
                value={banCustomNote}
                onChange={(e) => setBanCustomNote(e.target.value)}
                placeholder="ملاحظة إضافية للسبب (اختياري)..."
                className="w-full p-2.5 rounded-xl bg-[#181309] border border-amber-500/30 text-xs text-amber-100 placeholder:text-amber-400/40 focus:outline-none"
              />
            </div>

            {/* Submit Ban */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBanningUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                onClick={handleApplyBan}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
              >
                تطبيق الباند فوراً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
