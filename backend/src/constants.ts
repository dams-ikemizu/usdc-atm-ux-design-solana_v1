import { PublicKey } from "@solana/web3.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { SolanaNetwork } from "./interface/index.ts";

// ネットワークはここ一箇所だけで決めるので、devnet/mainnet-betaの切り替えはこの行だけで済む。
export const SOLANA_NETWORK: SolanaNetwork = "devnet";

export const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

// DAMSがトランザクション送信のために使うdevnet専用の鍵の保存先。
const __dirname = dirname(fileURLToPath(import.meta.url));
export const FEE_PAYER_PATH = join(__dirname, "..", "dams-feepayer.devnet.json");

export const PORT = 8787;
