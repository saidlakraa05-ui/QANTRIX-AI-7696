import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  MessageSquare, 
  Mic, 
  Video, 
  Wrench, 
  Crown, 
  Settings, 
  Info, 
  Trash2, 
  Search, 
  User, 
  X,
  Download,
  ShieldAlert,
  Brain,
  Activity
} from 'lucide-react';
import { ChatConversation, UserSession } from '../types';
import { CreditCard } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  user: UserSession;
  onOpenSubscription: () => void;
  onOpenMySubscription?: () => void;
  onOpenAbout: () => void;
  onOpenSettings: () => void;
  onOpenInstall: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  user,
  onOpenSubscription,
  onOpenMySubscription,
  onOpenAbout,
  onOpenSettings,
  onOpenInstall,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) =>
    (c.title || 'محادثة جديدة').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const baseNavItems = [
    { id: 'chat', label: 'المحادثة والبحث المباشر', icon: MessageSquare, badge: null },
    ...(user.isAdmin ? [{ id: 'admin', label: 'لوحة الأدمن الخارقة (Rayan)', icon: Crown, badge: 'MASTER' }] : []),
    { id: 'my_subscription', label: 'صفحة اشتراكي (الاستعادة)', icon: CreditCard, badge: 'VIP' },
    { id: 'memory', label: 'الذاكرة الذكية المتقدمة', icon: Brain, badge: 'جديد' },
    { id: 'benchmark', label: 'تقييم الذكاء والمعايير', icon: Activity, badge: 'فحص' },
    { id: 'voice', label: 'المحادثة الصوتية الحية', icon: Mic, badge: 'Live' },
    { id: 'video', label: 'استوديو الفيديو AI', icon: Video, badge: 'AI' },
    { id: 'tools', label: 'أدوات Cantrix الذكية', icon: Wrench, badge: null },
    { id: 'subscription', label: 'ترقية Cantrix Pro VIP', icon: Crown, badge: '200 د.م' },
  ];

  const navItems = baseNavItems;
  const isPro = user.plan === 'pro';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 right-0 z-50 w-72 flex flex-col transition-all duration-300 ease-in-out border-l ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        } ${
          isPro
            ? 'bg-[#0E0C07] border-amber-500/25 text-amber-100 shadow-xl shadow-amber-950/20'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        {/* Top Header & Close button on Mobile */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isPro ? 'border-amber-500/20' : 'border-slate-200'
          }`}
        >
          <button
            onClick={() => {
              onNewChat();
              onSelectTab('chat');
              if (window.innerWidth < 768) onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] ${
              isPro
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>محادثة جديدة</span>
          </button>

          <button
            onClick={onClose}
            className={`p-1.5 ml-2 rounded-lg transition-colors md:hidden ${
              isPro
                ? 'text-amber-300 hover:text-white hover:bg-amber-500/10'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (window.innerWidth < 768) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isPro
                    ? isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold shadow-xs'
                      : 'text-amber-200/70 hover:text-amber-100 hover:bg-amber-500/10'
                    : isActive
                    ? 'bg-white text-indigo-700 border border-slate-200 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isPro
                        ? isActive
                          ? 'text-amber-400'
                          : 'text-amber-300/60'
                        : isActive
                        ? 'text-indigo-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isPro
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Standalone App Install button */}
          <button
            onClick={() => {
              onOpenInstall();
              if (window.innerWidth < 768) onClose();
            }}
            className={`w-full mt-2 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs border ${
              isPro
                ? 'bg-[#151108] text-amber-300 border-amber-500/30 hover:border-amber-400 hover:bg-[#1A150A]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Download
                className={`w-3.5 h-3.5 ${
                  isPro ? 'text-amber-400' : 'text-slate-600'
                }`}
              />
              <span>تحميل التطبيق (هاتف & PC)</span>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                isPro
                  ? 'bg-amber-400/20 text-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              تثبيت
            </span>
          </button>
        </div>

        {/* Chat History Section */}
        <div
          className={`flex-1 flex flex-col min-h-0 px-3 pt-3 pb-2 border-t ${
            isPro ? 'border-amber-500/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between px-2 mb-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                isPro ? 'text-amber-300/70' : 'text-slate-500'
              }`}
            >
              سجل المحادثات
            </span>
            <span
              className={`text-[11px] font-mono ${
                isPro ? 'text-amber-400/60' : 'text-slate-400'
              }`}
            >
              {conversations.length}
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative mb-2">
            <Search
              className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 ${
                isPro ? 'text-amber-400/60' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المحادثات..."
              className={`w-full pl-3 pr-8 py-1.5 rounded-lg text-xs focus:outline-none border ${
                isPro
                  ? 'bg-[#141007] border-amber-500/30 text-amber-100 placeholder:text-amber-300/40 focus:border-amber-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600'
              }`}
            />
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
            {filteredConversations.length === 0 ? (
              <div
                className={`text-center py-6 px-2 text-xs ${
                  isPro ? 'text-amber-300/50' : 'text-slate-400'
                }`}
              >
                {conversations.length === 0 ? 'لا توجد محادثات سابقة بعد' : 'لا توجد نتائج تطابق بحثك'}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversationId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onSelectTab('chat');
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors border ${
                      isPro
                        ? isSelected
                          ? 'bg-[#1C1609] text-amber-200 font-bold border-amber-500/40 shadow-xs'
                          : 'text-amber-200/70 border-transparent hover:text-amber-100 hover:bg-amber-500/10'
                        : isSelected
                        ? 'bg-white text-slate-900 font-bold border-slate-300 shadow-xs'
                        : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{conv.title || 'محادثة بدون عنوان'}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-400 transition-opacity"
                      title="حذف المحادثة"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Links & User Profile */}
        <div
          className={`p-3 border-t space-y-2 ${
            isPro ? 'border-amber-500/20 bg-[#0C0A06]' : 'border-slate-200 bg-slate-100/60'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs px-2 ${
              isPro ? 'text-amber-300/70' : 'text-slate-500'
            }`}
          >
            <button
              onClick={() => {
                onOpenSettings();
                if (window.innerWidth < 768) onClose();
              }}
              className={`flex items-center gap-1.5 transition-colors ${
                isPro ? 'hover:text-amber-100' : 'hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>الإعدادات</span>
            </button>

            <button
              onClick={() => {
                onOpenAbout();
                if (window.innerWidth < 768) onClose();
              }}
              className={`flex items-center gap-1.5 transition-colors ${
                isPro ? 'hover:text-amber-100' : 'hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>عن المطور Rayan</span>
            </button>
          </div>

          {/* User Account Card */}
          <div 
            onClick={onOpenSubscription}
            className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
              isPro
                ? 'bg-gradient-to-br from-[#1C170B] via-[#141007] to-[#1F190D] border-amber-500/40 text-amber-100 shadow-lg shadow-amber-950/40 hover:border-amber-400'
                : 'bg-white border-slate-200 text-slate-800 shadow-xs hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                    isPro
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isPro ? <Crown className="w-3.5 h-3.5 fill-current" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold truncate">
                    {user.name}
                  </p>
                  <p
                    className={`text-[10px] ${
                      isPro ? 'text-amber-300/70 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {isPro ? 'Cantrix Pro VIP (200 د.م)' : 'الخطة العادية (البيضاء)'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-black ${
                  isPro 
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {isPro ? 'PRO GOLD' : 'FREE'}
              </span>
            </div>

            {/* Quota Progress */}
            <div className="space-y-1">
              <div
                className={`flex justify-between text-[10px] font-mono ${
                  isPro ? 'text-amber-300/70' : 'text-slate-500'
                }`}
              >
                <span>الرسائل المتبقية:</span>
                <span>{user.messagesRemaining} / {user.maxMessages}</span>
              </div>
              <div
                className={`h-1.5 w-full rounded-full overflow-hidden ${
                  isPro ? 'bg-[#1F190C]' : 'bg-slate-100'
                }`}
              >
                <div 
                  className={`h-full transition-all rounded-full ${
                    isPro
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                      : user.messagesRemaining > 5
                      ? 'bg-slate-800'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (user.messagesRemaining / user.maxMessages) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
