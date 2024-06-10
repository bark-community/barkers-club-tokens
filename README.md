# BARK Protocol | 2022 Token & NFT Management System

The BARK Protocol Token & NFT Management System is a TypeScript program designed to manage tokens and non-fungible tokens (NFTs) on the Solana blockchain. It provides functionalities such as creating tokens and NFTs, updating metadata, transferring tokens, and more.

## Features

- **Airdrop Lamports**: Airdrops lamports to the payer account to facilitate transactions on the Solana blockchain.
- **Create Token and NFT**: Creates a new token and NFT on the Solana blockchain. It initializes the mint account, sets up metadata for the token/NFT, and associates the metadata with the mint.
- **Remove Metadata Field**: Removes a specified field from the metadata associated with a mint. This functionality allows for the removal of unwanted or incorrect metadata.
- **Remove Authority**: Removes the authority associated with a mint. This operation revokes the mint authority and prevents further minting of tokens/NFTs.
- **Increment Points**: Increases the value of a specific field in the metadata associated with a mint. This functionality is useful for updating token/NFT attributes such as points or scores.
- **Transfer Tokens/NFTs**: Transfers tokens/NFTs from one account to another. This operation involves creating an associated token account for the recipient and transferring the specified amount of tokens/NFTs.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/bark-community/bark-tokens-management-system
    ```

2. Navigate to the project directory:

    ```bash
    cd bark-tokens-management-system
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

## Usage

1. Update the connection URL in the code to connect to the Solana blockchain network. You can specify the URL of a local network or a public network.

2. Run the TypeScript program:

    ```bash
    npm start
    ```

3. View the output:

    The program will output transaction IDs and URLs to explore transactions on the Solana blockchain. You can use these URLs to verify the execution of the operations.

## Error Handling

The program includes error handling mechanisms to catch and log any errors that occur during execution. If an error occurs, the program will output an error message with details about the error.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## Acknowledgements

- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js Library](https://github.com/solana-labs/solana-web3.js)
