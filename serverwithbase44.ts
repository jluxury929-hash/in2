import express from 'express';
import { APIServer } from './server';
import mevRoutes from '../routes/mev';
import logger from '../utils/logger';

export class APIServerWithBase44 extends APIServer {
  constructor() {
    super();
    this.setupBase44Routes();
  }

  private setupBase44Routes(): void {
    const app = (this as any).app as express.Application;
    
    // MEV endpoints
    app.use('/api/mev', mevRoutes);
    
    logger.info('Base44 routes configured');
  }
}

export const apiServerWithBase44 = new APIServerWithBase44();
