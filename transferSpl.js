'use strict'

const web3 = require('@solana/web3.js')
const splToken = require('@solana/spl-token')
const fs = require('fs')
const { sleep } = require('@irys/sdk/common/utils')

// Mainnet
const connection = new web3.Connection(
    web3.clusterApiUrl('mainnet-beta'),
    'confirmed',
)

// Devnet
/*const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
)*/

main()

async function main() {
    const wallet = './token-keypair.json'
    const secretKey = JSON.parse(fs.readFileSync(wallet, 'utf-8'))
    const sender = web3.Keypair.fromSecretKey(Uint8Array.from(secretKey))
    console.log(sender.publicKey.toBase58())

    /*let transfers = [
        {recipient: new web3.PublicKey('YOUR_RECIPIENT_1'), value: 0.1},
        {recipient: new web3.PublicKey('YOUR_RECIPIENT_2'), value: 0.2}
    ]

    let tx = await buildSolBatchTransferTx(sender, transfers)
    let signature = await web3.sendAndConfirmTransaction(
        connection,
        tx,
        [sender]
    )
    
    console.log('SIGNATURE', signature)*/

    let tokenInfo = await getTokenInfo(connection, 'token-address')
    let splTransfers = [
        {recipient: new web3.PublicKey('wallet-address'), value: 11122233300000},
        {recipient: new web3.PublicKey('wallet-address'), value: 11122233377195},
        {recipient: new web3.PublicKey('wallet-address'), value: 11122233344093},
        {recipient: new web3.PublicKey('wallet-address'), value: 11122233366273},
        {recipient: new web3.PublicKey('wallet-address'), value: 11122233354618},
        {recipient: new web3.PublicKey('wallet-address'), value: 11122233365806},
        {recipient: new web3.PublicKey('wallet-address'), value: 11122233354834},
    ]
    let splTx = await buildSplTokenBatchTransferTx(connection, sender, tokenInfo, splTransfers)
    let splSignature = await web3.sendAndConfirmTransaction(
        connection,
        splTx,
        [sender]
    )

    console.log('SPL_SIGNATURE', splSignature)
}

async function buildSolBatchTransferTx(sender, transfers) {
    let transaction = new web3.Transaction()
    for (let i = 0; i < transfers.length; i++) {
        let transfer = transfers[i]

        transaction = transaction.add(
            web3.SystemProgram.transfer({
                fromPubkey: sender.publicKey,
                toPubkey: transfer.recipient,
                lamports: transfer.value * web3.LAMPORTS_PER_SOL,
            })
        )
    }
    return transaction
}

async function buildSplTokenBatchTransferTx(connection, sender, tokenInfo, transfers) {
    //let token = tokenInfo.token
    let senderTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(connection, sender.publicKey, tokenInfo.address, sender.publicKey)
    let transferedRecipients = {}
    let transaction = new web3.Transaction()
    for (var i = 0; i < transfers.length; i++) {
        let transfer = transfers[i]
        let recipient = transfer.recipient
        //let amount = transfer.value * Math.pow(10, tokenInfo.decimals)
        let amount = transfer.value
        //console.log('AMOUNT', amount)
        //return
        let aTokenAddress = 
            await getAssociatedTokenAddress(connection, recipient, tokenInfo.address) ||
            transferedRecipients[recipient]
        if (aTokenAddress) {
            transaction = transaction.add(
                splToken.createTransferInstruction(
                    senderTokenAccount.address,
                    aTokenAddress,
                    sender.publicKey,
                    amount,
                    [],
                    splToken.TOKEN_PROGRAM_ID
                    /*splToken.TOKEN_PROGRAM_ID,
                    senderTokenAccount.address,
                    aTokenAddress,
                    sender.publicKey,
                    [],
                    amount*/
                ) 
            )
        } else {
            aTokenAddress = await calcAssociatedTokenAddress(recipient, tokenInfo.address)
            transaction = transaction.add(
                splToken.createAssociatedTokenAccountInstruction(
                    sender.publicKey,
                    aTokenAddress,
                    recipient,
                    tokenInfo.address,
                    splToken.TOKEN_PROGRAM_ID,
                    splToken.ASSOCIATED_TOKEN_PROGRAM_ID

                    /*splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                    splToken.TOKEN_PROGRAM_ID,
                    tokenInfo.address,
                    aTokenAddress,
                    recipient,
                    sender.publicKey*/
                ),
                splToken.createTransferInstruction(
                    senderTokenAccount.address,
                    aTokenAddress,
                    sender.publicKey,
                    amount,
                    [],
                    splToken.TOKEN_PROGRAM_ID
                ) 
            )
        }
        await sleep(5000);
        transferedRecipients[recipient] = aTokenAddress
    }

    return transaction
}

// Helpers

async function getTokenInfo(connection, tokenContractAddress) {
    const tokenMint = new web3.PublicKey(tokenContractAddress)
    const token = await splToken.getMint(connection, tokenMint, splToken.TOKEN_PROGRAM_ID)
    return token;
    //const decimals = token.decimals
    //return {token: token, decimals: decimals}
}

async function getAssociatedTokenAddress(connection, address, tokenMint) {
    const result = await connection.getTokenAccountsByOwner(address, {'mint': tokenMint}, {commitment: 'confirmed'})
    if (result.value.length == 0) {
        return null
    }
    return result.value[0].pubkey
}

async function calcAssociatedTokenAddress(address, tokenMint) {
    return (await web3.PublicKey.findProgramAddressSync(
        [
            address.toBuffer(),
            splToken.TOKEN_PROGRAM_ID.toBuffer(),
            tokenMint.toBuffer()
        ],
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0]
}