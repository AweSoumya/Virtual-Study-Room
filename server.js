const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const classroomRoutes = require('./routes/classrooms');
const User = require('./models/User'); // Import User model
const Classroom = require('./models/Classroom'); // Import Classroom model

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classrooms', classroomRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New socket connection...');

  socket.on('joinClassroom', async (classroomId) => {
    socket.join(classroomId);
    console.log(`User joined classroom ${classroomId}`);

    // Optionally fetch classroom details and emit to the user
    const classroom = await Classroom.findById(classroomId).populate('students teacher');
    socket.emit('classroomDetails', classroom);
  });

  socket.on('sendMessage', ({ classroomId, message }) => {
    io.to(classroomId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
