import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsAppController } from './payments-app.controller';
import { PaymentsAppService } from './payments-app.service';

describe('PaymentsAppController', () => {
  let paymentsAppController: PaymentsAppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsAppController],
      providers: [PaymentsAppService],
    }).compile();

    paymentsAppController = app.get<PaymentsAppController>(PaymentsAppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(paymentsAppController.getHello()).toBe('Hello World!');
    });
  });
});
