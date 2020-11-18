import { Router }          from 'express';
import * as CoreController from '../../controllers';

const router = Router();

router.get('/movies', CoreController.getMovies);

router.get('/movies/:id/quotes', CoreController.getQuotesByMovieId);

router.post('/quotes', CoreController.createQuote);

export default router;
