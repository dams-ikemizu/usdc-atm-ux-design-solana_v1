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
