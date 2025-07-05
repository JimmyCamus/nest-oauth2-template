import { Params } from 'nestjs-pino';

export const pinoConfig: Params = {
  pinoHttp: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
        translateTime: 'HH:MM:ss',
      },
    },
  },
};
