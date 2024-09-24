import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { RegisterDto, LoginDto, ActivationDto } from './dto/user.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/Prisma.Service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email/email.service';
import { User } from './entities/user.entity';
import { TokenSender } from './utils/sendTokens';

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
    // send mail
    const activationToken = await this.createActivationToken(user)
    const activationCode = activationToken.activationCode;
    await this.emailService.sendMail({
      email,
      subject: 'Activate your account',
      template: './activation-mail',
      name,
      activationCode,
    })
    
    return {user, response, activation_token: activationToken.token}
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
  //activation user
  async activateUser(activationDto: ActivationDto, response: Response) {
    const {activationToken, activationCode} = activationDto;

    const newUser: {user: UserData, activationCode: string} = this.jwtService.verify(activationToken,{
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
    } as JwtVerifyOptions) as {user: UserData, activationCode: string};

    if(newUser.activationCode !== activationCode){
      throw new BadRequestException('Invalid activation code')
    }
    const {name, email, password, phone_number} = newUser.user

    const existUser = await this.prisma.user.findFirst({
      where:{
        email,
      }
    });
  
    if(existUser){
      throw new BadRequestException('User already exists')
    }
    const user = await this.prisma.user.create({
      data:{
        name,
        email,
        password,
        phone_number,
        role: 'User',
      }
    })
    return {user,activationToken, response}

  }

  //Login user
  async login(loginDto: LoginDto){
    const {email, password} = loginDto
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      }
    })
    if(user && (await this.comparePassword(password, user.password))){
      const tokensender = new TokenSender(this.configService, this.jwtService)
      return tokensender.sendToken(user)
    }else{
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        error: {
          message: 'Invalid email or password'
        },
      };
    }

  }
// compare password with hashed password
async comparePassword(password: string, hashedPassword: string): Promise<boolean>
 {
  return await bcrypt.compare(password, hashedPassword);
}

//get logged in user
async getLoggedInUser(req: any){
  const user = req.user
  const accessToken = req.accessToken
  const refreshToken = req.refreshToken
  return {user, accessToken, refreshToken}
}
// Log out 
async Logout(req: any){
  req.user = null;
  req.accessToken = null;
  req.refreshToken = null;
  return { message: 'Logged out successfully' };
}

//get all users
async getUsers(){
  
  return this.prisma.user.findMany({})
}
}
