import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';

const app = express();

// @ts-ignore
app.use(cors());
// @ts-ignore
app.use(express.json());
// @ts-ignore
app.use(cookieParser());

// @ts-ignore
app.use('/api', routes);

export default app;
