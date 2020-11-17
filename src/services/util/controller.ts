import { Request, Response } from 'express';
import { firestore, pubsub } from '../../../server';
import { compressMovieName } from '../../utils';
import data                  from './movies';
import { TOPIC_NAME }        from '../../utils/constants';

/**
 * This method is added for convenient app setup only. MUST be removed in production use
 * Inserts demo data to firestore. Inserting will be done via firestore api
 * directly, so no messages will be published to PubSub.
 * @param req
 * @param res
 */

export const setupFirestoreDemoData = async (req: Request, res: Response) => {
  try {
    for (const { title, quotes } of data) {
      const docRef = await firestore
        .collection('movies')
        .add({ title, titleHash: compressMovieName(title) });
      for (const { quote, actor, translations } of quotes) {
        const quoteRef = await firestore
          .collection(`movies/${ docRef.id }/quotes`)
          .add({ quote, actor });
        for (const [ locale, quote ] of Object.entries(translations)) {
          await firestore
            .collection(`movies/${ docRef.id }/quotes/${ quoteRef.id }/translations`)
            .doc(locale)
            .create({ text: quote });
        }
      }
    }
    res.send({ message: 'All demo data inserted successfully, You can try API now!' });
  } catch (e) {
    res.status(500).send({
      error: e.message
    });
  }
};

/**
 * This method is added for convenient app setup only. MUST be removed in production use
 * Creates PubSubTopic
 * @param req
 * @param res
 */

export const setupPubSubTopic = async (req: Request, res: Response) => {
  try {
    const topic = await  pubsub.topic(TOPIC_NAME);
    const [topicExists] = await topic.exists();
    if (!topicExists) {
      await pubsub.createTopic(TOPIC_NAME);
      return res.send({
        message: `Topic successfully created!`
      })
    }
    res.send({
      message: `Topic Already exists!`
    });
  } catch (e) {
    res.status(500);
  }
};
