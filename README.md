# TOEIC 單字練習

可安裝在 iPhone 上的 TOEIC 背單字 PWA。1255 個核心單字，加權隨機出題：
按「✗ 不記得」的字會更常出現（權重 ×2），按「✓ 記得」的字會更少出現（權重 ÷2）。
字典頁依 A–Z 排序，顯示每個字累計「不記得」的次數。學習紀錄存在裝置上，離線可用。

## 安裝到 iPhone

1. 用 Safari 開啟部署後的網址（GitHub Pages）。
2. 點「分享」→「加入主畫面」。
3. 從主畫面開啟，即以全螢幕獨立 App 執行。

## 開發

```bash
npm install
npm run dev      # 開發伺服器（http://localhost:5173/toeic-tool/）
npm test         # Vitest 測試
npm run build    # 產出 dist/（含 PWA service worker 與 manifest）
```

## 部署

推上 `main` 後由 GitHub Actions（`.github/workflows/deploy.yml`）自動建置並部署到
GitHub Pages。`vite.config.ts` 的 `base` 設為 `/toeic-tool/`，repo 名稱需一致。

## 結構

- `src/lib/scheduler.ts` — 權重更新與加權隨機抽字（核心演算法）
- `src/lib/storage.ts` — localStorage 進度存取（key `toeic-progress-v1`）
- `src/data/words-*.json` — 單字資料（分字母區段），由 `src/data/words.ts` 合併排序
- `src/components/` — 練習頁、字典頁、底部懸浮 TabBar
- `scripts/generate-icons.mjs` — 由 SVG 產生 PWA 圖示（`node scripts/generate-icons.mjs`）
