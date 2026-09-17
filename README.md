# usdc-atm-ux-design-solana_v1

USDCをセブン銀行ATMで日本円の現金に換えるサービスの設計・実装。

## docs/

設計書。`docs/usdc-atm-ux-design-solana_v1.html` がSolana版の本体（方式B: Solana Pay）。シーケンス図は `docs/B_SolanaPay.png`。`docs/usdc-atm-ux-design-v1-0.html` と `docs/A_自前署名方式.png` は旧EVM版（方式A）で、参考比較用。

## backend/

DAMS Backend。ATMからの要求を受け取り、Solanaと通信する部分。Node.js + TypeScript（`tsx`で直接実行、ビルド不要）、依存は `@solana/web3.js` のみ。

```
backend/src/
  interface/index.ts   -- export interface / export type
  constants.ts          -- export const（設定値）
  solana.ts             -- Solana接続・鍵管理・送信ロジック
  server.ts             -- HTTPの受け口
```

### 起動

```
cd backend
npm install
npm run dev
```

`http://localhost:8787` で待ち受ける。

### ATMからの要求を模した確認

```
cd backend
curl -s http://localhost:8787/quote-request -H "Content-Type: application/json" --data "@scripts/atm-quote-request.json"
```

現状、シーケンス図の01→02（ATMからのクォート要求受信）と、Solana devnetへの接続・送信（devnet専用のfee payer鍵を自動生成し、確認用のトランザクションを送信）まで実装済み。レート確定・reference鍵ペア生成以降は未実装。
