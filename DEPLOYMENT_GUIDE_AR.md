# 🚀 دليل النشر (Deployment Guide)

## خطوات نشر المشروع على rsr123.runasp.net

---

## 📋 المتطلبات الأساسية

✅ Backend API متاح على: `https://rsr123.runasp.net`  
✅ Frontend سيتم نشره على نفس الدومين أو subdomain  
✅ SSL Certificate موجود (HTTPS)

---

## 🔧 الإعدادات الحالية

### Frontend Configuration
```env
VITE_API_URL=https://rsr123.runasp.net/api
```

### Backend CORS Configuration
```csharp
policy.WithOrigins(
    "https://rsr123.runasp.net",
    "http://localhost:5173",  // للتطوير
    // ... other development origins
)
```

---

## 📦 خطوات النشر (Deployment Steps)

### 1️⃣ بناء Frontend للإنتاج

```bash
# في: ChaletBooking.Frontend/

# تأكد من أن .env.production صحيح
cat .env.production
# يجب أن يكون: VITE_API_URL=https://rsr123.runasp.net/api

# بناء المشروع
npm run build

# النتيجة: مجلد dist/ جاهز للنشر
```

**ملاحظة:** البناء سيستخدم تلقائياً `.env.production`

---

### 2️⃣ محتويات مجلد Build

بعد `npm run build`، ستجد:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other-assets]
└── [other-files]
```

---

### 3️⃣ نشر الملفات

#### الخيار 1: نشر على نفس السيرفر (Same Domain)

إذا كان الـ Backend على `https://rsr123.runasp.net`:

```bash
# رفع محتويات dist/ إلى wwwroot في Backend
# المسار: ChaletBooking.API/wwwroot/

# في Backend (Program.cs) موجود:
app.UseStaticFiles();
app.MapFallbackToFile("index.html");
```

**النتيجة:**
- Frontend: `https://rsr123.runasp.net/`
- API: `https://rsr123.runasp.net/api/`

#### الخيار 2: نشر على Subdomain

إذا تريد Frontend على subdomain منفصل:

```
Frontend: https://app.rsr123.runasp.net
Backend API: https://rsr123.runasp.net/api
```

**خطوات إضافية:**
1. أضف subdomain في CORS:
```csharp
policy.WithOrigins(
    "https://rsr123.runasp.net",
    "https://app.rsr123.runasp.net",  // ← أضف هذا
    // ...
)
```

2. انشر `dist/` على الـ subdomain

---

### 4️⃣ التحقق من CORS في Backend

تأكد أن `Program.cs` يحتوي على:

```csharp
// قبل app.UseAuthentication()
app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication();
app.UseAuthorization();
```

**الترتيب مهم!** CORS يجب أن يكون قبل Authentication.

---

### 5️⃣ اختبار بعد النشر

#### Test 1: Frontend يفتح بشكل صحيح
```
https://rsr123.runasp.net/
```
يجب أن تظهر الصفحة الرئيسية

#### Test 2: API Calls تعمل
افتح Developer Console (F12) وتحقق من Network:
- API calls تذهب إلى `https://rsr123.runasp.net/api/`
- Status: 200 OK (أو المتوقع)
- لا توجد CORS errors

#### Test 3: Images تظهر
تأكد أن:
- الصور تُحمّل من `https://rsr123.runasp.net/uploads/...`
- لا توجد 404 errors للصور

#### Test 4: Authentication
- سجل دخول كـ user
- تأكد من JWT token يُرسل في headers
- Dashboard يعمل بشكل صحيح

---

## 🐛 استكشاف الأخطاء (Troubleshooting)

### خطأ: CORS Policy Error

**السبب:** Frontend origin غير مسموح في Backend

**الحل:**
```csharp
// في Program.cs أضف origin الصحيح
policy.WithOrigins(
    "https://rsr123.runasp.net",  // أو frontend domain
    // ...
)
```

---

### خطأ: API calls تذهب إلى localhost

**السبب:** استخدام development build بدلاً من production

**الحل:**
```bash
# تأكد من استخدام production build
npm run build  # وليس npm run dev
```

---

### خطأ: Images لا تظهر (404)

**السبب 1:** مجلد uploads غير موجود على السيرفر

**الحل:**
```bash
# تأكد من وجود:
ChaletBooking.API/wwwroot/uploads/images/
```

**السبب 2:** Permissions غير صحيحة

**الحل:**
```bash
# تأكد أن IIS User لديه read access للمجلد
```

---

### خطأ: Mixed Content (HTTP/HTTPS)

**السبب:** Frontend على HTTPS لكن API على HTTP

**الحل:**
- تأكد أن **كل شيء** على HTTPS
- لا تخلط HTTP و HTTPS

---

## 🔒 ملاحظات أمان

### 1. HTTPS فقط في Production
```csharp
// في Production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
```

### 2. CORS محدد
```csharp
// ❌ لا تستخدم في Production
policy.SetIsOriginAllowed(origin => true)

// ✅ استخدم origins محددة
policy.WithOrigins("https://rsr123.runasp.net")
```

### 3. JWT Security
- استخدم Strong Secret Key
- Token Expiration مناسب
- HTTPS فقط

---

## 📊 Checklist النشر النهائي

### قبل النشر:
- [ ] `npm run build` ينجح بدون أخطاء
- [ ] `.env.production` يحتوي على URL الصحيح
- [ ] Backend CORS يسمح بـ frontend origin
- [ ] SSL Certificate فعّال
- [ ] Database migrations مطبقة

### بعد النشر:
- [ ] Frontend يفتح على الـ domain الصحيح
- [ ] API calls تعمل (تحقق من Network tab)
- [ ] Images تظهر بشكل صحيح
- [ ] Login/Register يعمل
- [ ] Dashboard يعمل
- [ ] لا توجد Console errors
- [ ] لا توجد CORS errors

---

## 🎯 Quick Commands

```bash
# Build للإنتاج
npm run build

# اختبار Production build محلياً
npm run preview

# نسخ dist إلى Backend (مثال)
xcopy /E /I /Y dist\* ..\ChaletBooking.API\wwwroot\

# تشغيل Backend
cd ..\ChaletBooking.API
dotnet run --urls "https://localhost:7266"
```

---

## 📞 في حالة المشاكل

1. **تحقق من Console Errors** (F12)
2. **تحقق من Network Tab** للـ API calls
3. **تحقق من Backend Logs**
4. **تأكد من CORS Configuration**
5. **تأكد من Environment Variables**

---

## ✅ الخلاصة

المشروع جاهز للنشر! فقط:

1. ✅ `npm run build`
2. ✅ نشر `dist/` على السيرفر
3. ✅ تأكد من CORS settings
4. ✅ اختبر جميع الـ features

**Good luck! 🚀**
