import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  canUserSendMessage, 
  canUserCreateVideo, 
  calculateNextRenewal, 
  isProjectExpired, 
  cleanTextForSpeech, 
  formatCurrency,
  filterMemories,
  categorizeDifficulty
} from './logic';
import { UserSession, VideoProject } from '../types';

test('canUserSendMessage returns true for Pro users regardless of remaining count', () => {
  const proUser: UserSession = {
    id: 'u1',
    name: 'Pro User',
    email: 'pro@test.com',
    plan: 'pro',
    messagesRemaining: 0,
    maxMessages: 2000,
    videosRemaining: 0,
    maxVideos: 50,
    isAdmin: false,
  };
  assert.equal(canUserSendMessage(proUser), true);
});

test('canUserSendMessage blocks free user when messagesRemaining is 0', () => {
  const freeUser: UserSession = {
    id: 'u2',
    name: 'Free User',
    email: 'free@test.com',
    plan: 'free',
    messagesRemaining: 0,
    maxMessages: 25,
    videosRemaining: 0,
    maxVideos: 1,
    isAdmin: false,
  };
  assert.equal(canUserSendMessage(freeUser), false);
});

test('canUserCreateVideo returns true for pro users and checks limits for free users', () => {
  const freeUserWithQuota: UserSession = {
    id: 'u3',
    name: 'User 3',
    email: 'u3@test.com',
    plan: 'free',
    messagesRemaining: 10,
    maxMessages: 25,
    videosRemaining: 1,
    maxVideos: 1,
    isAdmin: false,
  };
  assert.equal(canUserCreateVideo(freeUserWithQuota), true);

  const freeUserDepleted: UserSession = {
    ...freeUserWithQuota,
    videosRemaining: 0,
  };
  assert.equal(canUserCreateVideo(freeUserDepleted), false);
});

test('cleanTextForSpeech strips markdown symbols and URLs correctly', () => {
  const raw = '## عنوان رئيسي **نص عريض** [رابط](https://example.com)';
  const cleaned = cleanTextForSpeech(raw);
  assert.equal(cleaned.includes('**'), false);
  assert.equal(cleaned.includes('##'), false);
  assert.equal(cleaned.includes('https://example.com'), false);
  assert.equal(cleaned.includes('رابط'), true);
});

test('formatCurrency formats Moroccan dirham properly', () => {
  assert.equal(formatCurrency(50, 'د.م'), '50 د.م');
  assert.equal(formatCurrency(100, 'MAD'), '100 MAD');
});

test('isProjectExpired returns true for expired video project', () => {
  const pastProject: VideoProject = {
    id: 'v1',
    title: 'Test',
    logline: 'Logline',
    idea: 'Idea',
    duration: 10,
    style: 'سينمائي',
    aspect: '9:16',
    scenes: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2026-02-01T00:00:00.000Z',
    isLocked: false,
  };
  const currentDate = new Date('2026-03-01T00:00:00.000Z');
  assert.equal(isProjectExpired(pastProject, currentDate), true);
});

test('filterMemories filters properly by text query and category', () => {
  const memories = [
    { id: '1', key: 'اسم المستخدم', value: 'ريان', category: 'personal' },
    { id: '2', key: 'لغة البرمجة المفضلة', value: 'TypeScript و Python', category: 'preference' },
    { id: '3', key: 'مشروع كامتريكس', value: 'نظام ذكاء اصطناعي فائق', category: 'project' },
  ];

  const matched = filterMemories(memories, 'ريان');
  assert.equal(matched.length, 1);
  assert.equal(matched[0].key, 'اسم المستخدم');

  const prefOnly = filterMemories(memories, '', 'preference');
  assert.equal(prefOnly.length, 1);
  assert.equal(prefOnly[0].category, 'preference');
});

test('categorizeDifficulty detects complex queries with code or math', () => {
  assert.equal(categorizeDifficulty('اكتب كود بايثون لحساب الأعداد الأولية'), 'complex');
  assert.equal(categorizeDifficulty('قارن بين أداء نموذج Gemini 2.5 Flash ونموذج GPT-4o في الاستدلال'), 'medium');
  assert.equal(categorizeDifficulty('صباح الخير، كيف حالك؟'), 'simple');
});
