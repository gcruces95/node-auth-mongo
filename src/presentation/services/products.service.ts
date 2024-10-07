import { CreateProductDto, CustomError, PaginationDto } from "../../domain";
import { ProductModel } from '../../data';

export class ProductService {

    constructor() { }

    public async createProduct(createProductDto: CreateProductDto) {
        const productExist = await ProductModel.findOne({ name: createProductDto.name });
        if (productExist) throw CustomError.badRequest("Product already exists");

        try {

            const product = new ProductModel(createProductDto);

            await product.save();

            return product

        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    public async getProducts(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;

        try {

            const [totalProducts, products] = await Promise.all([
                ProductModel.countDocuments(),
                ProductModel.find()
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('user')
                    .populate('category')
            ]);

            return {
                page: page,
                limit: limit,
                totalProducts: totalProducts,
                next: `/api/products?page=${page + 1}&limit=${limit}`,
                prev: (page - 1 > 0) ? `/api/products?page=${page - 1}&limit=${limit}` : null,
                products: products,
            };

        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }
}