import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

@InputType()
export class RegisterDto {
    @Field()
    @IsNotEmpty({message: 'Name is required'})
    @IsString({message: 'Name must be a string'})
    name: string;
    
    @Field()
    @IsNotEmpty({message: 'Password is required'})
    @IsString({message: 'Password must be a string'})
    @MinLength(8, {message: 'Password must be at least 8 characters'})
    password: string;
    

    @Field()
    @IsNotEmpty({message: 'Email is required'})
    @IsEmail({},{message: 'Email is not valid'})
    email: string;

    @Field()
    @IsString({message: 'Phone Number must be a string'})
    @IsNotEmpty({message: 'Phone Number is required'})
    phone_number: string;
    
    
}

@InputType()
export class ActivationDto {
    @Field()
    @IsNotEmpty({message: 'Activation Token is required'})
    activationToken: string;

    @Field()
    @IsNotEmpty({message: 'Activation Code is required'})
    activationCode: string;
}

@InputType()
export class LoginDto {
    @Field()
    @IsNotEmpty({message: 'Email is required'})
    @IsEmail({},{message: 'Email is not valid'})
    email: string;
    
    @Field()
    @IsNotEmpty({message: 'Password is required'})
    @IsString({message: 'Password must be a string'})
    @MinLength(8, {message: 'Password must be at least 8 characters'})
    password: string;
}
