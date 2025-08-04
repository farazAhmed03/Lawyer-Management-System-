const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');

// Load environment variables
dotenv.config();

// Custom Imports
// const dbConnect = require('./Config/database');
const dbConnect = require('./Config/database');
const socketHandler = require('./Sockets/SocketHandler');

// Routes and Middleware
const errorHandler = require('./Middleware/errorHandler');
const authRoutes = require('./Routers/AuthRoutes');
const appointmentRoutes = require('./Routers/AppointmentRoute');
const caseRoutes = require('./Routers/CaseRoute');
const chatRoutes = require('./Routers/ChatRoute');
const ratingAndReviewRoutes = require('./Routers/RatingAndReviewRoute');
const userRoutes = require('./Routers/AllUsersRoutes');
const stateRoutes = require('./Routers/StateRoute');
const { generalLimiter } = require('./Utils/RateLimit');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: [
    "http://localhost:3000", 
    "https://lawyer-management-system-frontend.vercel.app"
  ],
    credentials: true
  }
});


// Attach io instance to req
app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://lawyer-management-system-frontend.vercel.app"
  ],
  credentials: true
}))
app.use(helmet());
app.use(morgan('dev'));
// app.use(generalLimiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/appointment', appointmentRoutes);
app.use('/api/v1/case', caseRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/rating-and-review', ratingAndReviewRoutes);
app.use('/api/v1/stats', stateRoutes);
app.use('/api/v1/users', userRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Error Handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
});

// Socket Handler
socketHandler(io);

// Optional: Log each socket connection
io.on('connection', (socket) => {
  console.log(' User connected:', socket.id);
});
