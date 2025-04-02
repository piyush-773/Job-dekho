import './config/instrument.js';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import * as Sentry from '@sentry/node';
import { clerkWebhooks } from './controllers/webhooks.js';
import companyRoutes from './routes/companyRoutes.js';
import connectCloudinary from './config/cloudinary.js';
import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { clerkMiddleware } from '@clerk/express';

// Initialize Express
const app = express();

// Connect to database
connectDB();
await connectCloudinary();

// ✅ Handle Preflight Requests Before Anything Else
app.options('*', cors());

// ✅ Enable CORS for All Requests
app.use(
  cors({
    origin: 'http://localhost:5173', // Allow frontend origin
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // Allow cookies if needed
  })
);

// ✅ Explicitly Handle Preflight Requests (Important for CORS)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Middlewares
app.use(express.json());
app.use(clerkMiddleware());

// ✅ Routes
app.get('/', (req, res) => res.send('API Working'));
app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('My first Sentry error!');
});
app.post('/webhooks', clerkWebhooks);
app.use('/api/company', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 10000;
Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
