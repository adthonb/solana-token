import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, publicKey, createSignerFromKeypair, none, transactionBuilder } from '@metaplex-foundation/umi';
import { setAuthority, AuthorityType, mplToolbox } from '@metaplex-foundation/mpl-toolbox'
import fs from 'fs'
import bs58 from 'bs58'

// Mainnet
const umi = createUmi('https://api.mainnet-beta.solana.com').use(mplToolbox())
const mint = publicKey('token-address');

// Devnet
//const umi = createUmi('https://api.devnet.solana.com').use(mplToolbox())
//const mint = publicKey('token-address');

//Import your private key file and parse it.
const wallet = './token-keypair.json'
const secretKey = JSON.parse(fs.readFileSync(wallet, 'utf-8'))

// Create a keypair from your private key
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey))

// Register a new keypair as the identity and payer.
umi.use(keypairIdentity(keypair))

let builder = transactionBuilder()
  .add(setAuthority(umi, {
    owned: mint,
    owner: umi.identity,
    authorityType: AuthorityType.FreezeAccount,
    newAuthority: none(),
  }))
  .add(setAuthority(umi, {
    owned: mint,
    owner: umi.identity,
    authorityType: AuthorityType.MintTokens,
    newAuthority: none(),
  }))

async function updateAuthoritu() {
  const confirmResult = await builder.sendAndConfirm(umi);

  if (confirmResult.result.value.err !== null) {
    console.log('err:', confirmResult.result.value.err)
  } else {
    const bytes = Uint8Array.from(confirmResult.signature);
    console.log('signature:', bs58.encode(bytes))
  }
}

updateAuthoritu();

// Old style to set token owner authority
/*async function freezeRevoke() {
  const tx = await setAuthority(umi, {
    owned: mint,
    owner: umi.identity,
    authorityType: AuthorityType.FreezeAccount,
    newAuthority: none(),
  }).sendAndConfirm(umi)
  //console.log(tx);
  if (tx.result.value.err !== null) {
    console.log(tx.result.value.err)
    return
  }
  const bytes = Uint8Array.from(tx.signature);
  console.log(bs58.encode(bytes))
};

async function mintRevoke() {
  const tx = await setAuthority(umi, {
    owned: mint,
    owner: umi.identity,
    authorityType: AuthorityType.MintTokens,
    newAuthority: none(),
  }).sendAndConfirm(umi)
  //console.log(tx);
  if (tx.result.value.err !== null) {
    console.log(tx.result.value.err)
    return
  }
  const bytes = Uint8Array.from(tx.signature);
  console.log(bs58.encode(bytes))
};*/