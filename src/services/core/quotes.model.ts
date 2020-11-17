import { firestore, pubsub }      from '../../../server';
import { createIfNotExistsMovie } from './movies.model';
import { TOPIC_NAME }             from '../../utils/constants';

export type Quote = {
  id: string;
  quote: string;
  actor: string;
  translations?: QuoteTranslations;
}

export const Languages = [ 'FR', 'EN' ] as const;
export type Locale = typeof Languages[number];

export type QuoteTranslations = {
  [key in Locale]: string;
}

// if no locale specified, key will be added with all available translations.
export const getQuotesByMovieId = async (movieId: string, locale: Locale | '*' = '*'): Promise<Array<Quote>> => {
  const collection = await firestore.collection(`movies/${ movieId }/quotes`).get();

  // if default locale, or this locale is not supported, just return quotes with default language
  if (locale === 'EN' || (locale !== '*' && !Languages.includes(locale.toUpperCase() as Locale))) {
    return collection.docs.map(quoteRef => ({ id: quoteRef.id, ...quoteRef.data() }) as Quote);
  }

  // Find translation for all quotes
  return Promise.all(collection.docs.map(async quoteRef => {
    const quote = {
      id:    quoteRef.id,
      actor: quoteRef.data().actor
    };

    // If it is known locale, fetch translation by locale name
    if (Languages.includes(locale as Locale)) {
      const localeDocRef = await firestore
        .collection(`movies/${ movieId }/quotes/${ quoteRef.id }/translations`)
        .doc(locale).get();

      const localeData = localeDocRef.data();
      return {
        ...quote,
        quote: localeData ? localeData.text : quoteRef.data().quote
      };
    }

    // In other cases (*) add all translations
    const translations = await firestore.collection(`movies/${ movieId }/quotes/${ quoteRef.id }/translations`).get();
    return {
      id:           quoteRef.id,
      ...quoteRef.data(),
      translations: translations.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().text;
        return acc;
      }, {})
    } as Quote;
  }));

};

export const addQuoteToMovie = async (movieTitle: string, quote: string, actor: string): Promise<Quote> => {
  const movie = await createIfNotExistsMovie(movieTitle);

  const docRef = await firestore
    .collection(`movies/${ movie.id }/quotes`)
    .add({ quote, actor });

  // publish quote to translate to topic
  pubsub
    .topic(TOPIC_NAME)
    .publishJSON({
      quote:   quote,
      quoteId: docRef.id,
      movieId: movie.id
    })
    .catch(err => {
      // log that event could not be published
      console.log('quote.translate message publish error: ', err);
    });

  return {
    id: docRef.id,
    quote, actor
  };
};
