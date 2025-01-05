import { Request, Response, NextFunction } from 'express';

// Function to handle async errors
const asyncHandler = (requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch(err => next(err));
  };
};

export default asyncHandler;
