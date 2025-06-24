♻️ SmartSort Secure
SmartSort Secure is a full-stack web application designed to revolutionize waste management in Tunisia by creating a transparent, engaging, and profitable circular economy. This project combines AI-powered waste identification, a gamified citizen rewards platform, and a Hedera-backed backend to ensure every recycling action is verifiable and valuable.

It was built as a comprehensive solution to real-world environmental and economic challenges, providing distinct portals for citizens, corporate partners, and municipal administrators.

Project Overview
At its core, SmartSort Secure tackles the problem of inefficient and untrustworthy recycling systems. By integrating cutting-edge technology, we've created an ecosystem where:

Citizens are empowered and incentivized to recycle correctly.

Corporations can verifiably meet their ESG (Environmental, Social, and Governance) goals.

Municipalities gain powerful tools to manage city services efficiently and generate new revenue streams.

Our latest feature, the "Is It Recyclable? AI Check", provides immediate value to users by allowing them to upload a photo of any item and get an instant, AI-powered verdict on its recyclability, removing the guesswork from their daily lives.

Features
AI-Powered Waste Identification: Real-time analysis of waste items using the Google Gemini API.

"Is It Recyclable?" AI Checker: A dedicated utility for citizens to upload a photo and get an instant AI-powered verdict on an item's recyclability.

Gamified Citizen Rewards Platform: A full-featured web portal where users earn points for recycling, which can be redeemed for real-world rewards with local partners.

SmartSort @Home: An innovative "virtual bag" feature that allows users to scan items at home for convenient batch disposal.

Verifiable Carbon Credit Marketplace: A corporate portal where businesses can purchase carbon credits backed by immutable recycling data on the Hedera network.

Comprehensive Admin Dashboard: A full suite of admin tools for real-time monitoring, a live map of bin statuses, and generating auditable reports on waste management efficiency.

Secure & Transparent Logging: All recycling activities are logged as transactions on the Hedera Consensus Service for ultimate trust and auditability.

Tech Stack
Frontend: HTML5, Tailwind CSS, JavaScript, Leaflet.js, Chart.js

Backend: Node.js, Express.js, WebSocket (ws)

AI Integration: Google Gemini API

Blockchain: Hedera Hashgraph (via @hashgraph/sdk)

Key Project Files
server.js: The core backend server that handles API requests, WebSocket connections, and Hedera transactions.

index.html: The main landing page for the citizen portal.

recyclability-check.html: The new page with the AI checker for item recyclability.

batch.html: The "SmartSort @Home" feature for batch scanning.

corporate.html: The portal for businesses to purchase carbon credits and view their impact.

admin-dashboard.html: The main dashboard for municipal administrators.

Getting Started
Prerequisites
Node.js (v14+)

npm

A .env file in the root directory with the following keys:

HEDERA_ACCOUNT_ID

HEDERA_PRIVATE_KEY

GEMINI_API_KEY

Installation & Setup
Clone the repository:

git clone https://github.com/cavaliero-art/Hackathon.git
cd Hackathon

Install dependencies:

npm install

Create and configure your .env file with your credentials from the Hedera and Google AI platforms.

Run the application:

node server.js

The server will start, and you can access the citizen portal at index.html and the admin portal via login.html.

Acknowledgements
Hedera Hashgraph for providing the secure, enterprise-grade DLT for our backend.

Google for the powerful and accessible Gemini AI model.

The hackathon judges and organizers for their invaluable feedback and support throughout this project.
