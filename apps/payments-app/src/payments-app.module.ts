import { Module } from '@nestjs/common';
import { PaymentsAppController } from './payments-app.controller';
import { PaymentsAppService } from './payments-app.service';

@Module({
  imports: [],
  controllers: [PaymentsAppController],
  providers: [PaymentsAppService],
})
export class PaymentsAppModule {}
