import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, FirebaseAuthDto, RefreshTokenDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register') @ApiOperation({ summary: 'Register' })
  register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

  @Post('login') @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Login' })
  login(@Body() dto: LoginDto) { return this.authService.login(dto); }

  @Post('firebase') @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Firebase login' })
  firebase(@Body() dto: FirebaseAuthDto) { return this.authService.firebaseLogin(dto); }

  @Post('refresh') @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token' })
  refresh(@Body() dto: RefreshTokenDto) { return this.authService.refresh(dto.refreshToken); }
}
