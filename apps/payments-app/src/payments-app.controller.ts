import { Controller, Get } from '@nestjs/common';
import { PaymentsAppService } from './payments-app.service';

@Controller()
export class PaymentsAppController {
  constructor(private readonly paymentsAppService: PaymentsAppService) {}

  @Get()
  getHello(): string {
    return this.paymentsAppService.getHello();
  }
}
