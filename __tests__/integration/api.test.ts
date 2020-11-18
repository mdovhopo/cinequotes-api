require('dotenv').config();
import Axios, { AxiosResponse } from 'axios';
import { UtilServiceFactory }   from '../../src/services/util/util.service';
import { firestore }            from '../../src/util/firestore';
import { pubsub }               from '../../src/util/pubsub';

/**
 * Integration tests
 * Before running this tests, make sure Application is up and running
 */

const api = Axios.create({
  baseURL: `http://localhost:80`
});

const compareFn = (a, b) => a.id > b.id ? 1 : -1;

describe('Cinequotes API test', () => {
  let insertedDemoData;
  beforeAll(async cb => {
    const util = UtilServiceFactory(firestore, pubsub);
    await util.createTopic();
    insertedDemoData = await util.insertDemoData();
    cb();
  });

  test('Get Movies', async cb => {
    const { data } = await api.get('/api/v1/movies') as AxiosResponse<Array<any>>;
    expect(data.sort(compareFn)).toStrictEqual(insertedDemoData.movies.sort(compareFn));
    cb();
  });

  test('Get quotes by movie', async cb => {
    const insertedMovie = insertedDemoData.movies[0];
    const quotes        = insertedDemoData.quotes[insertedMovie.id];
    const { data }      = await api.get(`/api/v1/movies/${ insertedMovie.id }/quotes`);

    expect(data.sort(compareFn)).toStrictEqual(quotes.sort(compareFn));
    cb();
  });

  test('Get all available translations for quote', async cb => {
    const insertedMovie             = insertedDemoData.movies[0];
    const quotes                    = insertedDemoData.quotes[insertedMovie.id];
    const { data }                  = await api.get(`/api/v1/movies/${ insertedMovie.id }/quotes?locale=*`);
    const quotesWithAllTranslations = quotes.sort(compareFn).map(quote => ({
      ...quote,
      translations: insertedDemoData.translations[quote.id]
    }));
    expect(data.sort(compareFn)).toStrictEqual(quotesWithAllTranslations);
    cb();
  });

  test('ping service', async cb => {
    const { data } = await api.get('/ping');

    expect(data.pong).toBeTruthy();
    cb();
  });

  test('Create quote to existing movie (quote must be added to existing movie)', async () => {
    const newQuote               = {
      movieTitle: 'Taxi Driver',
      actor:      'Douglas Adams',
      quote:      'I don\'t know. That\'s about the dumbest thing I ever heard.'
    };
    const existingMovie          = insertedDemoData.movies.find(({ title }) => title === newQuote.movieTitle);
    const { data: createdQuote } = await api.post('/api/v1/quotes', newQuote);
    expect(createdQuote.actor).toEqual(newQuote.actor);
    expect(createdQuote.quote).toEqual(newQuote.quote);

    const { data: movieQuotes } = await api.get(`/api/v1/movies/${ existingMovie.id }/quotes`);

    expect(movieQuotes).toHaveLength(2);
    // find new quote in response
    expect(movieQuotes.find(({ actor, quote }) => actor === newQuote.actor && quote === newQuote.quote))
      .toBeTruthy();
  });

  test('Create quote to new movie (new movie must be created)', async cb => {
    const newQuote = {
      'movieTitle': 'The Hitchhiker\'s Guide to the Galaxy',
      'actor':      'Douglas Adams',
      'quote':      'Don\'t Panic.'
    };

    const { data: moviesBeforeInsert } = await api.get('/api/v1/movies');
    const { data: createdQuote }       = await api.post('/api/v1/quotes', newQuote);
    const { data: moviesAfterInsert }  = await api.get('/api/v1/movies');

    const newMovieInOldMovies = moviesBeforeInsert.find(({ title }) => newQuote.movieTitle === title);
    expect(newMovieInOldMovies).toBeFalsy();
    const newMovieInNewMovies = moviesAfterInsert.find(({ title }) => newQuote.movieTitle === title);
    expect(newMovieInNewMovies).toBeTruthy();

    const { data: insertedQuote } = await api.get(`/api/v1/movies/${ newMovieInNewMovies.id }/quotes`);

    expect(insertedQuote).toEqual([{ id: createdQuote.id, actor: newQuote.actor, quote: newQuote.quote }]);
    cb()
  });
});
