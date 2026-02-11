require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity, tighten in prod
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Attach socket io to request to use in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/", (req, res) => res.send("Server is up and running!"));

app.use("/api/rates", require("./routes/rates"));
app.use("/api/auth", require("./routes/auth"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
  });
})

// Socket connection logic
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Connect to Database
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
