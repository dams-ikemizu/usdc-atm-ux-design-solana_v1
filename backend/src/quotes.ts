import { Keypair } from "@solana/web3.js";
import { randomUUID } from "node:crypto";
import { FIXED_RATE_JPY_PER_USDC, QUOTE_TTL_MS } from "./constants.ts";
import type { QuoteRecord } from "./interface/index.ts";

// クォートを覚えておくための最小限の実装。DBはまだ不要なのでメモリ上のMapで十分。
// プロセスを再起動すると消える(devnet検証段階ではこれで問題ない)。
const quotes = new Map<string, QuoteRecord>();

export function createQuote(atmId: string, amountJpy: number): QuoteRecord {
  const now = Date.now();
  const usdcAmount = Math.round((amountJpy / FIXED_RATE_JPY_PER_USDC) * 100) / 100;
  const reference = Keypair.generate();

  const quote: QuoteRecord = {
    quoteId: randomUUID(),
    atmId,
    amountJpy,
    rateJpyPerUsdc: FIXED_RATE_JPY_PER_USDC,
    usdcAmount,
    referencePublicKey: reference.publicKey.toBase58(),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + QUOTE_TTL_MS).toISOString(),
  };

  quotes.set(quote.quoteId, quote);
  return quote;
}

export function getQuote(quoteId: string): QuoteRecord | undefined {
  return quotes.get(quoteId);
}
