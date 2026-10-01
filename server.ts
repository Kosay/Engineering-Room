import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiRouter } from './server/ai-router';
import { epistemicRouter } from './server/epistemic-router';
import { decisionRouter } from './server/decision-router';
import { experimentRouter } from './server/experiment-router';
import { investigationRouter } from './server/investigation-router';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use('/api/ai', aiRouter);
app.use('/api/epistemic', epistemicRouter);
app.use('/api/decisions', decisionRouter);
app.use('/api/experiments', experimentRouter);
app.use('/api/investigations', investigationRouter);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
