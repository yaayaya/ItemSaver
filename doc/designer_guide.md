# 🎨 設計師使用手冊

本文件供設計師 / 非工程人員使用，說明如何修改「萬物保存計畫」Demo 中的物件、文字、模型與材質。

**不需要寫程式**——所有客製化都透過修改一個 JSON 檔案完成。

---

## 目錄

1. [快速上手](#快速上手)
2. [JSON 設定檔總覽](#json-設定檔總覽)
3. [修改網站文字](#修改網站文字)
4. [新增 / 替換物件](#新增--替換物件)
5. [3D 模型準備規範](#3d-模型準備規範)
6. [材質與貼圖替換](#材質與貼圖替換)
7. [AR 掃描圖片製作](#ar-掃描圖片製作)
8. [頁面功能說明](#頁面功能說明)
9. [常見問題 FAQ](#常見問題-faq)

---

## 快速上手

### 1. 所有設定都在這個檔案

```
public/data/site.json
```

用任何文字編輯器（VS Code、記事本皆可）開啟即可修改。

### 2. 模型和圖片放在這裡

```
public/assets/           ← 3D 模型 (.glb)
public/assets/markers/   ← AR 掃描標記圖片
public/assets/textures/  ← 自訂貼圖（選用）
```

### 3. 修改後預覽

```bash
npm run dev
```

在瀏覽器開啟 http://localhost:5173 即可即時預覽變更。（JSON 修改後重新整理頁面即可）

---

## JSON 設定檔總覽

`public/data/site.json` 包含兩大區塊：

```json
{
  "site": { ... },     // 全站設定（標題、說明、頁尾）
  "pages": { ... },    // 各頁面文字
  "items": [ ... ]     // 物件清單（模型、故事、貼圖等）
}
```

---

## 修改網站文字

### 全站標題與頁尾

```json
"site": {
  "title": "萬物保存計畫",        // 導航列標題
  "subtitle": "ItemSaver",        // 副標題
  "description": "每一件物品...",  // 網站描述
  "footer": "萬物保存計畫 Prototype © 2026"  // 頁尾文字
}
```

### 首頁文字

```json
"pages": {
  "home": {
    "heading": "萬物保存計畫",          // 首頁大標題
    "description": "每一件物品...",      // 首頁描述（\\n 可換行）
    "cards": {
      "wall": {
        "icon": "🏛️",                  // 圖示 emoji
        "title": "萬物物件牆",           // 卡片標題
        "description": "瀏覽所有..."     // 卡片描述
      },
      "scanner": { ... },
      "ar": { ... }
    }
  }
}
```

### 各功能頁文字

每個頁面都有獨立的文字設定：

| 頁面 | JSON key | 可改欄位 |
|------|---------|---------|
| 物件牆 | `pages.wall` | heading, description, hint, storyLabel, arButton, fullscreenButton |
| 掃描器 | `pages.scanner` | heading, description, storyLabel, stoneButton, colorButton, stoneStatus, colorStatus |
| AR 掃描 | `pages.ar` | heading, cameraLoading, scanning, scanGuide, demoHint, stoneButton, colorButton, arButton 等 |

> **提示**：所有按鈕文字都可包含 emoji，例如 `"✨ 喚醒記憶"` 或 `"📱 AR 實景"`。

---

## 新增 / 替換物件

在 `site.json` 的 `items` 陣列中新增或修改物件：

```json
"items": [
  {
    "id": 1,                                    // 唯一數字編號
    "name": "太空人",                             // 顯示名稱
    "story": "一位來自遠方的太空探險家...",         // 物件故事（可以很長）
    "model_url": "/assets/Astronaut.glb",        // 3D 模型路徑
    "thumbnail": "🧑‍🚀",                         // 物件牆小圖 emoji
    "marker_image": "/assets/markers/astronaut_marker.png", // AR 掃描標記
    "original_texture": null,                    // 彩色貼圖（null=用模型內建）
    "stone_texture": null                        // 石材貼圖（null=用程式灰色）
  }
]
```

### 新增物件 Step-by-Step

1. 將 `.glb` 模型檔案放入 `public/assets/`
2. 在 `site.json` 的 `items` 陣列最後面加一筆
3. 確保 `id` 不重複
4. 重新整理瀏覽器即可看到

### 刪除物件

直接刪除 `items` 中對應的整個 `{ ... }` 區塊即可。

### 調整排序

`items` 陣列的順序就是顯示順序，調整 JSON 中的前後位置即可。

---

## 3D 模型準備規範

### 格式要求

| 項目 | 規格 |
|------|------|
| **檔案格式** | `.glb`（GLTF Binary）— **唯一支援格式** |
| **建議大小** | < 5 MB |
| **多邊形面數** | < 50,000 faces（手機體驗較佳） |
| **材質** | PBR (Metallic-Roughness) |
| **UV 展開** | 必須完整（材質切換依賴 UV） |

### 模型壓縮

若模型過大，可使用 Draco 壓縮：

```bash
npx gltf-pipeline -i input.glb -o output.glb --draco.compressionLevel=7
```

### 模型匯出建議（Blender）

1. `File > Export > glTF 2.0 (.glb)`
2. 勾選：
   - ✅ Include > Materials
   - ✅ Include > Textures (嵌入)
   - ✅ Geometry > Apply Modifiers
   - ✅ Geometry > UVs
3. Compression > Draco（選用）

### 模型匯出建議（其他工具）

- **Hunyuan3D**：直接輸出 `.glb` 即可使用
- **Sketchfab**：下載時選擇 glTF Binary 格式
- **Meshy / Tripo3D**：匯出選 `.glb`

---

## 材質與貼圖替換

### 預設行為（不需要額外貼圖）

- **彩色模式**：使用模型 `.glb` 內建的材質和貼圖
- **石材模式**：程式自動將所有表面替換為統一灰色（模仿石板質感）

只要模型本身有完整的 PBR 材質，不需要另外準備貼圖檔案。

### 進階：自訂貼圖

若想要更精緻的石材效果，可以自己準備貼圖：

1. **彩色貼圖**：將 PNG/JPG 放入 `public/assets/textures/`
2. **石材貼圖**：準備灰階石材質感的 PNG/JPG
3. **更新 JSON**：

```json
{
  "id": 1,
  "name": "太空人",
  "original_texture": "/assets/textures/astronaut_color.png",
  "stone_texture": "/assets/textures/astronaut_stone.jpg",
  ...
}
```

### 貼圖製作建議

| 項目 | 規格 |
|------|------|
| **格式** | PNG（透明度需要時）或 JPG |
| **解析度** | 1024×1024 或 2048×2048 |
| **UV 對應** | 必須與模型的 UV layout 一致 |

#### 石材貼圖製作方法（Photoshop）

1. 開啟彩色貼圖
2. `Image > Adjustments > Desaturate`（去色）
3. `Filter > Noise > Add Noise`（加噪點模擬石材顆粒）
4. 調整 `Brightness/Contrast` 讓整體偏暗
5. 存檔為 JPG

---

## AR 掃描圖片製作

AR 掃描功能允許使用手機相機「掃描石板」來觸發 3D 模型顯示。

### 目前狀態（DEMO 模式）

目前 Prototype 使用**模擬按鈕**觸發偵測（不需要真正的圖像識別）。這是為了在沒有實體石板的情況下也能展示完整流程。

### 未來整合（Encantar.js NFT 追蹤）

正式版將使用 Encantar.js 的 NFT（Natural Feature Tracking）進行圖像識別。屆時需要：

#### 標記圖片準備規範

| 項目 | 規格 |
|------|------|
| **格式** | PNG 或 JPG |
| **解析度** | 至少 600×600 px |
| **內容** | 石板拓印照片或輪廓圖 |
| **特徵要求** | 需有豐富的紋理細節（見下方說明）|

#### 拍攝石板標記圖的建議

1. **光線均勻**：避免強烈陰影，使用柔光或陰天拍攝
2. **正面拍攝**：相機垂直於石板表面
3. **填滿畫面**：石板輪廓佔畫面 80% 以上
4. **清晰對焦**：確保紋理細節清楚
5. **背景單純**：最好是純色背景（黑色或白色）

#### 提高辨識率的技巧

- ✅ 有不規則邊緣的輪廓
- ✅ 有豐富紋理變化（刻痕、裂紋、凹凸）
- ✅ 有明暗對比
- ❌ 避免大面積純色區域
- ❌ 避免重複性高的規則圖案
- ❌ 避免過於對稱的圖案

#### 標記圖片存放

```
public/assets/markers/
├── astronaut_marker.png
├── duck_marker.png
└── your_new_item_marker.png
```

在 `site.json` 中對應設定：

```json
{
  "marker_image": "/assets/markers/your_new_item_marker.png"
}
```

---

## 頁面功能說明

### 🏛️ 萬物物件牆 (`/wall`)

- 顯示所有物件的 3D 模型小預覽卡片
- **點擊卡片** → 開啟彈窗查看互動 3D 模型
- 彈窗功能：
  - 👆 拖曳旋轉模型
  - 🔍 右側大按鈕放大 / 縮小 / 重置（為長者設計）
  - 📱 「在 AR 中查看」啟動手機原生 AR
  - ⛶ 「全螢幕」進入沉浸式全螢幕瀏覽
- 底部顯示物件故事

### 🔍 記憶掃描器 (`/scanner`)

- 使用 Three.js 渲染的 3D 場景
- **預設為石材質感**（灰色）
- 點擊「✨ 喚醒記憶」→ 切換為彩色原貌
- 點擊「🪨 回到石材」→ 恢復灰色
- 上方按鈕可切換不同物件

### 📱 AR 石板掃描 (`/ar`)

- 啟動手機後置相機
- 中央掃描框引導對準石板
- **DEMO 模式**：下方有按鈕模擬偵測不同石板
- 偵測到後：
  - 底部浮現 3D 模型（預設石材質感）
  - 「✨ 喚醒記憶」讓石板復活為彩色
  - 「📱 AR 實景」進入 AR 模式，可將模型放到現實桌面上
  - 可展開查看物件故事

---

## 常見問題 FAQ

### Q: 我改了 JSON 但畫面沒變？
**A:** 重新整理瀏覽器（Ctrl+F5 / Cmd+Shift+R 強制清除快取）。

### Q: 我的模型很大（>10MB），能用嗎？
**A:** 技術上可以，但手機載入會很慢。建議使用 Draco 壓縮到 5MB 以下。

### Q: AR 按鈕按了沒反應？
**A:** AR 功能需要：
- **HTTPS**（本機 localhost 除外，部署後的 Vercel 網址有 HTTPS）
- **行動裝置**（桌機沒有 AR 功能）
- iOS 12+ 或 Android 8+

### Q: 如何測試手機上的效果？
**A:**
1. 確保手機與電腦在同一個 Wi-Fi 網路
2. 啟動 dev server：`npm run dev -- --host`
3. 手機瀏覽器開啟 `http://你的電腦IP:5173`
4. 注意：相機和 AR 功能在非 HTTPS 下可能受限，部署到 Vercel 後測試最準確

### Q: 物件牆可以放多少個物件？
**A:** 理論上無限制。卡片使用輕量 3D 預覽（禁用互動），不會一次載入所有完整模型。

### Q: JSON 格式寫錯了會怎樣？
**A:** 網頁會載入失敗。建議修改後用 [JSONLint](https://jsonlint.com/) 驗證格式是否正確。

### Q: emoji 縮圖可以換成圖片嗎？
**A:** 目前物件牆卡片使用 3D 模型小預覽，`thumbnail` emoji 僅在 AR 掃描等處作為標識使用。

---

## 檔案結構速查

```
public/
├── data/
│   └── site.json              ← 📝 所有文字和物件設定（設計師主要修改這裡）
├── assets/
│   ├── Astronaut.glb          ← 🎨 3D 模型
│   ├── Duck.glb
│   ├── markers/               ← 📷 AR 掃描標記圖片
│   │   ├── astronaut_marker.png
│   │   └── duck_marker.png
│   └── textures/              ← 🖼️ 自訂貼圖（選用）
└── vite.svg
```

---

_更新日期：2026-03-02_
