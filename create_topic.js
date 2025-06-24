// File: create_topic.js

// This script's only purpose is to create a new Hedera Topic
// and print its ID, so you can add it to your .env file.

require('dotenv').config();
const {
    Client,
    PrivateKey,
    TopicCreateTransaction
} = require("@hashgraph/sdk");

async function main() {
    // Grab your Hedera testnet account ID and private key from the .env file
    const myAccountId = process.env.HEDERA_ACCOUNT_ID;
    const myPrivateKey = process.env.HEDERA_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (myAccountId == null || myPrivateKey == null) {
        throw new Error("Environment variables HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be present in .env file");
    }

    // Create our connection to the Hedera network
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    console.log("Creating a new topic...");

    //Create a new topic
    let txResponse = await new TopicCreateTransaction().execute(client);

    //Get the receipt of the transaction
    let receipt = await txResponse.getReceipt(client);
    
    //Get the topic ID from the receipt
    let newTopicId = receipt.topicId;

    console.log("\nSUCCESS! Your new topic ID is: " + newTopicId);
    console.log("\nCopy this ID and paste it into your .env file as TOPIC_ID");
}

main().catch((error) => {
    console.error("Error creating topic:", error);
    process.exit(1);
});