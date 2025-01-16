import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService, // UserService doit être adapté pour MongoDB
    private jwtService: JwtService,
  ) {}

  async validateUser(authDto: AuthDto) {
    const user = await this.userService.findEmail(authDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Comparer le mot de passe fourni avec le mot de passe hashé
    const isPasswordValid = await bcrypt.compare(
      authDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user; // Utilisateur authentifié
  }

  async login(user: any) {
    const payload = { username: user.fullName, sub: user._id, role: user.role }; // Utilisez _id pour MongoDB
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'your secret key',
      }),
    };
  }
}
