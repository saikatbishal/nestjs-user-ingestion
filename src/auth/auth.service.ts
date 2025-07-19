import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcryptjs";
import { User } from "../users/user.entity";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { v4 as uuidv4 } from "uuid";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException("Email already registered");
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      ...dto,
      password: hashed,
    });
    return {
      message: "Registration successful",
      user: { id: user.id, email: user.email },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();
    user.refreshToken = refreshToken;
    await this.usersRepository.save(user);
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const user = await this.usersRepository.findOne({
      where: { refreshToken },
    });
    if (!user) throw new UnauthorizedException("Invalid refresh token");
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    // Optionally rotate refresh token
    const newRefreshToken = uuidv4();
    user.refreshToken = newRefreshToken;
    await this.usersRepository.save(user);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user)
      return { message: "If the email exists, a reset link will be sent." };
    const token = uuidv4();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await this.usersRepository.save(user);
    // In production, send email with token. Here, return token for demo.
    return { message: "Password reset token generated.", token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { resetPasswordToken: dto.token },
    });
    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < Date.now()
    ) {
      throw new UnauthorizedException("Invalid or expired reset token");
    }
    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersRepository.save(user);
    return { message: "Password has been reset successfully." };
  }
}
