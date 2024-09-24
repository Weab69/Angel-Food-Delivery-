import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../../../prisma/Prisma.Service";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const gqlContext = GqlExecutionContext.create(context);
        const { req } = gqlContext.getContext();

        const accessToken = req.headers.accessToken as string;
        const refreshToken = req.headers.refreshToken as string;

        if(!accessToken || !refreshToken) {
            throw new UnauthorizedException ('Please Login to access this resource');
        }

        if(accessToken){
            const decoded = await this.jwtService.verify(accessToken,{
                secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
            })

            if(!decoded) {
                throw new UnauthorizedException('Invalid Access Token')
            }
            await this.updateAccessToken(req);
        }
        return true;
    }

    private async updateAccessToken(req: any): Promise<void> {
        try {
            const refreshTokenData = req.headers.refreshToken as string;
            const decoded = await this.jwtService.verify(refreshTokenData, {
                secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
            })
            if(!decoded) {
                throw new UnauthorizedException('Invalid Refresh Token')
            }

            const user = await this.prisma.user.findUnique({
                where: {
                    id: decoded.id,
                },
            })

            const accessToken = this.jwtService.sign(
                {id: user.id},
                {
                    secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
                    expiresIn: '15m',
                }
            )
            const refreshToken = this.jwtService.sign(
                {id: user.id},
                {
                    secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
                    expiresIn: '3d',
                }
            )
            req.accessToken = accessToken;
            req.refreshToken = refreshToken;
            req.user = user;

        } catch (error) {
            console.log(error);
            
        }
    }
}