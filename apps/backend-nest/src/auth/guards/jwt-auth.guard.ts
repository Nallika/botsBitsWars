import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard that enforces JWT auth via Passport strategy.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
