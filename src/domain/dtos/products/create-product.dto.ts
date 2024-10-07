import { Validators } from "../../../config";


export class CreateProductDto {

    private constructor(
        public readonly name: string,
        public readonly price: number,
        public readonly available: boolean,
        public readonly description: string,
        public readonly category: string, // ID of category
        public readonly user: string, // ID of user
    ) { }

    static create(object: { [key: string]: any }): [string?, CreateProductDto?] {

        const { name, price, available = false, description, category, user } = object;

        if (!name) return ["Missing name", undefined];
        if (!user) return ["Missing user", undefined];
        if (!Validators.isMongoId(user)) return ["Invalid user", undefined];
        if (!category) return ["Missing category", undefined];
        if (!Validators.isMongoId(category)) return ["Invalid category", undefined];

        let availableBool = available;
        if (typeof available !== 'boolean') {
            availableBool = (available === 'true');
        }

        return [undefined, new CreateProductDto(name, price, availableBool, description, category, user)];

    }

} 