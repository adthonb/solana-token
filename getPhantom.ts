// This parse JSON private key to secret key and address
import bs58 from 'bs58';
import fs from 'fs';

const wallet = './token-keypair.json'
const secretKey = JSON.parse(fs.readFileSync(wallet, 'utf-8'))

console.log(secretKey);

const address = bs58.encode(secretKey)

console.log(address);