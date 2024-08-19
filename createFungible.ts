import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, signerIdentity, generateSigner, percentAmount, some, transactionBuilder, createSignerFromKeypair } from '@metaplex-foundation/umi';
import { TokenStandard, createAndMint, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { setComputeUnitPrice, setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox'
import fs from 'fs';

// Mainnet
const umi = createUmi('https://api.mainnet-beta.solana.com').use(mplTokenMetadata())

// Devnet
//const umi = createUmi('https://api.devnet.solana.com/').use(mplTokenMetadata())

//Import your private key file and parse it.
const wallet = './token-keypair.json'
const secretKey = JSON.parse(fs.readFileSync(wallet, 'utf-8'))

// Create a keypair from your private key
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey))
//const mySigner = createSignerFromKeypair(umi, keypair);

// Register a new keypair as the identity and payer.
umi.use(keypairIdentity(keypair))
//umi.use(signerIdentity(mySigner));

// const mint = publicKey("")
const mint = generateSigner(umi);
const metadataUri = 'your-uploaded-metadata-file'

// Old style add priority fee to the transaction
/*const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1,
  });

let builder = transactionBuilder().add({
    instruction: fromWeb3JsInstruction(addPriorityFee),
    signers: [umi.identity],
    bytesCreatedOnChain: 0,
});*/

createAndMint(umi, {
  mint,
  authority: umi.identity,
  name: 'BEEBEE',
  symbol: 'BEEBEE',
  uri: metadataUri,
  sellerFeeBasisPoints: percentAmount(0),
  amount: 88888888888_88888,
  decimals: some(5), // for 0 decimals use some(0)
  tokenOwner: umi.identity.publicKey,
  tokenStandard: TokenStandard.Fungible
})
.add(setComputeUnitLimit(umi, { units: 130000 })) // Set the Compute Unit limit.
.add(setComputeUnitPrice(umi, { microLamports: 5000 })) // Set the price per Compute Unit in micro-lamports.
.sendAndConfirm(umi).then((tx) => {
  console.log(tx);
});