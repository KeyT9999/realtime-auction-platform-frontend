# Frontend Refactor Summary

## P0 (Critical) – Done

### 1. Environment variables
- **`.env.example`** – Added with `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_GEMINI_API_KEY`, and all `VITE_FIREBASE_*` keys.
- **`firebase.js`** – Already used `import.meta.env.VITE_FIREBASE_*`. Analytics is now optional (only initialised when `VITE_FIREBASE_MEASUREMENT_ID` is set).
- **`geminiService.js`** – Uses `import.meta.env.VITE_GEMINI_API_KEY`; throws if key is missing when calling the API.

### 2. Removed `console.log` from `api.js`
- All `console.log` / `console.error` removed from the API service.
- Same for **`signalRService.js`** (no console in production path).

### 3. Global Error Boundary
- **`src/components/common/ErrorBoundary.jsx`** – Class component that catches render errors, shows a fallback UI with “Thử lại”, and supports optional `onError` and `fallback` props.
- **`App.jsx`** – Root app is wrapped in `<ErrorBoundary>`.

### 4. Code splitting (React.lazy + Suspense)
- **`src/routes/index.jsx`** – All 35+ pages are lazy-loaded with `React.lazy(() => import(...))`.
- A single `<Suspense fallback={<PageFallback />}>` wraps all routes; fallback uses the existing `<Loading />` component.
- **`App.jsx`** – Renders `<AppRoutes />` from `routes/index.jsx` instead of defining routes inline.

---

## P1 (High) – Done

### 1. Catch-all 404
- **`src/pages/NotFound.jsx`** – Simple 404 page with link back to home.
- **`src/routes/index.jsx`** – `<Route path="*" element={<Layout><NotFound /></Layout>} />` added.

### 2. SignalR cleanup
- **`signalRService.js`** – Uses `connection.on(event, callback)`. The public API is `on(event, callback)`, which returns an unsub function that calls `off(event, callback)`. Components that use `signalRService.on(..., handler)` and use the returned unsub in `useEffect` cleanup are correctly cleaned up. No change required in subscription pattern; console noise removed.

### 3. Session expiry → redirect to login
- **`api.js`** – Added `setOnSessionExpired(callback)`. When refresh token fails after 401, it calls `tokenService.clearAll()` and then `onSessionExpired()` if set.
- **`src/components/common/SessionExpiryHandler.jsx`** – Uses `useNavigate()` and sets `apiService.setOnSessionExpired(() => { tokenService.clearAll(); navigate('/login', { replace: true }); })` on mount. Rendered inside `<Router>` in `App.jsx`.

### 4. Mobile hamburger menu (Header)
- **`src/components/layout/Header.jsx`** – Desktop nav remains for `md:` and up. For smaller screens:
  - Hamburger button toggles `mobileMenuOpen`.
  - Full-width overlay menu with same links and user dropdown content.
  - Escape closes menu; body scroll locked when open.
  - ARIA: `aria-expanded`, `aria-controls`, `aria-label` on button; `role="dialog"`, `aria-modal`, `aria-label` on menu.

### 5. Countdown Timer Context (single interval)
- **`src/contexts/CountdownContext.jsx`** – `CountdownProvider` runs one `setInterval(1000)` and provides `{ now }` (current timestamp).
- **`useCountdown()`** – Returns `{ now }`; if used outside provider, returns `{ now: Date.now() }` (no live updates).
- **`CountdownTimer.jsx`** – Uses `useCountdown().now` and `useMemo` to derive `timeLeft`, `progress`, `isWarning`, `isCritical` from `now` and `startTime`/`endTime`. No local `setInterval`.
- **`AuctionCard.jsx`** – Uses `useCountdown().now` and `useMemo` to compute `timeRemaining`, `isEndingSoon`, `isNew`. No local `setInterval`.
- **`App.jsx`** – Wraps app with `CountdownProvider` (inside `AuthProvider` tree).

---

## P2 (Medium) – Done

### 1. Skeleton loading
- **`src/components/common/SkeletonCard.jsx`** – Card placeholder (image block + lines).
- **`src/components/common/SkeletonTable.jsx`** – Table placeholder (configurable rows/cols).
- **`src/components/common/SkeletonList.jsx`** – List placeholder (avatar + lines).
- **AdminDashboard** – Loading state uses skeleton placeholders (stat row + table) instead of a single spinner.

### 2. Admin Dashboard
- **Quick actions** – Added buttons: Quản lý Rút tiền, Người dùng, Đấu giá, Bid, Danh mục.
- **Statistics** – Existing StatCards kept.
- **Loading** – Skeleton-based loading instead of full-screen spinner.

### 3. Breadcrumb
- **`src/components/common/Breadcrumb.jsx`** – Uses `useLocation()`, splits path, maps segments to Vietnamese labels (with a small `LABELS` map), outputs “Trang chủ / … / current”.
- **`src/components/layout/Layout.jsx`** – Renders `<Breadcrumb />` above `children` inside the main content container.

---

## P3 (Low) – Partial

- **Header** – ARIA and keyboard (Escape) added for the mobile menu.
- Focus trap for modals and full tab order were not implemented (can be added later to shared `Modal` and key pages).

---

## Project structure

- **`src/routes/index.jsx`** – Central route definitions and lazy page imports.
- **`src/contexts/CountdownContext.jsx`** – New.
- **`src/components/common/`** – ErrorBoundary, SessionExpiryHandler, SkeletonCard, SkeletonTable, SkeletonList, Breadcrumb.
- Existing `contexts/`, `hooks/`, `pages/`, `services/`, `components/`, `layout/` kept; no rename to `providers/` or `layouts/` to avoid breaking imports.

---

## How to run

1. Copy `.env.example` to `.env` and set `VITE_API_URL`, `VITE_GEMINI_API_KEY`, and `VITE_FIREBASE_*` as needed.
2. `npm run build` – succeeds.
3. `npm run dev` – run the app and test login, 404, mobile menu, and countdown on auction pages.
