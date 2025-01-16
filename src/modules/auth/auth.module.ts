import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UserModule } from 'src/user/user.module';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Register User schema
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your secret key',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '1d' },
    }),
  ],
})
export class AuthModule {}
