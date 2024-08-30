import { SSTConfig } from 'sst';
import { API } from './stacks/index';
import { Storage } from './stacks/storage';

export default {
  config(_input) {
    return {
      name: 'Axependiture',
      region: 'ap-southeast-1',
    };
  },
  stacks(app) {
    app.stack(Storage).stack(API);
  },
} satisfies SSTConfig;
