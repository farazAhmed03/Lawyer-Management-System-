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

// Custom imports
const dbConnect = require('./Config/database');
const socketHandler = require('./Sockets/SocketHandler');

// Route imports
const errorHandler = require('./Middleware/errorHandler');
const authRoutes = require('./Routers/AuthRoutes');
const appointmentRoutes = require('./Routers/AppointmentRoute');
const caseRoutes = require('./Routers/CaseRoute');
const chatRoutes = require('./Routers/ChatRoute');
const ratingAndReviewRoutes = require('./Routers/RatingAndReviewRoute');
const userRoutes = require('./Routers/AllUsersRoutes');
const stateRoutes = require('./Routers/StateRoute');

// Initialize express and server
const app = express();
const server = http.createServer(app);

// ==== CORS Configuration ====
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://lawyer-management-system-frontend.vercel.app"
];


app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// ==== Middleware ====
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));
app.use(fileUpload());



// ==== Serve Static Files ====
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ==== Initialize Socket.io ====
const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Attach io to app and req
app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ==== API Routes ====
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/appointment', appointmentRoutes);
app.use('/api/v1/case', caseRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/rating-and-review', ratingAndReviewRoutes);
app.use('/api/v1/stats', stateRoutes);
app.use('/api/v1/users', userRoutes);

// ==== Default Route ====
app.get('/', (req, res) => {
  res.send('Lawyer Management Backend is Live');
});

// ==== Error Handler ====
app.use(errorHandler);

// ==== Start Server ====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  dbConnect(); 
  socketHandler(io); 
});
