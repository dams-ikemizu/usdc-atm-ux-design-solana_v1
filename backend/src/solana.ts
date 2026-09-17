import {
  Connection,
  clusterApiUrl,
  Keypair,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { SOLANA_NETWORK, MEMO_PROGRAM_ID, FEE_PAYER_PATH } from "./constants.ts";
import type { SolanaHealth, OnChainRecord } from "./interface/index.ts";

// シーケンス図の「DAMS Backend」がSolanaと話すための唯一の入口。
export const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), "confirmed");

// DAMSがトランザクション送信のために使うdevnet専用の鍵。実運用の秘密鍵管理とは無関係。
// なければ生成してファイルに保存するだけの、devnet検証用の最小実装。
function _loadOrCreateFeePayer(): Keypair {
  if (existsSync(FEE_PAYER_PATH)) {
    const secret: number[] = JSON.parse(readFileSync(FEE_PAYER_PATH, "utf8"));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  }
  const keypair = Keypair.generate();
  writeFileSync(FEE_PAYER_PATH, JSON.stringify(Array.from(keypair.secretKey)));
  return keypair;
}

export const feePayer = _loadOrCreateFeePayer();

async function _ensureFeePayerFunded(): Promise<void> {
  const balance = await connection.getBalance(feePayer.publicKey);
  if (balance >= 0.01 * LAMPORTS_PER_SOL) return;
  const signature = await connection.requestAirdrop(feePayer.publicKey, 1 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(signature, "confirmed");
}

// 「ATMからの要求を受け取ったらSolanaに接続する」を確認するための最小の疎通確認。
// レート確定やreference鍵ペア生成(シーケンス図03)は次のステップで実装する。
export async function checkSolanaConnectivity(): Promise<SolanaHealth> {
  const [slot, latestBlockhash] = await Promise.all([
    connection.getSlot(),
    connection.getLatestBlockhash(),
  ]);

  return {
    network: SOLANA_NETWORK,
    rpcEndpoint: connection.rpcEndpoint,
    slot,
    blockhash: latestBlockhash.blockhash,
  };
}

// クォート要求を受けたことを示すメモをSolanaに実際に送信・確定させる。
// 本来のreference(Solana PayのfindReference用の非署名アカウント)はまだ作らず、
// まずは「DAMS Backend自身がSolanaにトランザクションを送って確定させる」動きだけを確認する。
export async function recordQuoteOnChain(quoteId: string): Promise<OnChainRecord> {
  await _ensureFeePayerFunded();

  const instruction = new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from(`DAMS quote ${quoteId}`, "utf8"),
  });

  const signature = await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [feePayer]);

  return {
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
  };
}
