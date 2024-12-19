import { Injectable } from '@nestjs/common';
import { createTransport, Transporter} from 'nodemailer';

@Injectable()
export class EmailService {
    transporter: Transporter;

    constructor(){
        this.transporter = createTransport({
            host: 'smtp.qq.com',
            port: 587,
            secure: false,
            auth: {
                user: '564994559@qq.com',
                pass: 'fwzbmslmhlxybehc'
            }
        })
    }

    async sendMail({to, subject, html}){
        await this.transporter.sendMail({
            from: {
                name: 'nestjs',
                address: '564994559@qq.com'
            },
            to,
            subject,
            html
        })
    }
}

