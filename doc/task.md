# 專案 Prototype 開發任務清單

## 1. 基礎建設 (Infrastructure)

- [x] 建立 React 專案 (使用 Vite + React)
- [x] 配置 Tailwind CSS 進行快速 UI 開發
- [x] 安裝必要套件 (three, @google/model-viewer, react-router-dom)

## 2. 頁面與路由架構 (Routing & Layout)

- [x] 設定 React Router
- [x] 建立首頁 (Home)：提供「記憶掃描器」與「萬物物件牆」兩個入口
- [x] 建立共用 Layout (導覽列與返回按鈕)

## 3. 功能實作：萬物物件牆 (Object Wall)

- [x] 建立假資料 (Mock Data)：包含至少 2 個物件的名稱、故事、3D 模型 (.glb) 網址
- [x] 實作列表頁：以網格 (Grid) 顯示物件縮圖與名稱
- [x] 實作詳情頁：整合 `<model-viewer>`
  - [x] 支援 360 度手勢旋轉與縮放
  - [x] 啟用原生 AR 按鈕 (`ar` 屬性)

## 4. 功能實作：記憶掃描器 (Memory Scanner)

- [x] 頁面基礎 UI (攝影機權限提示、載入中狀態顯示)
- [x] 整合相機畫面與 Web AR 追蹤 (暫用簡單的 marker 或直接開啟相機體驗)
- [x] 整合 Three.js：在畫面上渲染 3D 模型
- [x] 實作貼圖切換功能：點擊「喚醒記憶」按鈕，將模型的材質由 `stone_map` 切換為 `color_map`

## 5. 測試與部署 (Testing & Deployment)

- [x] 配置 PostCSS 以修復 Tailwind 跑版問題
- [x] 清除 Vite 預設 CSS 衝突
- [x] 將所有規劃文檔移至 `doc/` 資料夾
- [/] 實用性測試：確保在手機瀏覽器可開啟攝影機與 AR 功能 (等待 User 驗證)
- [x] 部署至 Vercel (設定檔準備與確認)
