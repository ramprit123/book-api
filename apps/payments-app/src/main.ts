import { NestFactory } from '@nestjs/core';
import { PaymentsAppModule } from './payments-app.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsAppModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
