export type SolanaNetwork = "devnet" | "mainnet-beta";

export interface SolanaHealth {
  network: SolanaNetwork;
  rpcEndpoint: string;
  slot: number;
  blockhash: string;
}

export interface OnChainRecord {
  signature: string;
  explorerUrl: string;
}

export interface QuoteRequestBody {
  atmId?: string;
  amountJpy?: number;
}

export interface QuoteRecord {
  quoteId: string;
  atmId: string;
  amountJpy: number;
  rateJpyPerUsdc: number;
  usdcAmount: number;
  referencePublicKey: string;
  createdAt: string;
  expiresAt: string;
}
