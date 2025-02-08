const express = require('express');
require('dotenv').config();
const http = require('http');  // Import HTTP module
const { Server } = require('socket.io');  // Import Socket.IO
const authRoute = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const morgan = require('morgan');
const cors = require('cors');
const { connectDB } = require('./config/database');
const eventModel = require('./models/eventModel');

const app = express();
const server = http.createServer(app);  // Create HTTP server instance
const io = new Server(server, {
    cors: {
        origin: "*", // Allow frontend connection
        methods: ["GET", "POST"],
    },
});

connectDB();
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));

// API Routes
app.use('/api/auth', authRoute);
app.use('/api/e', eventRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).send({
        success: false,
        statusCode,
        message,
    });
});

// 🔹 WebSocket Connection Handling
io.on("connection", (socket) => { 
    socket.on("join_event", async ({ eventId, userId }) => {
        try {
            const event = await eventModel.findByIdAndUpdate(
                eventId,
                { $addToSet: { attendees: userId } }, // Prevent duplicates
                { new: true }
            );

            // Emit updated attendee count to all connected clients
            io.emit("update_attendees", {
                eventId: event._id,
                attendeesCount: event.attendees.length,
            });
        } catch (error) {
            console.error("Error updating event:", error);
        }
    });

    // When an attendee leaves an event
    socket.on("leave_event", async ({ eventId, userId }) => {
        try {
            const event = await eventModel.findByIdAndUpdate(
                eventId,
                { $pull: { attendees: userId } },
                { new: true }
            );

            io.emit("update_attendees", {
                eventId: event._id,
                attendeesCount: event.attendees.length,
            });
        } catch (error) {
            console.error("Error updating event:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Start the Server
server.listen(process.env.PORT, () => {
    console.log(`Server is live on ${process.env.PORT}`);
});
