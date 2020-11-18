import { credentials } from '@grpc/grpc-js';
import { PubSub }      from '@google-cloud/pubsub';

const [ pubsubHost, pubsubPort ] = process.env.PUBSUB_EMULATOR_HOST.split(':');
const options                    = {
  projectId:   'stub',
  port:        pubsubPort,
  servicePath: pubsubHost,
  sslCreds:    credentials.createInsecure()
};
export const pubsub              = new PubSub(options);
