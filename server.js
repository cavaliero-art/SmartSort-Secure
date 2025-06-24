// SmartSort Secure - Backend Server (FINAL, SMARTER PROMPT)
require('dotenv').config();

// --- 1. VERIFY ENVIRONMENT VARIABLES ---
const { ACCOUNT_ID, PRIVATE_KEY, TOPIC_ID, GEMINI_API_KEY } = process.env;

if (!ACCOUNT_ID || !PRIVATE_KEY || !TOPIC_ID || !GEMINI_API_KEY) {
    console.error("FATAL ERROR: One or more required variables are missing from your .env file.");
    console.error("Please ensure ACCOUNT_ID, PRIVATE_KEY, TOPIC_ID, and GEMINI_API_KEY are all set.");
    process.exit(1);
}

// --- 2. IMPORTS & INITIAL SETUP ---
const express = require('express');
const http = require('http');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { Client, PrivateKey, TopicMessageSubmitTransaction } = require("@hashgraph/sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// --- 3. HEDERA & GEMINI CLIENT CONFIGURATION ---
const client = Client.forTestnet();
client.setOperator(ACCOUNT_ID, PrivateKey.fromString(PRIVATE_KEY));

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiVisionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- 4. WEBSOCKET LOGIC ---
const clients = new Set();
wss.on('connection', (ws) => {
    console.log('Dashboard client connected');
    clients.add(ws);
    ws.on('close', () => { clients.delete(ws); console.log('Dashboard client disconnected'); });
    ws.on('error', (error) => console.error('WebSocket error:', error));
});

function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === 1) client.send(message);
    });
}

// --- 5. API ENDPOINTS ---
app.post('/identify-item-with-gemini', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: "No image provided." });

        const imagePart = { inlineData: { data: image.replace(/^data:image\/\w+;base64,/, ""), mimeType: "image/jpeg" } };
        
        // ******************************************************
        // ***** CHANGE 1: THE NEW, SMARTER PROMPT **************
        const prompt = "Briefly identify the main object and its primary material in the image. For example: 'plastic bottle', 'metal can', 'glass jar', 'paper cup'.";
        // ******************************************************

        const result = await geminiVisionModel.generateContent([prompt, imagePart]);
        const response = await result.response;
        const fullResponseText = response.text().trim().toLowerCase();

        console.log(`Gemini Vision identified: "${fullResponseText}"`);

        // ******************************************************
        // ***** CHANGE 2: NEW LOGIC TO READ THE RESPONSE *******
        let detectedMaterial = 'other'; // Default to 'other'
        // We now also recognize 'metal' as a recyclable material
        const recyclableMaterials = ['plastic', 'glass', 'paper', 'metal']; 

        for (const material of recyclableMaterials) {
            if (fullResponseText.includes(material)) {
                detectedMaterial = material; // Found a keyword
                break; // Stop after the first match
            }
        }
        // ******************************************************

        if (recyclableMaterials.includes(detectedMaterial)) {
            await logToHedera(`SINGLE ITEM - Item: ${detectedMaterial} - User: user-website-demo`);
            broadcast({ type: 'NEW_RECYCLE_EVENT', item: detectedMaterial });
        }

        // Send the detected material back to the website
        res.status(200).json({ item: detectedMaterial });

    } catch (error) {
        console.error("Error in /identify-item-with-gemini:", error);
        res.status(500).json({ error: "Failed to identify item with Gemini." });
    }
});

app.post('/log-batch', async (req, res) => {
    try {
        const { binId, items, userId } = req.body;
        if (!binId || !items || !userId) return res.status(400).json({ status: "error", message: "Missing binId, items, or userId" });

        const itemsString = Object.entries(items).map(([key, value]) => `${key}:${value}`).join(',');
        const message = `BATCH DEPOSIT - BinID: ${binId} - User: ${userId} - Items: ${itemsString}`;
        
        const hederaResponse = await logToHedera(message);

        Object.entries(items).forEach(([item, count]) => {
            for (let i = 0; i < count; i++) {
                broadcast({ type: 'NEW_RECYCLE_EVENT', item: item });
            }
        });
        
        res.status(200).json({ status: "success", hedera_status: hederaResponse });
    } catch (error) {
        console.error("Error in /log-batch:", error);
        res.status(500).json({ status: "error", message: "Failed to log batch to Hedera." });
    }
});

// --- 6. HELPER FUNCTION FOR HEDERA ---
async function logToHedera(message) {
    console.log(`Submitting to Hedera Topic (${TOPIC_ID}): "${message}"`);
    const sendResponse = await new TopicMessageSubmitTransaction({ topicId: TOPIC_ID, message }).execute(client);
    const receipt = await sendResponse.getReceipt(client);
    console.log("Hedera transaction status: " + receipt.status.toString());
    return receipt.status.toString();
}

// --- 7. START THE SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`SmartSort Secure server running on port ${PORT}`);
    console.log(`Using Hedera Topic ID: ${TOPIC_ID}`);
});