
import { Router } from "express";
import { ProductController } from "./controller";
import { AuthMiddleware } from "../middlewares";
import { ProductService } from "../services";



export class ProductRoutes {

    static get routes(): Router {

        const router = Router();

        const productService = new ProductService();

        const productController = new ProductController(productService);

        router.post('/', [AuthMiddleware.validateJWT], productController.createProduct);
        router.get('/', productController.getProducts);

        return router;

    }


}