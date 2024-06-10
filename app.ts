import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    PublicKey,
} from '@solana/web3.js';
import {
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    createAssociatedTokenAccountId,
    AuthorityType,
    createInitializeMetadataInstruction,
    createSetAuthorityInstruction,
    createUpdateMetadataInstruction,
    getMint,
    getMetadata,
} from '@solana/spl-token';
import { TokenMetadata } from '@solana/spl-token-metadata';

const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

const payer = Keypair.generate();
const authority = Keypair.generate();
const mintKeypair = Keypair.generate();
const mint = mintKeypair.publicKey;

const tokenMetadata: TokenMetadata = {
    updateAuthority: authority.publicKey,
    mint: mint,
    name: 'BARKER',
    symbol: 'BARKER',
    uri: "https://raw.githubusercontent.com/bark-community/barker-token/main/src/assets/barkers-club.png",
    additionalMetadata: [["Background", "black"], ["Points", "500"]],
};

const decimals = 0;

async function generateExplorerUrl(identifier: string, isAddress: boolean = false): Promise<string> {
    if (!identifier) return '';
    const baseUrl = 'https://solana.fm';
    const localSuffix = '?cluster=localnet-solana';
    const slug = isAddress ? 'address' : 'tx';
    return `${baseUrl}/${slug}/${identifier}${localSuffix}`;
}

async function airdropLamports(): Promise<void> {
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);
}

async function createTokenAndMint(): Promise<[string, string]> {
    const mintAccount = Keypair.generate();
    const mintLen = 82; // Assuming fixed length for mint account
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const createMintTx = SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintAccount.publicKey,
        space: mintLen,
        lamports: mintLamports,
        programId: TOKEN_2022_PROGRAM_ID,
    });

    const createMintMetaTx = createInitializeMetadataInstruction(
        mintAccount.publicKey,
        authority.publicKey,
        mintAccount.publicKey,
        tokenMetadata,
        TOKEN_2022_PROGRAM_ID,
    );

    const createMintInstr = createInitializeMintInstruction(
        mintAccount.publicKey,
        decimals,
        authority.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID,
    );

    const transaction = new Transaction().add(createMintTx, createMintMetaTx, createMintInstr);

    const [initSig, mintSig] = await sendAndConfirmTransaction(connection, transaction, [payer, mintAccount]);

    return [initSig, mintSig];
}

async function removeMetadataField(): Promise<string> {
    const transaction = new Transaction().add(
        createSetAuthorityInstruction(
            mint,
            authority.publicKey,
            null,
            AuthorityType.MintTokens,
            [],
            TOKEN_2022_PROGRAM_ID
        )
    );

    return await sendAndConfirmTransaction(connection, transaction, [payer, authority]);
}

async function removeTokenAuthority(): Promise<string> {
    const transaction = new Transaction().add(
        createSetAuthorityInstruction(
            mint,
            authority.publicKey,
            null,
            AuthorityType.MintTokens,
            [],
            TOKEN_2022_PROGRAM_ID
        )
    );

    return await sendAndConfirmTransaction(connection, transaction, [payer, authority]);
}

async function incrementPoints(pointsToAdd: number = 1): Promise<string> {
    const mintInfo = await getMint(
        connection,
        mint,
        "confirmed",
        TOKEN_2022_PROGRAM_ID,
    );

    const metadataAddress = mintInfo?.metadata;

    if (!metadataAddress) {
        throw new Error('No metadata found');
    }

    const metadata = await getMetadata(
        connection,
        metadataAddress,
    );

    if (!metadata) {
        throw new Error('No metadata found');
    }

    const [_, currentPoints] = metadata.additionalMetadata.find(([key, _]) => key === 'Points') ?? [];
    let pointsAsNumber = parseInt(currentPoints ?? '0');
    pointsAsNumber += pointsToAdd;

    const transaction = new Transaction().add(
        createUpdateMetadataInstruction(
            metadataAddress,
            authority.publicKey,
            { Points: pointsAsNumber.toString() },
            TOKEN_2022_PROGRAM_ID,
        ),
    );

    return await sendAndConfirmTransaction(connection, transaction, [payer, authority]);
}

async function transferTokens(): Promise<string> {
    const recipient = Keypair.generate();
    const associatedTokenAddress = await createAssociatedTokenAccountId(
        payer.publicKey,
        mint,
    );

    const transaction = new Transaction().add(
        createAssociatedTokenAccountId(
            payer.publicKey,
            recipient.publicKey,
            mint,
        ),
        Token.createTransferCheckedInstruction(
            TOKEN_2022_PROGRAM_ID,
            associatedTokenAddress,
            recipient.publicKey,
            payer.publicKey,
            [],
            1, // Amount of tokens to transfer
            decimals,
        ),
    );

    return await sendAndConfirmTransaction(connection, transaction, [payer]);
}

async function main(): Promise<void> {
    try {
        // Airdrop lamports to payer account
        await airdropLamports();
        
        // 1. Create Token and Mint
        const [initSig, mintSig] = await createTokenAndMint();
        console.log(`Token created and minted:`);
        console.log(`   ${await generateExplorerUrl(initSig)}`);
        console.log(`   ${await generateExplorerUrl(mintSig)}`);

        // 2. Remove Metadata Field
        const cleanMetaTxId = await removeMetadataField();
        console.log(`Metadata field removed:`);
        console.log(`   ${await generateExplorerUrl(cleanMetaTxId)}`);

        // 3. Remove Authority
        const removeAuthTxId = await removeTokenAuthority();
        console.log(`Authority removed:`);
        console.log(`   ${await generateExplorerUrl(removeAuthTxId)}`);

        // 4. Increment Points
        const incrementPointsTxId = await incrementPoints(10);
        console.log(`Points incremented:`);
        console.log(`   ${await generateExplorerUrl(incrementPointsTxId)}`);

        // 5. Transfer Tokens
        const transferTxId = await transferTokens();
        console.log(`Tokens transferred:`);
        console.log(`   ${await generateExplorerUrl(transferTxId)}`);
        
    } catch (error) {
        console.error('An error occurred:', error);
    }
}