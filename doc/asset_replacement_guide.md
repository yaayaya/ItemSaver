# 模型替換與資產管理指南

本文件說明如何在「萬物保存計畫」Vue Prototype 中替換 3D 模型、材質貼圖及相關資產。

---

## 目錄

1. [專案資產結構](#專案資產結構)
2. [核心資料檔案](#核心資料檔案)
3. [新增或替換物件（Step by Step）](#新增或替換物件step-by-step)
4. [各頁面替換邏輯說明](#各頁面替換邏輯說明)
5. [材質切換機制](#材質切換機制)
6. [自訂貼圖替換（進階）](#自訂貼圖替換進階)
7. [常見問題](#常見問題)

---

## 專案資產結構

```
public/
└── assets/
    ├── Astronaut.glb          # 太空人 3D 模型
    ├── Duck.glb               # 小黃鴨 3D 模型
    └── markers/               # AR 掃描用標記圖片（未來擴充）
        ├── astronaut_marker.png
        └── duck_marker.png
```

所有放在 `public/` 資料夾下的檔案都可以透過 `/` 開頭的路徑直接存取。例如 `public/assets/Duck.glb` → `/assets/Duck.glb`。

---

## 核心資料檔案

所有物件資料統一管理在：

```
src/data/mockItems.js
```

此檔案匯出一個 `mockItems` 陣列，每個物件包含以下欄位：

```javascript
{
  id: 1,                              // 唯一識別碼（數字）
  name: '物件名稱',                     // 顯示名稱
  story: '物件的故事描述...',            // 物件牆彈窗 & AR 掃描中顯示
  model_url: '/assets/YourModel.glb', // 3D 模型路徑 (.glb 格式)
  thumbnail: '🧑‍🚀',                    // Emoji 縮圖（物件牆靜態預覽用）
  marker_image: '/assets/markers/your_marker.png', // AR 掃描標記圖
  original_texture: null,             // 彩色貼圖路徑（null = 使用模型內建）
  stone_texture: null                 // 石材貼圖路徑（null = 使用程式生成灰色）
}
```

---

## 新增或替換物件（Step by Step）

### 步驟 1：準備 3D 模型

- 格式必須為 **`.glb`**（GLTF Binary）。
- 建議檔案大小 **< 5MB**，可使用 [gltf-pipeline](https://github.com/CesiumGS/gltf-pipeline) 壓縮：
  ```bash
  npx gltf-pipeline -i input.glb -o output.glb --draco.compressionLevel=7
  ```
- 模型最好具備完整的 UV 展開（材質切換依賴 UV）。

### 步驟 2：放置模型檔案

將 `.glb` 檔案複製到：

```
public/assets/YourModel.glb
```

### 步驟 3：（選擇性）準備標記圖片

若需要 AR 掃描偵測功能，請準備一張石板/輪廓圖片：

```
public/assets/markers/your_marker.png
```

### 步驟 4：修改 mockItems.js

開啟 `src/data/mockItems.js`，在陣列中新增一筆物件：

```javascript
export const mockItems = [
  // ... 現有物件 ...
  {
    id: 3,                                    // 新的唯一 ID
    name: '新物件名稱',
    story: '這個物件的故事描述...',
    model_url: '/assets/YourModel.glb',       // 對應步驟 2 的路徑
    thumbnail: '🎨',                          // 選一個代表性 emoji
    marker_image: '/assets/markers/your_marker.png',
    original_texture: null,                   // 見「自訂貼圖替換」章節
    stone_texture: null
  }
]
```

### 步驟 5：驗證

```bash
npm run dev
```

開啟瀏覽器檢查：
- `/wall` → 新物件是否出現在物件牆
- `/scanner` → 能否選擇並載入新模型
- `/ar` → 模擬偵測是否顯示正確

---

## 各頁面替換邏輯說明

### 萬物物件牆 (`/wall`)

| 欄位 | 用途 |
|------|------|
| `thumbnail` | 靜態卡片上的 Emoji 預覽（不載入 3D） |
| `name` | 卡片與彈窗標題 |
| `model_url` | 彈窗中 `<model-viewer>` 載入的 3D 模型 |
| `story` | 彈窗中顯示的故事文字 |

- 點擊卡片 → 開啟彈窗 → 載入 `<model-viewer>` 互動式 3D 預覽。
- 彈窗內有 **放大 (+)、縮小 (−)、重置 (↺)** 按鈕，方便長者操作。
- AR 按鈕使用 `model-viewer` 原生 AR 功能（iOS QuickLook / Android Scene Viewer）。
- 只要模型是標準 `.glb` 格式，AR 投放會自動運作。

### 記憶掃描器 (`/scanner`)

| 欄位 | 用途 |
|------|------|
| `model_url` | Three.js 場景載入的 GLB 模型 |
| `name` / `story` | 模型資訊面板 |

- 頁面上方有物件選擇按鈕，可直接切換不同模型。
- Three.js 會自動縮放模型到統一大小並置中。
- 支援 OrbitControls（拖曳旋轉、滾輪縮放）。

### AR 石板掃描 (`/ar`)

| 欄位 | 用途 |
|------|------|
| `marker_image` | 未來用於圖像追蹤比對（目前為 DEMO 模擬） |
| `model_url` | 偵測到石板後載入的 3D 模型 |
| `name` / `story` | 偵測後控制面板顯示 |

- 開啟手機後置相機即時預覽。
- **DEMO 模式**：畫面下方有按鈕模擬「偵測到石板」事件。
- 偵測後：
  - 底部浮現 Three.js 3D 模型視窗（預設石材質感）。
  - 「✨ 喚醒記憶」按鈕切換為彩色。
  - 「📱 AR 實景」按鈕進入 model-viewer AR 模式，可將模型放置在現實環境中。

---

## 材質切換機制

材質切換是本專案的核心互動。運作原理如下：

### 預設行為（`original_texture` 和 `stone_texture` 為 `null`）

1. **載入模型** → 讀取 GLB 內建的所有材質，逐 Mesh 儲存為 `originalMaterials`。
2. **石材模式** → 將所有 Mesh 替換為統一的灰色 `MeshStandardMaterial`：
   ```javascript
   { color: 0x8a8a8a, roughness: 0.9, metalness: 0.1 }
   ```
3. **喚醒記憶** → 還原為步驟 1 儲存的原始材質。

### 自訂石材質感

若要自訂石材外觀，可修改 `Scanner.vue` 或 `ARScanner.vue` 中的 `stoneMaterial`：

```javascript
const stoneMaterial = new THREE.MeshStandardMaterial({
  color: 0x8a8a8a,       // 顏色（灰色）
  roughness: 0.9,         // 粗糙度 (0=光滑, 1=粗糙)
  metalness: 0.1          // 金屬感 (0=非金屬, 1=金屬)
})
```

---

## 自訂貼圖替換（進階）

若您有獨立的彩色貼圖和石材貼圖 PNG/JPG 檔案，可以這樣使用：

### 步驟 1：放置貼圖

```
public/assets/textures/
├── astronaut_color.png    # 彩色貼圖
└── astronaut_stone.jpg    # 石材貼圖
```

### 步驟 2：更新 mockItems.js

```javascript
{
  id: 1,
  name: '太空人',
  model_url: '/assets/Astronaut.glb',
  original_texture: '/assets/textures/astronaut_color.png',
  stone_texture: '/assets/textures/astronaut_stone.jpg',
  // ...
}
```

### 步驟 3：修改材質切換邏輯

目前 Prototype 的材質切換使用「整體替換 Material」的方式。若要改為「替換貼圖 Map」，需修改 `Scanner.vue` 或 `ARScanner.vue` 中的 `toggleTexture` 函式：

```javascript
import * as THREE from 'three'

const textureLoader = new THREE.TextureLoader()

function applyTexture(url) {
  if (!currentModel.value || !url) return
  const texture = textureLoader.load(url)
  currentModel.value.traverse((child) => {
    if (child.isMesh) {
      child.material.map = texture
      child.material.needsUpdate = true
    }
  })
}
```

> ⚠️ **注意**：使用貼圖替換時，模型必須有正確的 UV 展開，否則貼圖會變形。

---

## 常見問題

### Q: 模型載入後是全黑的？
**A:** 通常是模型沒有嵌入材質或貼圖。在 Blender 中確認模型的材質有正確設定，並在匯出 GLB 時勾選「Include Materials」。

### Q: AR 按鈕按了沒反應？
**A:** AR 功能需要：
- **HTTPS** 連線（本機 `localhost` 除外）
- 行動裝置支援（iOS 12+ 或 Android 8+）
- `.glb` 格式的模型

### Q: 如何大量匯入物件？
**A:** 目前是手動編輯 `mockItems.js`。未來可以改為從後端 API 取得資料，只需將 `mockItems` 替換為 API 回應即可。

### Q: 模型太大載入很慢？
**A:** 建議：
1. 使用 `gltf-pipeline` 進行 Draco 壓縮
2. 降低多邊形面數（目標 < 50K faces）
3. 將貼圖壓縮為 1024x1024 或更小

---

_更新日期：2026-03-02_
