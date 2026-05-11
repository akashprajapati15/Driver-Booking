const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const axios = require('axios'); 
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app); 

// --- 1. Middleware & CORS Setup ---
// Jab aap deploy karenge, toh frontend URL yahan add kar sakte hain
app.use(cors({
    origin: "*", // Deployment ke waqt isse specific Vercel URL se replace karna behtar hai
    methods: ["GET", "POST"]
}));
app.use(express.json());

// --- 2. Socket.io Configuration ---
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Socket.io Logic
io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // User sends a ride request
    socket.on("send_ride_request", (data) => {
        const requestWithId = { ...data, passengerSocketId: socket.id };
        socket.broadcast.emit("receive_ride_request", requestWithId);
    });

    // Driver accepts the ride
    socket.on("accept_ride", (data) => {
        io.to(data.passengerSocketId).emit("ride_accepted_by_driver", {
            driverName: data.driverName,
            message: "Confirmed! Driver is on the way."
        });
    });

    socket.on("disconnect", () => console.log("Disconnected:", socket.id));
});

// --- 3. AI Chatbot API Route ---
app.post('/api/ai/chat', async (req, res) => {
    const { message } = req.body;
    if (!process.env.HUGGING_FACE_KEY) {
        return res.status(500).json({ reply: "API Key missing." });
    }

    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
            { inputs: message },
            { 
                headers: { 
                    Authorization: `Bearer ${process.env.HUGGING_FACE_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        const aiReply = response.data[0]?.generated_text || "I'm thinking, try again!";
        res.json({ reply: aiReply });
    } catch (err) {
        console.error("AI Error:", err.message);
        res.status(500).json({ reply: "AI is busy right now." });
    }
});

// --- 4. Database & Auth Routes ---
app.use('/api/auth', authRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.error("❌ DB Error:", err.message));

// Root route for health check
app.get('/', (req, res) => {
    res.send("DriverApp Backend is Running Live! 🚀");
});

// --- 5. Server Start ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server active on port ${PORT}`);
});