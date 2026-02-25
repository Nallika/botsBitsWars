import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import type { LoginResponse, RegisterResponse } from '@repo/shared-types';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// REST endpoints for auth flows (register/login).
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Create user and return minimal profile.
  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<RegisterResponse> {
    try {
      await this.authService.register({ email: body.email, password: body.password }, res);
      return { email: body.email };
    } catch (error) {
      throw new HttpException(
        (error as Error).message || 'Registration failed. Please try again.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Login user and set auth cookie.
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponse> {
    try {
      await this.authService.login(body.email, body.password, res);
      return { email: body.email };
    } catch (error) {
      throw new HttpException(
        (error as Error).message || 'Login failed. Please check your credentials.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Verify auth cookie and return minimal user info.
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(): Promise<{ authenticated: boolean }> {
    return { authenticated: true };
  }

  // Clear auth cookie and return a simple status message.
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    try {
      this.authService.clearCookie(res);
      return { message: 'Logout successful' };
    } catch (error) {
      throw new HttpException(
        (error as Error).message || 'Logout failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
