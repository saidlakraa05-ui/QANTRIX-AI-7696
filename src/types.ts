export type AppMode = 'fast' | 'deep' | 'simple' | 'expert' | 'creative' | 'practical' | 'supremacy';

export type UserPlan = 'free' | 'pro';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  messagesRemaining: number;
  maxMessages: number;
  videosRemaining: number;
  maxVideos: number;
  subscriptionRenewalDate?: string;
  trialExpiresAt?: string;
  isAdmin: boolean;
}

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  base64: string;
  previewUrl?: string;
}

export interface CantrixSource {
  title: string;
  url: string;
}

export type AgentType = 
  | 'orchestrator'
  | 'search'
  | 'coding'
  | 'math'
  | 'vision'
  | 'document'
  | 'factcheck'
  | 'planner';

export interface AgentMetadata {
  id: AgentType;
  name: string;
  nameAr: string;
  description: string;
  icon: string;
  badgeColor: string;
}

export interface SmartMemory {
  id: string;
  key: string;
  value: string;
  category: 'personal' | 'preference' | 'project' | 'fact' | 'life' | 'decision' | 'mistakes';
  createdAt: string;
  updatedAt?: string;
  isSensitive?: boolean;
}

export interface EngineConfig {
  mode: 'auto' | 'pro' | 'flash' | 'custom';
  customModelName?: string;
  enableLiveSearch: boolean;
  searchAutoTrigger: boolean;
  strictFactChecking: boolean;
  deepThinking: boolean;
  activeModelDisplay?: string;
}

export interface BenchmarkResult {
  id: string;
  name: string;
  nameAr: string;
  score: number;
  maxScore: number;
  latencyMs: number;
  status: 'passed' | 'warning' | 'failed';
  details: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: AppMode;
  files?: AttachedFile[];
  translatedContent?: string;
  translationLang?: string;
  illustratedImageUrl?: string;
  isIllustrating?: boolean;
  sources?: CantrixSource[];
  searchQueries?: string[];
  agentUsed?: AgentType;
  modelUsed?: string;
  reasoningSteps?: string[];
  difficulty?: 'simple' | 'medium' | 'complex';
  isLiveSearched?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface VideoScene {
  sceneNumber: number;
  timeframe: string;
  visualDescription: string;
  cameraMovement: string;
  voiceover: string;
  soundEffects: string;
  imageUrl?: string;
  motionStyle?: string;
}

export interface SelfEvolutionRule {
  id: string;
  title: string;
  type: 'ui_theme' | 'prompt_override' | 'knowledge_fact' | 'feature_flag' | 'custom_script';
  content: string;
  active: boolean;
  createdAt: string;
  author: string;
}

export interface PlayStoreConfig {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  pwaUrl: string;
  sha256Fingerprint: string;
  isReady: boolean;
}

export interface VideoProject {
  id: string;
  title: string;
  logline: string;
  idea: string;
  duration: number; // in seconds (5, 10, 15)
  style: string;
  aspect: '9:16' | '16:9' | '1:1';
  scenes: VideoScene[];
  soundtrackAdvice?: string;
  creativeTip?: string;
  createdAt: string;
  expiresAt: string;
  isLocked: boolean;
}

export interface EngineStatus {
  status: 'connected' | 'disconnected' | 'processing' | 'error';
  model: string;
  hasKey: boolean;
  message: string;
  maker: string;
  appName: string;
  timestamp?: string;
}

export interface NovaToolDef {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: 'content' | 'career' | 'education' | 'business' | 'productivity' | 'languages';
  icon: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    type: 'text' | 'textarea' | 'select';
    options?: { value: string; label: string }[];
  }[];
}

export type BanDuration = '1m' | '1h' | '5h' | '1d' | 'perm' | 'device';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  registeredAt: string;
  plan: 'free' | 'pro';
  deviceInfo: string;
  ipAddress: string;
  isBanned: boolean;
  banReason?: string;
  banDuration?: BanDuration;
  banExpiresAt?: string;
  banType?: 'temp' | 'permanent' | 'device';
  abusiveWarningCount: number;
  hasInsulted: boolean;
  messagesCount: number;
  conversations: ChatConversation[];
}

export interface AdminAnalytics {
  totalDownloads: number;
  activeUsersToday: number;
  totalBannedUsers: number;
  totalRevenueMAD: number;
  adminRecognitionActive: boolean;
}

export interface VisitorSession {
  id: string;
  ip: string;
  deviceInfo: string;
  browser: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  isOnline: boolean;
}

export interface PaymentOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  bankName: string;
  ribNumber: string;
  referenceCode: string;
  receiptNote?: string;
  receiptImageUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
  autoVerified?: boolean;
}

export interface UserSubscriptionDetails {
  plan: 'free' | 'pro';
  amountMAD: number;
  startDate?: string;
  expiryDate?: string;
  daysRemaining?: number;
  orderId?: string;
  transferReference?: string;
  autoRenew?: boolean;
  lastVerifiedAt?: string;
}

export interface BankPayoutConfig {
  accountHolder: string;
  bankName: string;
  rib: string;
  amountMAD: number;
  noteAr: string;
  privacyMode?: 'hidden' | 'masked' | 'visible';
}

export interface GlobalVisitorChat {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorIp: string;
  deviceInfo: string;
  userQuestion: string;
  botReply: string;
  category: string;
  timestamp: string;
  confidenceScore: number;
  antiHallucinationVerified: boolean;
  isSupremacyEngine: boolean;
  agentUsed: string;
}

export interface CoAdminConfig {
  friendPasskey: string;
  friendName: string;
  isEnabled: boolean;
  delegatedAt: string;
  permissions: {
    canViewChats: boolean;
    canViewVisitors: boolean;
    canVerifyOrders: boolean;
    canEditBankDetails: boolean;
  };
}
