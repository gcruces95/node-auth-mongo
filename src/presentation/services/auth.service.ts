
import { bcryptAdapter, envs, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";
import { EmailService } from "./email.service";




export class AuthService {

    constructor(
        private readonly emailService: EmailService,
    ) { }

    public async registerUser(registerUserDto: RegisterUserDto) {

        const existUser = await UserModel.findOne({ email: registerUserDto.email });
        if (existUser) throw CustomError.badRequest("Email already exists");

        try {
            const user = new UserModel(registerUserDto);

            user.password = bcryptAdapter.hash(registerUserDto.password);

            await user.save();

            await this.sendEmailValidationLink(user.email);

            const { password, ...userEntity } = UserEntity.fromObject(user);

            const token = await JwtAdapter.generateToken({ id: user._id });
            if (!token) throw CustomError.internalServer("Error generating token");

            return { user: userEntity, token: token };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    public async loginUser(loginUserDto: LoginUserDto) {
        const user = await UserModel.findOne({ email: loginUserDto.email });
        if (!user) throw CustomError.notFound("User not found");

        const isPasswordValid = bcryptAdapter.compare(loginUserDto.password, user.password);
        if (!isPasswordValid) throw CustomError.unauthorized("Invalid password");

        const { password, ...userEntity } = UserEntity.fromObject(user);

        const token = await JwtAdapter.generateToken({ id: user._id });
        if (!token) throw CustomError.internalServer("Error generating token");

        return { user: userEntity, token: token };

    }

    private sendEmailValidationLink = async (email: string) => {

        const emailToken = await JwtAdapter.generateToken({ email });
        if (!emailToken) throw CustomError.internalServer("Error generating email token");

        const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${emailToken}`;
        const emailBody = `
            <h1>Validate your email</h1>
            <p>Click on the link below to validate your email</p>
            <a href="${link}">Validate email: ${email}</a>
        `;

        const emailOptions = {
            to: email,
            subject: 'Validate your email',
            htmlBody: emailBody,
        };

        const emailSent = await this.emailService.sendEmail(emailOptions);
        if (!emailSent) throw CustomError.internalServer("Error sending email");

        return true;

    }

    public validateEmail = async (token: string) => {

        const payload = await JwtAdapter.validateToken(token);
        if (!payload) throw CustomError.unauthorized("Invalid token");

        const { email } = payload as { email: string };
        if (!email) throw CustomError.internalServer("Email not found in token");

        const user = await UserModel.findOne({ email });
        if (!user) throw CustomError.internalServer("User not found");

        user.emailValidated = true;
        await user.save();

        return true;

    }

}