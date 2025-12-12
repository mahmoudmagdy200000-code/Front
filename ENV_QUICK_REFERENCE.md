# API Environment Variables - Quick Reference

## 🚀 Quick Commands

```bash
# Development (localhost)
npm run dev

# Production Build (runasp.net)
npm run build

# Preview Production Build
npm run preview
```

## 📁 Environment Files

| File | Purpose | URL | Committed to Git? |
|------|---------|-----|-------------------|
| `.env.development` | Development mode | `http://localhost:5266/api` | ❌ No |
| `.env.production` | Production build | `https://rsr123.runasp.net/api` | ❌ No |
| `.env.example` | Template | Example URLs | ✅ Yes |

## 🔧 How to Use in Code

```typescript
// ✅ CORRECT - Just import axios instance
import axiosInstance from './axios';

// Make requests with relative paths (no /api prefix!)
const response = await axiosInstance.get('/chalets');
const response = await axiosInstance.post('/auth/login', data);

// ❌ WRONG - Don't use /api prefix (it's already in baseURL)
const response = await axiosInstance.get('/api/chalets'); // This will become /api/api/chalets
```

## 💡 Example Code

### GET Request
```typescript
export const getChalets = async (): Promise<Chalet[]> => {
    const response = await axiosInstance.get<Chalet[]>('/chalets');
    return response.data;
};
```

### POST Request
```typescript
export const registerApi = async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
    return response.data;
};
```

### File Upload
```typescript
export const uploadImage = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(`/chalets/${id}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
```

## 🌐 Current Configuration

**Development URL:** `http://localhost:5266/api`  
**Production URL:** `https://rsr123.runasp.net/api`

## ⚠️ Common Mistakes

| ❌ Wrong | ✅ Correct | Reason |
|---------|-----------|---------|
| `'/api/chalets'` | `'/chalets'` | baseURL already has `/api` |
| `process.env.VITE_API_URL` | `import.meta.env.VITE_API_URL` | Vite uses `import.meta.env` |
| Not restarting after `.env` change | Restart dev server | Changes require restart |

## 🔑 JWT Authentication

Authentication is automatic! The axios instance auto-includes JWT tokens:

```typescript
// Token is automatically added to all requests
const token = localStorage.getItem('token');
// → Header: Authorization: Bearer <token>
```

## 📝 Need More Info?

See `ENV_CONFIG.md` for detailed documentation.
