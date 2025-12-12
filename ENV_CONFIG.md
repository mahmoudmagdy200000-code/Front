# Environment Configuration Guide

## Overview
This project uses **Vite environment variables** to manage different API URLs for development and production environments.

## Environment Files

### `.env.development`
Used when running `npm run dev` (development mode)
```env
VITE_API_URL=http://localhost:5266/api
```

### `.env.production`
Used when running `npm run build` (production build)
```env
VITE_API_URL=https://rsr123.runasp.net/api
```

### `.env.example`
Template file for reference (committed to git)

## How It Works

1. **Axios Instance Configuration**
   - All API requests use the centralized `axiosInstance` from `src/api/axios.ts`
   - The baseURL is set using: `import.meta.env.VITE_API_URL`
   - Fallback URL if env variable is missing: `https://rsr123.runasp.net/api`

2. **Automatic Environment Detection**
   - Vite automatically loads the correct `.env` file based on the mode
   - Development: `npm run dev` → uses `.env.development`
   - Production: `npm run build` → uses `.env.production`

## API Request Examples

### GET Request (Fetching Chalets)
```typescript
import axiosInstance from './axios';

// The baseURL is already configured, so just use relative paths
export const getChalets = async (): Promise<Chalet[]> => {
    const response = await axiosInstance.get<Chalet[]>('/chalets');
    return response.data;
};

// This will make a request to:
// - Development: http://localhost:5266/api/chalets
// - Production: https://rsr123.runasp.net/api/chalets
```

### POST Request (User Registration)
```typescript
import axiosInstance from './axios';

export const registerApi = async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
    return response.data;
};

// This will make a request to:
// - Development: http://localhost:5266/api/auth/register
// - Production: https://rsr123.runasp.net/api/auth/register
```

### POST with FormData (Image Upload)
```typescript
export const uploadChaletImage = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(`/chalets/${id}/upload-image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
```

## Important Notes

### 1. **No `/api` Prefix in Endpoints**
Since the baseURL already includes `/api`, don't add it again:
```typescript
// ✅ CORRECT
axiosInstance.get('/chalets')

// ❌ WRONG (will result in /api/api/chalets)
axiosInstance.get('/api/chalets')
```

### 2. **Environment Variable Naming**
- Must start with `VITE_` to be exposed to client-side code
- Access using `import.meta.env.VITE_API_URL`
- **NOT** `process.env.VITE_API_URL` (that's for Node.js)

### 3. **Git Configuration**
The `.gitignore` file excludes actual environment files but keeps `.env.example`:
```gitignore
.env
.env.development
.env.production
.env.local
```

### 4. **JWT Token Handling**
The axios instance automatically includes JWT tokens from localStorage:
```typescript
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

## Development Workflow

### 1. **Initial Setup**
```bash
# Copy environment files (if not already created)
cp .env.example .env.development
cp .env.example .env.production

# Update the URLs in each file
```

### 2. **Development Mode**
```bash
npm run dev
# Uses http://localhost:5266/api
```

### 3. **Production Build**
```bash
npm run build
# Uses https://rsr123.runasp.net/api
```

### 4. **Preview Production Build Locally**
```bash
npm run build
npm run preview
# Test production build with production API URL
```

## Changing API URLs

### For Development
Edit `.env.development`:
```env
VITE_API_URL=http://localhost:5266/api
```

### For Production
Edit `.env.production`:
```env
VITE_API_URL=https://rsr123.runasp.net/api
```

### For a Custom Environment
Create `.env.local` (overrides other files):
```env
VITE_API_URL=http://192.168.1.100:5266/api
```

## Troubleshooting

### Problem: API calls going to localhost in production
**Solution:** Make sure you're building with `npm run build`, not running `npm run dev`

### Problem: Environment variable is undefined
**Solution:** 
- Check variable name starts with `VITE_`
- Restart dev server after changing .env files
- Use `import.meta.env.VITE_API_URL`, not `process.env`

### Problem: Getting 404 errors
**Solution:** 
- Verify backend is running and accessible
- Check baseURL is correct in axios instance
- Ensure endpoints don't have duplicate `/api` prefix

## API Endpoints Summary

All requests use the configured base URL from `VITE_API_URL`:

### Authentication
- POST `/auth/login` - User login
- POST `/auth/register` - User registration
- POST `/auth/request-owner` - Request owner upgrade
- GET `/auth/my-request` - Get my owner request

### Chalets
- GET `/chalets` - Get all chalets
- GET `/chalets/{id}` - Get chalet by ID
- GET `/chalets/my-chalets` - Get owner's chalets
- POST `/chalets` - Create chalet
- PUT `/chalets/{id}` - Update chalet
- DELETE `/chalets/{id}` - Delete chalet
- POST `/chalets/{id}/upload-image` - Upload single image
- POST `/chalets/{id}/upload-images` - Upload multiple images
- DELETE `/chalets/{chaletId}/images/{imageId}` - Delete image

### Bookings
- GET `/bookings` - Get all bookings
- GET `/bookings/available` - Check availability
- GET `/bookings/search` - Search bookings by phone
- POST `/bookings` - Create booking
- PUT `/bookings/{id}/status` - Update booking status

### Admin
- GET `/admin/owner-requests` - Get all owner requests
- POST `/admin/owner-requests/{id}/approve` - Approve request
- POST `/admin/owner-requests/{id}/reject` - Reject request
- GET `/admin/users` - Get all users
- POST `/admin/upgrade-to-owner/{userId}` - Upgrade to owner
- POST `/admin/downgrade-to-client/{userId}` - Downgrade to client

## Security Best Practices

1. **Never commit `.env.development` or `.env.production`** - They're in `.gitignore`
2. **Only commit `.env.example`** - As a template for other developers
3. **Use HTTPS in production** - Already configured with `https://rsr123.runasp.net`
4. **Validate SSL certificates** - Axios validates by default
5. **Keep tokens secure** - Stored in localStorage, sent via Authorization header

## Summary

✅ **Single source of truth:** All API URLs managed via `VITE_API_URL`  
✅ **Environment-specific:** Different URLs for dev/prod  
✅ **Centralized configuration:** All requests through `axiosInstance`  
✅ **Type-safe:** Full TypeScript support  
✅ **Production-ready:** Built with `https://rsr123.runasp.net/api`
