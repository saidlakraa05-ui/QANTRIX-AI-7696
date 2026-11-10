# دليل تشغيل تطبيق Lord AI في بيئتك الخاصة (Standalone & Self-Hosting Guide)

طوّره المبتكر: **Rayan**
الشعار: *“ذكاء بلا حدود. صوت بلا حواجز. نتائج حقيقية.”*

---

## الخيار 1: التثبيت الفوري كتطبيق مستقل على هاتفك أو حاسوبك (PWA)
تطبيق **Lord AI** مدعوم بتقنية **Progressive Web App (PWA)**، مما يعني أنه يمكنك تثبيته وتشغيله كتطبيق أصلي (Native App) بدون متجر تطبيقات وبدون الحاجة لفتح المتصفح في كل مرة:

### على هواتف Android (عبر Google Chrome):
1. افتح رابط التطبيق في متصفح Chrome.
2. اضغط على القائمة (الثلاث نقاط في أعلى أو أسفل الشاشة).
3. اضغط على **"تثبيت التطبيق" (Install App)** أو **"إضافة إلى الشاشة الرئيسية" (Add to Home screen)**.
4. سيظهر تطبيق **Lord AI** مع أيقونته الخاصة في درج تطبيقاتك وشاشتك الرئيسية، ويفتح كنافذة مستقلة وسريعة بدون شريط المتصفح.

### على هواتف iPhone / iPad (عبر Safari):
1. افتح رابط التطبيق في متصفح Safari.
2. اضغط على زر المشاركة **Share (مربع بسهم لأعلى ⎋)** في أسفل الشاشة.
3. مرر لأسفل واختر **"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)**.
4. اضغط **"إضافة" (Add)**. سيعمل التطبيق في وضع ملء الشاشة Standalone مثل أي تطبيق تم تنزيله من App Store.

### على أجهزة الحاسوب (Windows / Mac / Linux):
1. افتح الرابط في **Google Chrome** أو **Microsoft Edge**.
2. ستجد أيقونة تثبيت صغيرة **(⊕ Install Lord AI)** في أقصى يمين شريط العنوان (URL bar).
3. اضغط عليها واختر **تثبيت (Install)**.
4. سيُثبت التطبيق ويوضع له اختصار في قائمة Start / Applications وسطح المكتب، ويفتح في نافذة برنامج مستقلة.

---

## الخيار 2: تشغيل التطبيق في بيئتك البرمجية المحلية (Local Development)

إذا أردت تشغيل الكود المصدري على حاسوبك الشخصي:

### 1. المتطلبات:
- تثبيت **Node.js** (الإصدار 18 أو 20 أو 22)
- تثبيت **npm** أو **pnpm**
- مفتاح **Gemini API Key** الخاص بك

### 2. خطوات التشغيل:
```bash
# 1. الدخول إلى مجلد المشروع
cd lord-ai

# 2. تثبيت الحزم والمكتبات
npm install

# 3. إعداد متغير البيئة
cp .env.example .env
# قم بفتح ملف .env وضع المفتاح:
# GEMINI_API_KEY="AIzaSy..."

# 4. تشغيل خادم التطوير مع الـ Backend
npm run dev
```
سيعمل التطبيق مباشرة على العنوان: `http://localhost:3000`

---

## الخيار 3: بناء وتشغيل خادم إنتاجي كامل (Production Node.js)
```bash
# بناء واجهة المستخدم
npm run build

# تشغيل خادم الإنتاج السريع والمحمي
npm start
```

---

## الخيار 4: التشغيل عبر Docker في أي خادم أو VPS

قم بإنشاء ملف `Dockerfile` بهذه المحتويات:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig.json ./
RUN npm install -g tsx

EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
```

ثم شغّل الحاوية بأمر واحد:
```bash
docker build -t lord-ai .
docker run -d -p 3000:3000 -e GEMINI_API_KEY="مفتاحك_هنا" --name lord-app lord-ai
```

---

## الخيار 5: الاستضافة السحابية المجانية (Render / Railway / Fly.io)
1. ارفع المشروع على حسابك في **GitHub**.
2. أنشئ حساباً على منصة استضافة مثل **Render.com** أو **Railway.app**.
3. اختر **New Web Service** واربط مستودع GitHub.
4. ضع أوامر البناء والتشغيل:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. في قسم **Environment Variables**، أضف:
   - `GEMINI_API_KEY`: مفتاحك الخاص.
6. اضغط **Deploy** وستحصل على رابط عالمي دائم وخاص بك يعمل 24/7.
