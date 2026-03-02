# Prototype 開發計畫

基於業務大綱，為「記憶掃描器」與「萬物物件牆」打造一個可用於功能測試的 React Prototype。專案將專注於驗證 3D 互動與 AR 體驗，建立於 `d:\_Git\ItemSaver` 且支援 Vercel 部署。

## User Review Required

> [!IMPORTANT]
>
> 1. **資料來源**：由於只需針對功能測試，目前不會接真實後端資料庫 (如 Supabase)，而是使用固定的 Mock Data。
> 2. **追蹤引擎**：在 Prototype 階段，由於 Encantar.js 需要相應的 Marker 編譯，我會先建立 Three.js 的基礎場景與材質切換邏輯，配合簡單的 WebAR 環境，以確保這條流程走得通。
> 3. **專案路徑**：我預計會將專案直接初始化在 `d:\_Git\ItemSaver` 目錄下（或是您偏好在該目錄底下再建一個子資料夾存放 React 程式碼？）。
>
> 請確認這些設定是否符合您的測試預期！

## Proposed Changes

### Frontend Application

- 使用 Vite + React 建置專案。
- 使用 Tailwind CSS 快速開發 UI。
- 添加 Vercel 部署輔助配置 (`vercel.json`)。

#### [NEW] `package.json` & `vite.config.js`

初始化 Vite + React 環境，並加入 `react-router-dom`, `three`, `@google/model-viewer` 以及 Tailwind CSS 相關套件。

#### [NEW] `src/App.jsx` & `src/main.jsx`

設定前端路由，包含三個主要頁面：首頁 (Home), 掃描器 (Scanner), 物件牆 (ObjectWall)。

#### [NEW] `src/data/mockItems.js`

定義測試用物件庫模型，包含：名稱、故事、3D 模型 (.glb) 網址、灰階與彩色貼圖的對應 URL（使用公共資源或產出的測試檔）。

#### [NEW] `src/pages/ObjectWall.jsx` & `src/components/ModelViewer.jsx`

- 呈現物件列表。
- 實作 `<model-viewer>`，確保支援 360 度旋轉與行動裝置的 AR 按鈕。

#### [NEW] `src/pages/Scanner.jsx`

- 加入 Web 相機訪問。
- 設定 Three.js 場景以呈現 3D 模型。
- 實作「喚醒記憶」按鈕：點擊後動態載入並替換 3D 模型的材質 (Stone -> Color)。

## Verification Plan

### Automated Tests

無。本階段著重核心互動驗證。

### Manual Verification

1. **本機環境測試**：
   - 執行 `npm run dev` 並透過瀏覽器確認網頁佈局。
   - 使用手機透過本機 IP 連線，點擊物件牆的 AR 按鈕，檢查是否能開啟 OS 原生的 AR 預覽 (iOS QuickLook 或 Android Scene Viewer)。
   - 在 Scanner 頁面允許相機權限，確認 Three.js 模型渲染正確，並測試材質切換功能。
2. **Vercel 部署驗證**：
   - 使用 Vercel CLI 或連接 GitHub 自動部署。
   - 在具有 HTTPS 的 Vercel 生成網址下，透過手機進行實機流程測試，驗證 AR 與相機功能是否在部署環境中正常運作。
