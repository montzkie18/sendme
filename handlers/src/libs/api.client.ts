import { Provider } from '@nestjs/common';
import axios, { Axios } from 'axios';
import axiosRetry from 'axios-retry';

export const apiClientProvider: Provider<Axios> = {
  provide: 'API_CLIENT',
  useFactory: () => {
    const client = axios.create({});
    axiosRetry(client, {
      retries: 3,
    });
    return client;
  },
};
