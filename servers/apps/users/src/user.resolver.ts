import { BadRequestException } from "@nestjs/common";
import { Args ,Mutation, Resolver, Query } from "@nestjs/graphql";
import { UsersService } from "./users.service";
import { RegisterResponse } from "./types/user.types";
import { RegisterDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";
import { Context } from "@nestjs/graphql";
import { Response } from "express";

@Resolver('User')

export class UsersResolver {
    constructor(private readonly userService: UsersService) {}
    @Mutation(() => RegisterResponse)
        async register(
            @Args('registerInput') registerInput: RegisterDto,
            @Context() context: {res: Response}
              
        ):Promise<RegisterResponse> {
            if(!registerInput.name || !registerInput.email || !registerInput.password){
                throw new BadRequestException('All fields are required')
            }
            const user = await this.userService.register(registerInput, context.res);
        return {user};
        }
    
    @Query(()=> [User])
        async getUsers(){ 
            return this.userService.getUsers();
        }
        
}