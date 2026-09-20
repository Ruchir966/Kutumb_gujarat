import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { adminRouter } from './routes/admin';
import { eligibilityRouter } from './routes/eligibility';
import { familyRouter } from './routes/family';
import { verificationRouter } from './routes/verification';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// --- Middleware ---------------------------------------------------------------

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// --- Health Check -------------------------------------------------------------

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'kutumba-gujarat-backend',
    timestamp: new Date().toISOString(),
  });
});

// --- Routes -------------------------------------------------------------------

app.use('/api/admin', adminRouter);
app.use('/api/eligibility', eligibilityRouter);
app.use('/api/family', familyRouter);
app.use('/api/verify', verificationRouter);

// --- 404 Handler -------------------------------------------------------------

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

// --- Global Error Handler -----------------------------------------------------

app.use(errorHandler);

// --- Start Server -------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`
+----------------------------------------------+
¦   Kutumba Gujarat Backend API                ¦
¦   Running on http://localhost:${PORT}           ¦
¦----------------------------------------------¦
¦  GET  /health                                ¦
¦  POST /api/admin/schemes                     ¦
¦  GET  /api/admin/metrics                     ¦
¦  GET  /api/eligibility/evaluate/:family_id   ¦
¦  POST /api/family/split                      ¦
¦  POST /api/verify/send-otp                   ¦
¦  POST /api/verify/confirm-otp                ¦
+----------------------------------------------+
  `);
});
