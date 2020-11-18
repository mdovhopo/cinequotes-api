import { Request, Response }                    from 'express';
import {MovieModelFactory}                      from '../services/core/movies.model';
import { QuoteModelFactory, Languages, Locale } from '../services/core/quotes.model';
import { firestore }                            from '../util/firestore';
import { pubsub }                               from '../util/pubsub';

const MovieModel = MovieModelFactory(firestore);
const QuoteModel = QuoteModelFactory(firestore, pubsub, MovieModel);

export const getMovies = async (req: Request, res: Response) => {
  try {
    res.send(await MovieModel.getMovies());
  } catch (e) {
    res.status(500).send({
      error: e.message
    });
  }
};

export const getQuotesByMovieId = async (req: Request, res: Response) => {
  const { id }     = req.params;
  const { locale } = req.query;

  if (!id) {
    return res.status(400).send({
      error: 'Request parameter `movieId` is required!'
    });
  }

  if (locale && locale !== '*' && !Languages.includes(locale.toUpperCase())) {
    return res.status(400).send({
      error: `If locale query parameter specified, it must be one of supported locales: [${ Languages }] or * for all.`
    });
  }


  const [ userLocale ] = (locale || req.header('Accept-Language') || 'EN').split(',');
  const [ userLanguage = '' ] = userLocale.split('-');

  try {
    res.send(await QuoteModel.getQuotesByMovieId(
      id,
      userLanguage.toUpperCase() as Locale | '*'
    ));
  } catch (e) {
    res.status(500).send({
      error: e.message
    });
  }
};

export const createQuote = async (req: Request, res: Response) => {
  const { movieTitle, actor, quote } = req.body;
  if (!movieTitle) return res.send({ error: 'movieTitle is required!' });
  if (!actor) return res.send({ error: 'actor is required!' });
  if (!quote) return res.send({ error: 'quote is required!' });

  try {
    res.send(await QuoteModel.addQuoteToMovie(movieTitle, quote, actor));
  } catch (e) {
    res.status(500).send({
      error: e.message
    });
  }
};
