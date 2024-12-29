// src/express-multer.d.ts

import * as multer from 'multer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      file: multer.StorageEngine;
      files: multer.StorageEngine[];
    }
  }
}
