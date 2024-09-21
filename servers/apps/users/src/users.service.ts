import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/user.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/Prisma.Service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email/email.service';

interface UserData{
  name: string;
  email: string;
  password: string;
  phone_number: string;
}
@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}
  //registering user
  async register(registerDto: RegisterDto, response: Response) {
    const {name, email, password, phone_number} = registerDto
    const isEmailExis = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    })
    if(isEmailExis) {
      throw new BadRequestException('Email already exists')
    }
    const isPhone_NumberExists = await this.prisma.user.findFirst({
      where: {
        phone_number: phone_number,
      }
    })
    if(isPhone_NumberExists){
      throw new BadRequestException('number already exists')
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = {
        name,
        email,
        password: hashedPassword,
        role: 'User',
        phone_number,
    }
    const activationToken = await this.createActivationToken(user)
    const activationCode = activationToken.activationCode;
    await this.emailService.sendMail({
      email,
      subject: 'Activate your account',
      template: '../../../email-templates/activation-mail.ejs',
      name,
      activationCode,
    })
    
    return {user, response }
  }
  // create activation token
  async createActivationToken(user: UserData) {
    const activationCode = Math.floor(1000+Math.random()*9000).toString();

    const token = this.jwtService.sign(
      {
        user,
        activationCode,
      },
      {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
        expiresIn: '5m',
      }
    );
    return {token, activationCode};
  }


  //Login user
  async login(loginDto: LoginDto){
    const {email, password} = loginDto
    const user = {
      email,
      password,
    }
    return user
  }
//get all users
async getUsers(){
  
  return this.prisma.user.findMany({})
}
}
