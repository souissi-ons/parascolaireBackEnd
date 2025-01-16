import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurer CORS pour la production
  app.enableCors({
    origin: '*', // Remplacez par l'URL de votre frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Méthodes autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
    credentials: true, // Autoriser les cookies
  });

  await app.listen(3000);
}
bootstrap();
