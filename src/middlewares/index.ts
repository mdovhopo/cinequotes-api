import { NextFunction, Request, Response } from 'express';

/**
 * Caught global error
 * 4-th argument need to be in callback declaration, just to match overload of app.use().
 */

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log('global error', err);
  res
    .status(500)
    .send({ error: `Uncaught global error: ${ err.message }` });
};

/**
 * Handle 404
 */

export const notFoundMiddleware = (req, res) => res.status(404).send({
  error: `${ req._parsedUrl.pathname } with method ${ req.method } Not found!`
});
