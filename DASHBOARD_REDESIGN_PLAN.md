# 🎨 UI/UX Design System: Summer Vibes Dashboard

## 1. 🌈 Color Palette (Tailwind CSS)
A set of colors inspired by Ras Sedr beaches: deep sea blues, soft sands, and energetic accents.

| Color Name | Tailwind Class | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Ocean Primary** | `bg-blue-600` | `#2563EB` | Primary buttons, active states, key icons |
| **Ocean Dark** | `bg-blue-800` | `#1E40AF` | Hover states, headings, strong text |
| **Ocean Light** | `bg-blue-50` | `#EFF6FF` | Backgrounds for active items, light cards |
| **Sand Background** | `bg-stone-50` | `#FAFAF9` | Main page background (softer than gray-50) |
| **Pure White** | `bg-white` | `#FFFFFF` | Card backgrounds, sticky headers |
| **Text Main** | `text-slate-800` | `#1E293B` | Primary headings, body text |
| **Text Muted** | `text-slate-500` | `#64748B` | Secondary descriptions, timestamps |
| **Danger Soft** | `bg-red-500` | `#EF4444` | Delete buttons (softer than red-600) |
| **Success Breeze** | `bg-emerald-500`| `#10B981` | Success states, price tags |
| **Edit/Action** | `bg-slate-900` | `#0F172A` | Secondary actions (Edit) |

## 2. 📐 Typography & Spacing
- **Font Family:** `Inter` or `Outfit` (Modern Sans-Serif).
- **Headings:**
  - Page Title: `text-3xl font-bold text-slate-900`
  - Card Title: `text-xl font-semibold text-slate-800`
  - Price: `text-2xl font-bold text-blue-600`
- **Spacing Rules:**
  - **Cards:** `p-6` (24px) padding.
  - **Grid Gap:** `gap-8` (32px) for airy feel.
  - **Section Padding:** `py-8 px-6`.

## 3. 🧩 Component Design Specs

### **A. Chalet Card**
- **Shape:** `rounded-2xl` (More friendly than rounded-lg).
- **Shadow:** `shadow-sm hover:shadow-xl transition-shadow duration-300` (Interactive feel).
- **Border:** `border border-slate-100` (Subtle boundary).
- **Alignment:** Visual hierarchy: Image (if any) -> Title -> Price -> Tags -> Actions.
- **Buttons:**
  - All buttons `rounded-xl`.
  - "My Bookings": Large, Primary Blue.
  - "Edit": Dark Slate (Neutral).
  - "Delete": Soft Red (Danger).

### **B. Navbar**
- **Style:** Sticky, blurred backdrop (`backdrop-blur-md bg-white/90`).
- **Shadow:** `shadow-sm` (Light and airy).
- **Elements:**
  - Logo: Prominent.
  - Logout: `rounded-full` pill shape, soft red outline or subtle ghost button.

## 4. 🧠 User Experience (UX) Improvements
1. **Visual Hierarchy:** Price determines value, so it is made prominent. Title is clearly the anchor.
2. **Unified Actions:** "My Bookings" is the primary positive action (Blue). "Edit" is administrative (Neutral). "Delete" is destructive (Red). This semantic coloring reduces cognitive load.
3. **Card Consistency:** Fixed height or consistent flex alignment ensures the grid looks professional, not jagged.
4. **Summer & Trust:** The usage of `stone-50` and `blue-600` mimics sand and sea, creating a subconscious "vacation" context while maintaining professional "banking-like" trust with clean whites and slates.

---
*Implementation Plan:*
1. Refactor `DashboardPage` to extract `ChaletCard`.
2. Apply `rounded-2xl` and new color classes.
3. Update specific "Edit" and "Delete" button styles.
4. Smooth out responsive grid behavior.
