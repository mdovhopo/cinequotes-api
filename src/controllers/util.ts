import { Request, Response }  from 'express';
import data                   from '../../movies.demo';
import { UtilServiceFactory } from '../services/util/util.service';
import { pubsub }    from '../util/pubsub';
import { firestore } from '../util/firestore';

/**
 * This methods are added for convenient app setup only. MUST be removed in production use
 */

const UtilService = UtilServiceFactory(firestore, pubsub);

export const setupFirestoreDemoData = async (req: Request, res: Response) => {
  try {
    await UtilService.insertDemoData();
    res.send({ message: 'All demo data inserted successfully, You can try API now!' });
  } catch (e) {
    res.status(500).send({
      error: e.message
    });
  }
};

export const setupPubSubTopic = async (req: Request, res: Response) => {
  try {
    await UtilService.createTopic();
    res.send({
      message: `Topic successfully created!`
    });
  } catch (e) {
    res.status(500);
  }
};
