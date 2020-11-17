import express                                 from 'express';
import { Firestore }                           from '@google-cloud/firestore';
import { PubSub }                              from '@google-cloud/pubsub';
import { credentials }                         from '@grpc/grpc-js';
import bodyParser                              from 'body-parser';
import { errorMiddleware, notFoundMiddleware } from './src/middlewares';
import handlePing                              from './src/services/ping';
import V1Router                                from './src/api/v1';
import UtilRouter                              from './src/api/util';
// load dotenv only in dev mode
if (process.env.NODE_ENV === 'develop') {
  require('dotenv').config();
}

const app = express();

// host set by FIRESTORE_EMULATOR_HOST env variable
export const firestore           = new Firestore({ projectId: 'dummy' });
const [ pubsubHost, pubsubPort ] = process.env.PUBSUB_EMULATOR_HOST.split(':');
const options                    = {
  projectId:   'stub',
  port:        pubsubPort,
  servicePath: pubsubHost,
  sslCreds:    credentials.createInsecure()
};
export const pubsub              = new PubSub(options);

app.use(bodyParser.json());
app.use(bodyParser.text());
// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/v1', V1Router);
app.use('/api/util', UtilRouter);
app.get('/ping', handlePing);

// 500 handler
app.use(errorMiddleware);
// 404 handler after all routes and middleware
app.use(notFoundMiddleware);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('cinequotes api service started!', server.address());
});
