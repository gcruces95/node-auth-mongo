import { Router } from "express";
import { FileUploadController } from './controller';
import { FileUploadService } from "../services";
import { FileUploadMiddleware, typeMiddleware } from "../middlewares";




export class FileUploadRoutes {

    static get routes(): Router {

        const router = Router();


        const fileUploadController = new FileUploadController(new FileUploadService());

        router.use(FileUploadMiddleware.containFiles);
        router.use(typeMiddleware.validTypes(['users', 'products', 'categories']));

        router.post('/single/:type', fileUploadController.uploadFile);
        router.post('/multiple/:type', fileUploadController.uploadMultipleFiles);



        return router;

    }


}