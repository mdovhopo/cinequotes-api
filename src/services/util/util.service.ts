import { compressMovieName } from '../../util';
import { TOPIC_NAME }        from '../../util/constants';
import { Firestore }         from '@google-cloud/firestore';
import { PubSub }            from '@google-cloud/pubsub';
import data                  from '../../../movies.demo';
import { deleteCollection }  from '../../util/firestore';

/**
 * This methods are added for convenient app setup only. MUST be removed in production use
 */

export const UtilServiceFactory = (
  firestore: Firestore,
  pubsub: PubSub
) => {
  /*
   * Inserts demo data to firestore. Inserting will be done via firestore api
   * directly, so no messages will be published to PubSub.
   */

  type DemoItem = { title: string, quotes: Array<{ actor: string, quote: string, translations: { [key: string]: string } }> }
  const insertDemoData = async () => {
    await deleteCollection(firestore, 'movies');
    let createdMovies: Array<{ id: string, title: string }> = [];

    const addToArr = (obj, id, item) => obj[id] ? obj[id].push(item) : (obj[id] = [ item ]);
    const addToObj = (obj, id, item) => obj[id] = (obj[id] ? ({ ...obj[id], ...item }) : item);

    let createdQuotes       = {};
    let createdTranslations = {};
    for (const { title, quotes } of data as Array<DemoItem>) {
      const docRef = await firestore
        .collection('movies')
        .add({ title, titleHash: compressMovieName(title) });
      createdMovies.push({ id: docRef.id, title });
      for (const { quote, actor, translations } of quotes) {
        const quoteRef = await firestore
          .collection(`movies/${ docRef.id }/quotes`)
          .add({ quote, actor });
        addToArr(createdQuotes, docRef.id, { id: quoteRef.id, quote, actor });
        for (const [ locale, quote ] of Object.entries(translations)) {
          addToObj(createdTranslations, quoteRef.id, { [locale]: quote });
          await firestore
            .collection(`movies/${ docRef.id }/quotes/${ quoteRef.id }/translations`)
            .doc(locale)
            .create({ text: quote });
        }
      }
    }
    return {
      movies: createdMovies,
      quotes: createdQuotes,
      translations: createdTranslations
    };
  };


  /**
   * Creates PubSubTopic
   */

  const createTopic = async () => {
    const topic           = await pubsub.topic(TOPIC_NAME);
    const [ topicExists ] = await topic.exists();
    if (!topicExists) {
      await pubsub.createTopic(TOPIC_NAME);
    }
  };


  return {
    createTopic,
    insertDemoData
  };
};
