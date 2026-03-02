# Prototype 開發計畫

基於業務大綱，為「記憶掃描器」與「萬物物件牆」打造一個可用於功能測試的 Vue Prototype。專案將專注於驗證 3D 互動與 AR 體驗，建立於 `d:\_Git\ItemSaver` 且支援 Vercel 部署。

## 設計決策

1. **UI 框架**：使用 **Vue 3** (Composition API + `<script setup>`) 取代原先規劃的 React。
2. **資料來源**：使用固定的 Mock Data（`src/data/mockItems.js`），不接真實後端。
3. **追蹤引擎**：Prototype 階段先建立 Three.js 基礎場景與材質切換邏輯，Encantar.js NFT 追蹤待後續整合。
4. **模型資源**：使用 `public/assets/` 目錄下的本地 `.glb` 模型（Astronaut.glb, Duck.glb）。

## 技術棧

| 模塊 | 工具 | 說明 |
|------|------|------|
| 建置工具 | Vite 6 | 快速開發與生產建置 |
| UI 框架 | Vue 3 + Vue Router 4 | SPA 路由與元件系統 |
| 樣式 | Tailwind CSS 4 | 響應式 UI 快速開發 |
| 物件牆渲染 | @google/model-viewer | 360 度預覽 + 系統原生 AR |
| 3D 渲染控制 | Three.js | 掃描器模式的模型載入與材質切換 |
| 部署 | Vercel | 自動部署 + HTTPS |

## 專案結構

```
ItemSaver/
├── index.html                 # 入口 HTML
├── package.json               # 依賴管理
├── vite.config.js             # Vite 設定 (Vue plugin + Tailwind)
├── vercel.json                # Vercel 部署設定
├── public/
│   └── assets/
│       ├── Astronaut.glb      # 太空人模型
│       └── Duck.glb           # 小黃鴨模型
├── src/
│   ├── main.js                # Vue app 入口
│   ├── style.css              # 全域樣式 + Tailwind 引入
│   ├── App.vue                # 主佈局 (導航 + RouterView)
│   ├── router/
│   │   └── index.js           # Vue Router 設定
│   ├── data/
│   │   └── mockItems.js       # Mock 物件資料
│   ├── components/
│   │   └── ModelViewer.vue    # model-viewer 封裝元件（支援 zoom props）
│   └── pages/
│       ├── Home.vue           # 首頁（三大功能入口）
│       ├── ObjectWall.vue     # 萬物物件牆（靜態卡片 + 彈窗模式）
│       ├── Scanner.vue        # 記憶掃描器（Three.js 材質切換）
│       └── ARScanner.vue      # AR 石板掃描（相機 + 偵測 + AR 實景）
└── doc/
    ├── implementation_plan.md # 本文件
    ├── asset_replacement_guide.md  # 模型替換指南
    └── 業務大綱.md
```

## 頁面功能說明

### 首頁 (`/`)
- 專案介紹與三大功能入口卡片（物件牆、掃描器、AR 掃描）。

### 萬物物件牆 (`/wall`)
- **靜態卡片預覽**：以 Emoji 縮圖呈現物件網格，避免一次載入大量 3D 模型。
- **點擊開啟彈窗**：彈窗中載入 `<model-viewer>` 互動式 3D 預覽。
- **無障礙操作**：彈窗右側有大尺寸放大 (+)、縮小 (−)、重置 (↺) 按鈕，方便長者操作。
- **AR 功能**：彈窗內 AR 按鈕啟動手機原生 AR (iOS QuickLook / Android Scene Viewer)。
- **故事展示**：彈窗下方顯示物件故事。

### 記憶掃描器 (`/scanner`)
- 使用 Three.js 建立 3D 場景，載入 GLB 模型。
- 支援切換不同物件模型。
- **「喚醒記憶」按鈕**：將模型材質從灰階石材切換為原始彩色（反之亦然）。
- OrbitControls 支援旋轉、縮放互動。

### AR 石板掃描 (`/ar`)
- **相機即時預覽**：啟動手機後置相機，全螢幕顯示。
- **石板偵測**：DEMO 階段以模擬按鈕觸發偵測（未來整合 Encantar.js NFT 追蹤）。
- **3D 模型浮現**：偵測到石板後，底部浮現 Three.js 場景，預設以石材質感呈現。
- **喚醒記憶**：切換材質，讓灰色石板「復活」為彩色。
- **AR 實景**：點擊 AR 按鈕進入 `<model-viewer>` AR 模式，將模型放置到現實世界中互動。

## 開發指令

```bash
npm install     # 安裝依賴
npm run dev     # 啟動開發伺服器
npm run build   # 生產建置
npm run preview # 預覽生產版本
```

## Verification Plan

### Manual Verification

1. **本機環境測試**：
   - 執行 `npm run dev` 並透過瀏覽器確認四個頁面佈局正確。
   - 物件牆：確認靜態卡片點擊開啟彈窗，彈窗內模型可旋轉，放大縮小按鈕正常。
   - 掃描器：確認 Three.js 模型載入，材質切換功能正常運作。
   - AR 掃描：確認相機啟動、模擬偵測、模型載入、材質切換、AR 實景功能。
   - 使用手機透過本機 IP 連線，測試相機與 AR 功能。
2. **Vercel 部署驗證**：
   - 連接 GitHub 自動部署或使用 Vercel CLI。
   - 在 HTTPS 環境下透過手機進行 AR 實測（相機權限需 HTTPS）。
