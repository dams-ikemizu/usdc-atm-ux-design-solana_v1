import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { checkSolanaConnectivity, recordQuoteOnChain } from "./solana.ts";
import { PORT } from "./constants.ts";
import type { QuoteRequestBody } from "./interface/index.ts";

// シーケンス図(B_SolanaPay.png)01〜02の受け口。
// ATMが「受取金額 ¥30,000」を選んだ後に飛んでくる「クォート要求」だけを扱う。
// ここでは受信してSolanaに接続できることまでを確認する。
// レート確定・reference鍵ペア生成(03以降)は次のステップで実装する。

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw.length > 0 ? JSON.parse(raw) : {};
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

async function handleQuoteRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let body: QuoteRequestBody;
  try {
    body = (await readJsonBody(req)) as QuoteRequestBody;
  } catch {
    sendJson(res, 400, { error: "invalid JSON body" });
    return;
  }

  const { atmId, amountJpy } = body;
  if (typeof atmId !== "string" || typeof amountJpy !== "number" || amountJpy <= 0) {
    sendJson(res, 400, { error: "atmId (string) and amountJpy (positive number) are required" });
    return;
  }

  console.log(`[quote-request] ATM ${atmId} からの要求: ¥${amountJpy.toLocaleString()}`);

  let solana;
  try {
    solana = await checkSolanaConnectivity();
  } catch (err) {
    console.error("[quote-request] Solana接続に失敗", err);
    sendJson(res, 502, { error: "failed to reach Solana network" });
    return;
  }

  console.log(`[quote-request] Solana接続OK: slot=${solana.slot} (${solana.network})`);

  const quoteId = randomUUID();
  let onChain;
  try {
    onChain = await recordQuoteOnChain(quoteId);
  } catch (err) {
    console.error("[quote-request] Solanaへの送信に失敗", err);
    sendJson(res, 502, { error: "failed to send transaction to Solana" });
    return;
  }

  console.log(`[quote-request] Solana送信OK: ${onChain.signature}`);

  sendJson(res, 200, {
    quoteId,
    atmId,
    amountJpy,
    receivedAt: new Date().toISOString(),
    solana,
    onChain,
  });
}

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/quote-request") {
    void handleQuoteRequest(req, res);
    return;
  }
  sendJson(res, 404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log(`DAMS Backend listening on http://localhost:${PORT}`);
});
