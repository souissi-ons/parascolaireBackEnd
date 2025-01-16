import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthModule } from './modules/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose'; // Replaced TypeOrmModule with MongooseModule
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthCompositeGuard } from './common/guards/auth-composite.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { UserModule } from './user/user.module';
import { ClassroomModule } from './modules/classroom/classroom.module';
import { RequestClassroomModule } from './request-classroom/request-classroom.module';
import { EventModule } from './modules/event/event.module';
import { RequestEventModule } from './modules/request-event/request-event.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load environment variables
    // Configuration of MongoDB with Mongoose
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UserModule,
    AuthModule,
    ClassroomModule,
    RequestClassroomModule,
    EventModule,
    RequestEventModule, // Pass the MongoDB URI directly
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RolesGuard,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: AuthCompositeGuard,
    },
  ],
})
export class AppModule {}
