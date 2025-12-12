# 🐛 BUG FIX: Image Loading

**Date:** 2025-12-07
**Issue:** Images were appearing broken (cut-off or not loading) because the frontend was trying to load relative paths (e.g., `/uploads/image.jpg`) from the frontend server (localhost:5173) instead of the backend API (localhost:5266).

**Fix Implemented:**
1.  **Helper Function:** Created `getImageUrl` helper in both `ChaletCard.tsx` and `DashboardPage.tsx`.
2.  **Logic:** Checks if the URL starts with `http`. If not, it prepends `http://127.0.0.1:5266`.
3.  **Applied To:**
    -   **Dashboard List**: Chalet cover images.
    -   **Edit Modal**: Image previews.

Now all images should display correctly without broken icons.
