// SmartSort Secure - The Final, Unified Server
// This single server runs the Hedera backend, the WebSocket, AND the Admin Dashboard website.

// --- 1. Installation ---
// > npm install express @hashgraph/sdk dotenv cors ws

const express = require("express");
const cors = require("cors");
const path = require("path"); // Import the path module
const { WebSocketServer } = require('ws');
const { Client, TopicCreateTransaction, TopicMessageSubmitTransaction } = require("@hashgraph/sdk");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// --- NEW: Serve the Admin Website ---
// This tells the server to show the HTML files from the current folder.
app.use(express.static(path.join(__dirname)));

// --- Hedera Client Setup ---
if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    throw new Error("HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in the .env file");
}
const client = Client.forTestnet();
client.setOperator(process.env.HEDERA_ACCOUNT_ID, process.env.HEDERA_PRIVATE_KEY);

const topicId = "0.0.6143759";

// --- HTTP Server and WebSocket Server Setup ---
const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log("======================================================================");
    console.log(`✅ SmartSort Secure Server is running.`);
    console.log(`✅ Open your Admin Dashboard at: http://localhost:${PORT}/admin-login.html`);
    console.log("======================================================================");
});

const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
    console.log('✅ Admin Dashboard connected to WebSocket.');
    ws.on('error', console.error);
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// --- API Endpoint for Logging Recycling ---
app.post("/log-recycling", async (req, res) => {
    const { binId, item, userId } = req.body;
    if (!binId || !item || !userId) return res.status(400).send({ error: "Missing required data" });

    try {
        const message = `Recycle Event: User ${userId} recycled ${item} at Bin ${binId}`;
        const transaction = new TopicMessageSubmitTransaction({ topicId, message });
        const txResponse = await transaction.execute(client);
        await txResponse.getReceipt(client);
        
        console.log(`✅ Logged to Hedera. Transaction: ${txResponse.transactionId.toString()}`);
        console.log(`📢 Broadcasting new recycle event: ${item}`);
        broadcast({ type: 'NEW_RECYCLE_EVENT', item: item });

        res.status(200).send({
            message: "Recycling event logged successfully on Hedera!",
            transactionId: txResponse.transactionId.toString(),
        });

    } catch (error) {
        console.error("Error submitting message:", error);
        res.status(500).send({ error: "Could not submit message to Hedera." });
    }
});