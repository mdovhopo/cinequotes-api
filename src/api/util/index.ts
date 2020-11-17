import { Router } from 'express';
import * as UtilController from '../../services/util/controller';

const router = Router();

router.get('/setup-firestore-demo-data', UtilController.setupFirestoreDemoData);
router.get('/create-pubsub-topic', UtilController.setupPubSubTopic);

export default router;
