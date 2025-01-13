//@ts-ignore
import express from 'express';
//@ts-ignore
import cors from 'cors';
//@ts-ignore
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

//@ts-ignore
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
//@ts-ignore
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

try {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
} 