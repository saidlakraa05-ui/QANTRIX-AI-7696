import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ChatView } from './components/ChatView';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { VideoStudioView } from './components/VideoStudioView';
import { ToolsView } from './components/ToolsView';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { InstallAppModal } from './components/InstallAppModal';
import { AdminPanel } from './components/AdminPanel';
import { SmartMemoryModal } from './components/SmartMemoryModal';
import { BenchmarkModal } from './components/BenchmarkModal';
import { CodePreviewModal } from './components/CodePreviewModal';
import { MySubscriptionModal } from './components/MySubscriptionModal';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { CantrixLogo } from './components/CantrixLogo';

import { 
  UserSession, 
  ChatConversation, 
  ChatMessage, 
  VideoProject, 
  EngineStatus, 
  AppMode, 
  AttachedFile,
  SmartMemory,
  EngineConfig
} from './types';
import { storage, PriceSettings } from './utils/storage';
import { SpeechSettings, novaVoice } from './utils/speech';

export default function App() {
  // Persistence state
  const [user, setUser] = useState<UserSession>(() => storage.getUser());
  const [conversations, setConversations] = useState<ChatConversation[]>(() => storage.getConversations());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => storage.getCurrentConversationId());
  const [videos, setVideos] = useState<VideoProject[]>(() => storage.getVideos());
  const [speechSettings, setSpeechSettings] = useState<SpeechSettings>(() => storage.getSpeechSettings());
  const [priceSettings, setPriceSettings] = useState<PriceSettings>(() => storage.getPriceSettings());
  const [adminRecognition, setAdminRecognition] = useState<boolean>(() => storage.getAdminSettings().recognitionActive);
  const [memories, setMemories] = useState<SmartMemory[]>(() => storage.getMemories());
  const [engineConfig, setEngineConfig] = useState<EngineConfig>(() => storage.getEngineConfig());

  // UI state
  const [currentTab, setCurrentTab] = useState<string>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);

  // Modals
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState<boolean>(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState<boolean>(false);
  const [isMySubOpen, setIsMySubOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState<boolean>(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState<boolean>(false);
  const [isAdminPasscodeOpen, setIsAdminPasscodeOpen] = useState<boolean>(false);
  const [previewCode, setPreviewCode] = useState<{ code: string; lang: string } | null>(null);

  const isPro = user.plan === 'pro';

  // Log real device visit on mount for 100% accurate visitor counter
  useEffect(() => {
    storage.logRealVisit(window.location.pathname);
  }, []);

  useEffect(() => {
    storage.saveAdminSettings({ recognitionActive: adminRecognition });
  }, [adminRecognition]);

  // Apply dark and pro-gold classes to document root based on plan
  useEffect(() => {
    if (isPro) {
      document.documentElement.classList.add('dark', 'pro-gold-theme');
    } else {
      document.documentElement.classList.remove('dark', 'pro-gold-theme');
    }
  }, [isPro]);

  // Sync state to local storage
  useEffect(() => {
    storage.setUser(user);
  }, [user]);

  useEffect(() => {
    storage.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    storage.setCurrentConversationId(activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    storage.saveVideos(videos);
  }, [videos]);

  useEffect(() => {
    storage.setSpeechSettings(speechSettings);
  }, [speechSettings]);

  useEffect(() => {
    storage.setPriceSettings(priceSettings);
  }, [priceSettings]);

  useEffect(() => {
    storage.saveMemories(memories);
  }, [memories]);

  useEffect(() => {
    storage.saveEngineConfig(engineConfig);
  }, [engineConfig]);

  // Fetch Engine Health on mount
  const checkEngineHealth = async () => {
    try {
      const res = await fetch('/api/cantrix/health');
      if (res.ok) {
        const data = await res.json();
        setEngineStatus(data);
      } else {
        setEngineStatus({
          status: 'disconnected',
          model: 'gemini-2.5-flash',
          hasKey: false,
          message: 'محرك كامتريكس AI غير متصل. تأكد من إضافة GEMINI_API_KEY في إعدادات البيئة الآمنة.',
          maker: 'Rayan',
          appName: 'كامتريكس إيه آي (Cantrix AI)',
        });
      }
    } catch {
      setEngineStatus({
        status: 'disconnected',
        model: 'gemini-2.5-flash',
        hasKey: false,
        message: 'محرك كامتريكس AI غير متصل حالياً.',
        maker: 'Rayan',
        appName: 'كامتريكس إيه آي (Cantrix AI)',
      });
    }
  };

  useEffect(() => {
    checkEngineHealth();
  }, []);

  // Secret Master Admin Detection for Rayan and Co-Admin Friend (?admin=rayan_master_2026 or ?admin=rayan_friend_2026 or ?key=rayan2014)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const adminKey = searchParams.get('admin') || searchParams.get('key') || searchParams.get('rayan');
      const isFriendKey = adminKey === 'rayan_friend_2026' || adminKey === 'friend2026';
      const isMasterKey = 
        adminKey === 'rayan_master_2026' || 
        adminKey === 'rayan2026' || 
        adminKey === 'rayan2014' ||
        adminKey === 'rayan_2014' ||
        adminKey === '2014' ||
        adminKey === 'rayan_master' || 
        adminKey === 'rayan' || 
        adminKey === 'master_console';

      const wasVerified = 
        localStorage.getItem('cantrix_rayan_secret_verified') === 'true' ||
        localStorage.getItem('cantrix_admin_unlocked') === 'true';

      if (isFriendKey) {
        const coAdminUser: UserSession = {
          id: 'usr_coadmin_friend',
          name: 'مساعد الأدمن المفوض (صديق Rayan)',
          email: 'coadmin.friend@cantrix.ai',
          plan: 'pro',
          messagesRemaining: 99999,
          maxMessages: 99999,
          videosRemaining: 999,
          maxVideos: 999,
          isAdmin: true,
        };
        setUser(coAdminUser);
        storage.setUser(coAdminUser);
        localStorage.setItem('cantrix_admin_unlocked', 'true');
        localStorage.setItem('cantrix_admin_role', 'co_admin');
        setCurrentTab('admin');
      } else if (isMasterKey || wasVerified) {
        const adminUser: UserSession = {
          id: 'usr_admin_rayan',
          name: 'Rayan (صانع ومطور Cantrix AI)',
          email: 'saidlakraa05@gmail.com',
          plan: 'pro',
          messagesRemaining: 99999,
          maxMessages: 99999,
          videosRemaining: 999,
          maxVideos: 999,
          isAdmin: true,
        };
        setUser(adminUser);
        storage.setUser(adminUser);
        localStorage.setItem('cantrix_rayan_secret_verified', 'true');
        localStorage.setItem('cantrix_admin_unlocked', 'true');
        localStorage.setItem('cantrix_admin_role', 'master_owner');
        if (isMasterKey) {
          setCurrentTab('admin');
        }
      } else if (!wasVerified && user.isAdmin) {
        setUser((prev) => ({
          ...prev,
          isAdmin: false,
          name: prev.name.includes('Rayan') ? 'مستخدم كامتريكس AI' : prev.name,
        }));
      }

      // Expose secret unlock function on window for Rayan
      (window as any).unlockRayanAdmin = (code: string) => {
        const clean = (code || '').trim().toLowerCase();
        if (
          clean === 'ريان 2014' ||
          clean === 'ريان2014' ||
          clean === 'rayan2014' ||
          clean === 'rayan 2014' ||
          clean === 'rayan2026' || 
          clean === 'rayan_master_2026' || 
          clean === 'rayan' || 
          clean === 'master'
        ) {
          handleAdminUnlocked();
        }
      };
    } catch (e) {
      console.warn('Admin check warning:', e);
    }
  }, []);

  const handleAdminUnlocked = () => {
    const adminUser: UserSession = {
      id: 'usr_admin_rayan',
      name: 'Rayan (صانع ومطور Cantrix AI)',
      email: 'saidlakraa05@gmail.com',
      plan: 'pro',
      messagesRemaining: 99999,
      maxMessages: 99999,
      videosRemaining: 999,
      maxVideos: 999,
      isAdmin: true,
    };
    setUser(adminUser);
    storage.setUser(adminUser);
    localStorage.setItem('cantrix_admin_unlocked', 'true');
    localStorage.setItem('cantrix_rayan_secret_verified', 'true');
    setCurrentTab('admin');
  };

  // Active messages
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages: ChatMessage[] = activeConversation?.messages || [];

  // Start a new chat
  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  // Select existing conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setCurrentTab('chat');
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  // Send message
  const handleSendMessage = async (
    content: string,
    mode: AppMode,
    files: AttachedFile[],
    forceSearch?: boolean
  ) => {
    if (user.plan === 'free' && user.messagesRemaining <= 0) {
      setIsSubscriptionOpen(true);
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      mode,
      files,
      isLiveSearched: forceSearch,
    };

    let targetConvId = activeConversationId;
    let updatedConversations = [...conversations];

    if (!targetConvId) {
      targetConvId = `conv_${Date.now()}`;
      const title = content ? (content.length > 32 ? content.slice(0, 32) + '...' : content) : 'محادثة جديدة';
      const newConv: ChatConversation = {
        id: targetConvId,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [userMessage],
      };
      updatedConversations.unshift(newConv);
      setActiveConversationId(targetConvId);
    } else {
      updatedConversations = updatedConversations.map((c) => {
        if (c.id === targetConvId) {
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            messages: [...c.messages, userMessage],
          };
        }
        return c;
      });
    }

    setConversations(updatedConversations);
    setIsLoading(true);

    // Quota decrement for free users
    if (user.plan === 'free') {
      setUser((prev) => ({
        ...prev,
        messagesRemaining: Math.max(0, prev.messagesRemaining - 1),
      }));
    }

    try {
      const activeConvNow = updatedConversations.find((c) => c.id === targetConvId);
      const conversationHistory = activeConvNow?.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })) || [{ role: 'user', content }];

      const customPrompt = adminRecognition && user.isAdmin
        ? 'أنت تتحدث مباشرة وحصرياً مع صانعك ومطورك Rayan (صانع ومطور كامتريكس إيه آي Cantrix AI & Master Console). خاطبه بأقصى درجات الاحترام والاعتزاز والتقدير، وناده باسمه "سيدي ومطوري Rayan"، وأكد له أنك كامتريكس إيه آي (Cantrix AI) في خدمته وتحت أمره التام.'
        : undefined;

      const res = await fetch('/api/cantrix/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          mode,
          customPrompt,
          forceSearch,
          memories,
          files: files.map((f) => ({
            name: f.name,
            type: f.type,
            base64: f.base64,
          })),
        }),
      });

      const data = await res.json();
      const replyText = data.reply || (data.error ? `خطأ: ${data.error}` : 'لم يتم استلام رد من محرك كامتريكس AI.');

      const assistantMessage: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString(),
        mode,
        sources: data.sources || [],
        searchQueries: data.searchQueries || [],
        agentUsed: data.agentUsed,
        modelUsed: data.modelUsed,
        difficulty: data.difficulty,
        isLiveSearched: data.isLiveSearched,
        illustratedImageUrl: data.illustratedImageUrl,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              updatedAt: new Date().toISOString(),
              messages: [...c.messages, assistantMessage],
            };
          }
          return c;
        })
      );

      // Auto play reply if user enabled auto-speech
      if (speechSettings.autoPlayReplies) {
        novaVoice.speak(replyText, speechSettings);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `تعذر الاتصال بمحرك كامتريكس AI: ${err.message || 'خطأ في الشبكة'}. تأكد من اتصال الخادم وإعدادات GEMINI_API_KEY.`,
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              messages: [...c.messages, errorMessage],
            };
          }
          return c;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate latest response
  const handleRegenerate = async () => {
    if (!activeConversation || activeConversation.messages.length < 2) return;
    const lastUserMessage = [...activeConversation.messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      await handleSendMessage(
        lastUserMessage.content,
        lastUserMessage.mode || 'fast',
        lastUserMessage.files || [],
        lastUserMessage.isLiveSearched
      );
    }
  };

  // Illustrate / visualize answer with complementary diagram or image
  const handleIllustrateMessage = async (msgId: string, promptText: string, attachedImageBase64?: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId ? { ...m, isIllustrating: true } : m
            ),
          };
        }
        return c;
      })
    );

    try {
      const res = await fetch('/api/cantrix/illustrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          base64Image: attachedImageBase64,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === activeConversationId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === msgId
                    ? { ...m, illustratedImageUrl: data.imageUrl, isIllustrating: false }
                    : m
                ),
              };
            }
            return c;
          })
        );
      } else {
        throw new Error(data.error || 'تعذر توليد التوضيح البصري.');
      }
    } catch (err: any) {
      console.error('Illustrate Error:', err);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId ? { ...m, isIllustrating: false } : m
              ),
            };
          }
          return c;
        })
      );
    }
  };

  // Save new video project
  const handleSaveVideo = (newVideo: VideoProject) => {
    setVideos((prev) => [newVideo, ...prev]);
    if (user.plan === 'free') {
      setUser((prev) => ({
        ...prev,
        videosRemaining: Math.max(0, prev.videosRemaining - 1),
      }));
    }
  };

  // Clear all data
  const handleClearAllData = () => {
    storage.clearAllData();
    setUser(storage.getUser());
    setConversations([]);
    setActiveConversationId(null);
    setVideos([]);
    setMemories(storage.getMemories());
  };

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden transition-colors duration-500 ${
        isPro
          ? 'bg-[#0A0905] text-amber-50 selection:bg-amber-500/30 font-sans'
          : 'bg-slate-50 text-slate-900 selection:bg-slate-900/10 font-sans'
      }`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'voice') {
            setIsLiveVoiceOpen(true);
          } else if (tab === 'subscription') {
            setIsSubscriptionOpen(true);
          } else if (tab === 'my_subscription') {
            setIsMySubOpen(true);
          } else if (tab === 'memory') {
            setIsMemoryOpen(true);
          } else if (tab === 'benchmark') {
            setIsBenchmarkOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        user={user}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenMySubscription={() => setIsMySubOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <TopBar
          currentTab={currentTab}
          user={user}
          engineStatus={engineStatus}
          darkMode={isPro}
          onToggleDarkMode={() => {
            setUser((prev) => ({
              ...prev,
              plan: prev.plan === 'pro' ? 'free' : 'pro',
            }));
          }}
          onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
          onOpenSubscription={() => setIsSubscriptionOpen(true)}
          onOpenMySubscription={() => setIsMySubOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenInstall={() => setIsInstallOpen(true)}
          onOpenAdmin={() => setCurrentTab('admin')}
          onTriggerAdminPasscode={() => setIsAdminPasscodeOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* View Routing */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {currentTab === 'chat' && (
            <ChatView
              messages={messages}
              onSendMessage={handleSendMessage}
              onRegenerate={handleRegenerate}
              onIllustrateMessage={handleIllustrateMessage}
              isLoading={isLoading}
              user={user}
              speechSettings={speechSettings}
              onOpenSubscription={() => setIsSubscriptionOpen(true)}
              onOpenAbout={() => setIsAboutOpen(true)}
              onOpenInstall={() => setIsInstallOpen(true)}
              onOpenCodePreview={(code, lang) => setPreviewCode({ code, lang: lang || 'html' })}
              onOpenMemory={() => setIsMemoryOpen(true)}
              onOpenBenchmark={() => setIsBenchmarkOpen(true)}
              engineConfig={engineConfig}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPanel
              onBackToChat={() => setCurrentTab('chat')}
              adminRecognitionActive={adminRecognition}
              onToggleAdminRecognition={setAdminRecognition}
            />
          )}

          {currentTab === 'video' && (
            <VideoStudioView
              user={user}
              videos={videos}
              onSaveVideo={handleSaveVideo}
              onOpenSubscription={() => setIsSubscriptionOpen(true)}
            />
          )}

          {currentTab === 'tools' && <ToolsView />}
        </div>
      </main>

      {/* Modals & Drawers */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        speechSettings={speechSettings}
        onUpdateSpeechSettings={setSpeechSettings}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        user={user}
        onUpdateUser={setUser}
        priceSettings={priceSettings}
      />

      <MySubscriptionModal
        isOpen={isMySubOpen}
        onClose={() => setIsMySubOpen(false)}
        user={user}
        onUpdateUser={setUser}
        onOpenUpgrade={() => {
          setIsMySubOpen(false);
          setIsSubscriptionOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        engineStatus={engineStatus}
        onRefreshHealth={checkEngineHealth}
        user={user}
        speechSettings={speechSettings}
        onUpdateSpeechSettings={setSpeechSettings}
        priceSettings={priceSettings}
        onUpdatePriceSettings={setPriceSettings}
        onClearAllData={handleClearAllData}
        engineConfig={engineConfig}
        onUpdateEngineConfig={setEngineConfig}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenMemory={() => setIsMemoryOpen(true)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <InstallAppModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

      <SmartMemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memories={memories}
        onSaveMemories={setMemories}
      />

      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      {previewCode && (
        <CodePreviewModal
          isOpen={Boolean(previewCode)}
          onClose={() => setPreviewCode(null)}
          code={previewCode.code}
          language={previewCode.lang}
        />
      )}

      <AdminPasscodeModal
        isOpen={isAdminPasscodeOpen}
        onClose={() => setIsAdminPasscodeOpen(false)}
        onSuccess={handleAdminUnlocked}
      />
    </div>
  );
}
