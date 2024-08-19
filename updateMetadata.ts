import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { updateV1, fetchMetadataFromSeeds, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import fs from 'fs'
import bs58 from 'bs58'

// Mainnet
const umi = createUmi('https://api.mainnet-beta.solana.com').use(mplTokenMetadata())
const mint = publicKey('token-address');

// Devnet
//const umi = createUmi('https://api.devnet.solana.com').use(mplTokenMetadata())
//const mint = publicKey('token-address'); // Your mint address

//Import your private key file and parse it.
const wallet = './token-keypair.json'
const secretKey = JSON.parse(fs.readFileSync(wallet, 'utf-8'))

// Create a keypair from your private key
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey))

// Register a new keypair as the identity and payer.
umi.use(keypairIdentity(keypair))

// Your metadata URI
// More information about metadata https://developers.metaplex.com/token-metadata/token-standard
const metadataUri = 'metadata-url'
  
async function updateMedatadata() {
  const initialMetadata = await fetchMetadataFromSeeds(umi, { mint })
  const tx = await updateV1(umi, {
    mint,
    data: { ...initialMetadata, uri: metadataUri },
  }).sendAndConfirm(umi)

  if (tx.result.value.err !== null) {
    console.log('err:', tx.result.value.err)
  } else {
    const bytes = Uint8Array.from(tx.signature);
    console.log('signature:', bs58.encode(bytes))
  }
};

async function setImmutable() {
  //const initialMetadata = await fetchMetadataFromSeeds(umi, { mint })
  const tx = await updateV1(umi, {
    mint,
    isMutable: false,
  }).sendAndConfirm(umi)

  if (tx.result.value.err !== null) {
    console.log('err:', tx.result.value.err)
  } else {
    const bytes = Uint8Array.from(tx.signature);
    console.log('signature:', bs58.encode(bytes))
  }
};

//updateMedatadata();
//setImmutable();