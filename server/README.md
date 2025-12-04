# NIRDonia Village Council API Server

خادم Express مع MongoDB Atlas لإدارة منشورات مجلس القرية.

## الإعداد (Setup)

### 1. إنشاء ملف `.env`

انسخ `.env.example` إلى `.env`:

```bash
cp .env.example .env
```

### 2. إعداد MongoDB Atlas

1. اذهب إلى [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ حساب أو سجل الدخول
3. أنشئ cluster جديد
4. احصل على connection string من "Connect" → "Connect your application"
5. ضع connection string في `.env`:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nirdonia?retryWrites=true&w=majority
```

### 3. تشغيل الخادم

```bash
# تشغيل عادي
npm run server

# تشغيل مع auto-reload (يتطلب Node.js 18+)
npm run server:dev
```

الخادم سيعمل على `http://localhost:3001`

## API Endpoints

### GET `/api/council/posts`
جلب جميع المنشورات (مُرتبة من الأحدث)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "author": "username",
      "content": "Today I...",
      "votes": 5,
      "hash": "A1B2C3D4",
      "isAnonymous": false,
      "taskType": "repair",
      "createdAt": "2025-01-20T10:00:00.000Z"
    }
  ]
}
```

### POST `/api/council/posts`
إنشاء منشور جديد

**Request Body:**
```json
{
  "content": "Today I installed Linux on my school laptop",
  "author": "username",
  "isAnonymous": false,
  "taskType": "repair"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "author": "username",
    "content": "Today I installed Linux on my school laptop",
    "votes": 0,
    "hash": "A1B2C3D4",
    "isAnonymous": false,
    "taskType": "repair",
    "createdAt": "2025-01-20T10:00:00.000Z"
  }
}
```

### PUT `/api/council/posts/:id/vote`
تحديث عدد الإعجابات

**Request Body:**
```json
{
  "action": "increment" // أو "decrement"
}
```

### DELETE `/api/council/posts/:id`
حذف منشور (للمشرفين)

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### GET `/health`
فحص حالة الخادم

## البنية (Structure)

```
server/
├── models/
│   └── CouncilPost.js    # نموذج MongoDB
├── routes/
│   └── council.js        # مسارات API
└── README.md
```

## ملاحظات

- Hash يتم توليده تلقائياً لكل منشور
- الحد الأقصى لمحتوى المنشور: 500 حرف
- المنشورات محدودة بـ 100 منشور في الاستجابة
- يتم ترتيب المنشورات من الأحدث إلى الأقدم

