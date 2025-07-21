const functions = require('firebase-functions');
const next = require('next');
import { Request, Response } from 'express';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: { distDir: '.next' } });
const handle = app.getRequestHandler();

exports.nextServer = functions.https.onRequest((req: Request, res: Response) => {
  return app.prepare().then(() => handle(req, res));
});