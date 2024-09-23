import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

type mailOptions = {
    subject: string;
    email: string;
    name: string;
    activationCode: string;
    template: string;
}
@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {}
    async sendMail({
        subject,
        email,
        name,
        activationCode,
        template,
    }: mailOptions) {
        await this.mailerService.sendMail({
            to: email,
            subject,
            template,
            context: {
                name,
                activationCode,
            },
        })
    }
}
