# Prototype 實作完成 Walkthrough

已為您的「Encantar.js 公共藝術專案」建立了初始的 React Prototype 測試環境。所有必要的基礎功能（頁面路由、物件牆預覽、相機及 Three.js 整合）皆已建置完畢，並添加了適用於 Vercel 部署的設定。以下是目前的成果與測試方式說明。

## 已經完成的功能

### 1. 頁面與路由架構

- **首頁入口 (`/`)**：提供清晰的選項，分為「記憶掃描器」與「萬物物件牆」。
- 整合了 React Router (`react-router-dom`)，實作 SPA (Single Page Application) 並搭配 `vercel.json` 確保部署後的所有網址均能正常導向。

### 2. 萬物物件牆 (Object Wall)

- **360 度模型預覽**：整合了 `@google/model-viewer`，您可以透過點擊物件跳出彈窗（Modal）並在其中對 3D 模型進行平移、旋轉、縮放等操作。
- **手機 AR 體驗**：在 Modal 內設有原生的「AR 預覽」按鈕（透過 `ar`, `ar-modes` 屬性驅動）。若您使用支援的手機設備開啟此網頁，點擊按鈕即可立即開啟 iOS QuickLook 或是 Android Scene Viewer 將物件放置於現實中。
- **Mock Data 整合**：目前綁定了兩組含有完整結構的測試資料（宇航員、機器人）。

### 3. 記憶掃描器 (Memory Scanner)

- **Webcam 整合**：頁面進入後會請求環境相機權限（後置鏡頭），並將畫面作為背景即時串流顯示。
- **Three.js AR 疊加與材質切換**：
  - 載入了 `three` 及 `GLTFLoader` 以將 3D 模型繪製在相機畫面上方。
  - 實作了材質切換核心邏輯：點擊「喚醒記憶」/「還原」按鈕時，會對載入的 3D 模型即時切換 `stone_map` (灰階質感) 與 `color_map` (原本質感)。

### 4. 維護與故障排除 (2026-03-02 更新)

- **跑版修復**：修正了 `postcss.config.js` 缺失導致 Tailwind CSS 無效的問題，並移除了 Vite 預設的 `App.css` 以防止樣式衝突。
- **文件整理**：應需求將所有規劃與業務文件移至專案目錄下的 `doc/` 資料夾中。

---

## 測試與驗證指南

您可以依照以下步驟在本機或佈署至 Vercel 上進行驗證：

### 本機快速測試

1. 在終端機 (Terminal) 執行啟動指令：
   ```bash
   npm run dev
   ```
2. **電腦端**：打開瀏覽器前往 http://localhost:5173/，測試滑鼠拖曳旋轉物件牆中的模型，以及點擊 Scanning 頁面的「喚醒記憶」材質切換。
3. **手機端測試 (推薦)**：由於 AR 功能與後置相機需在手機環境才能完美體驗：
   - 確認手機與電腦連線在同一個 Wi-Fi 網路。
   - 執行 `npm run dev --host`（如果在 Vite 環境中）。
   - 在終端機找到 Network IP 網址（例如 `http://192.168.x.x:5173/`）。
   - 在您的手機瀏覽器中開啟該網址進行 AR 預覽與相機實測。

### Vercel 部署步驟

既然我們已經配置了 `vercel.json` 防止 404，您只需將 `d:\_Git\ItemSaver` 這包程式碼推送到您的 GitHub Repository，接著前往 Vercel 控制台選擇 Import 該 Repo 即可，Vercel 將自動判定為 Vite 專案並順利打包上線！
