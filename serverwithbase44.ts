});

    // MEV endpoints
    this.app.use('/api/mev', mevRoutes);

    // Get strategies
    this.app.get('/api/strategies', (req: Request, res: Response) => {
