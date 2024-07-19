import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseTask {
  constructor() {}

  abstract execute(...args: any[]): Promise<any>;
}
