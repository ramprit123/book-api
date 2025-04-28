import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsAppService {
  getHello(): string {
    return 'Hello World!';
  }
}
