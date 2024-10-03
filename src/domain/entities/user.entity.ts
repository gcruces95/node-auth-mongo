import { CustomError } from "../errors/custom.error";



export class UserEntity {

    constructor(
        public readonly id: String,
        public readonly name: String,
        public readonly email: String,
        public readonly emailValidated: Boolean,
        public readonly password: String,
        public readonly role: String[],
        public readonly img?: String,
    ) { }

    static fromObject(object: { [key: string]: any }) {
        const { id, _id, name, email, emailValidated, password, role, img } = object;

        if (!id && !_id) throw CustomError.badRequest("Missing id");
        if (!name) throw CustomError.badRequest("Missing name");
        if (!email) throw CustomError.badRequest("Missing email");
        if (!emailValidated === undefined) throw CustomError.badRequest("Missing emailValidated");
        if (!password) throw CustomError.badRequest("Missing password");
        if (!role) throw CustomError.badRequest("Missing role");

        return new UserEntity(id || _id, name, email, emailValidated, password, role, img);

    }

}