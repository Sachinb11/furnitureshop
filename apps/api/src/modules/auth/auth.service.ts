import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto, FirebaseAuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepo.save(
      this.userRepo.create({
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        isVerified: true, // Auto-verify in dev
      }),
    );
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokens(user);
  }

  async firebaseLogin(dto: FirebaseAuthDto) {
    // Firebase is optional — if no real config, reject gracefully
    const projectId = this.config.get('FIREBASE_PROJECT_ID');
    if (!projectId || projectId === 'placeholder') {
      throw new UnauthorizedException(
        'Firebase auth is not configured. Use email/password login.',
      );
    }

    let decodedToken: any;
    try {
      const admin = await import('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail: this.config.get('FIREBASE_CLIENT_EMAIL'),
            privateKey: this.config
              .get('FIREBASE_PRIVATE_KEY')
              ?.replace(/\\n/g, '\n'),
          }),
        });
      }
      decodedToken = await admin.auth().verifyIdToken(dto.idToken);
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    let user = await this.userRepo.findOne({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
      const emailUser = await this.userRepo.findOne({
        where: { email: decodedToken.email },
      });
      if (emailUser) {
        emailUser.firebaseUid = decodedToken.uid;
        emailUser.isVerified = decodedToken.email_verified;
        user = await this.userRepo.save(emailUser);
      } else {
        const parts = (decodedToken.name ?? 'User').split(' ');
        user = await this.userRepo.save(
          this.userRepo.create({
            email: decodedToken.email,
            firstName: parts[0] ?? 'User',
            lastName: parts.slice(1).join(' ') || 'User',
            firebaseUid: decodedToken.uid,
            isVerified: decodedToken.email_verified,
            avatarUrl: decodedToken.picture,
          }),
        );
      }
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.userRepo.findOneByOrFail({ id: payload.sub });
      return this.issueTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  // ── Token generation ────────────────────────────────────────────────────
  private issueTokens(user: User) {
    const payload = {
      sub:   user.id,
      email: user.email,
      role:  user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN', '7d'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:    this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id:        user.id,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        role:      user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
