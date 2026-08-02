import 'dotenv/config';

import cors from 'cors';
import express from 'express';

import { connectDB } from './config/db.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' });
});

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

startServer();

export default app;
