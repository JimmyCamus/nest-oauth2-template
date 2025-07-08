import { Injectable } from '@nestjs/common';
import * as process from 'process';

@Injectable()
export class AppService {
  healthCheck() {
    const uptime = process.uptime();

    return {
      status: 'ok',
      uptime: `${Math.floor(uptime)}s`,
    };
  }
}
