
import { bcryptAdapter, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";




export class AuthService {

    constructor(

    ) { }

    public async registerUser(registerUserDto: RegisterUserDto) {

        const existUser = await UserModel.findOne({ email: registerUserDto.email });
        if (existUser) throw CustomError.badRequest("Email already exists");

        try {
            const user = new UserModel(registerUserDto);

            // Encrypt password
            user.password = bcryptAdapter.hash(registerUserDto.password);

            await user.save();
            // JWT <---- for maintain session of user

            // Email of validation

            const { password, ...userEntity } = UserEntity.fromObject(user);

            const token = JwtAdapter.generateToken({ id: user._id });
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

        const token = await JwtAdapter.generateToken({ id: user._id, email: user.email });
        if (!token) throw CustomError.internalServer("Error generating token");

        return { user: userEntity, token: token };

    }

}