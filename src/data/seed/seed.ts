import { envs } from "../../config";
import { CategoryModel, MongoDatabase, ProductModel, UserModel } from "../mongo";
import { seedData } from "./data";




(async () => {
    await MongoDatabase.connect({
        dbName: envs.MONGO_DB_NAME,
        mongoUrl: envs.MONGO_URL,
    });

    await seed();

    await MongoDatabase.disconnect();
})();

const randomBetween0AndX = (x: number) => Math.floor(Math.random() * x);

async function seed() {

    await Promise.all([
        UserModel.deleteMany(),
        ProductModel.deleteMany(),
        CategoryModel.deleteMany(),
    ]);

    const user = await UserModel.insertMany(seedData.users);

    const categories = await CategoryModel.insertMany(
        seedData.categories.map((category) => ({ ...category, user: user[randomBetween0AndX(user.length)]._id }))
    );

    const products = await ProductModel.insertMany(
        seedData.products.map((product) => ({
            ...product,
            user: user[randomBetween0AndX(user.length)]._id,
            category: categories[randomBetween0AndX(categories.length)]._id,
        }))
    );



    console.log('Seeded data');
}