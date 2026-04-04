// src/controllers/product.controller.ts
import { asyncHandler } from "../middleware/error.middleware";
import { productService } from "../services/product.service";
import { Request, Response } from "express";

export class productController {
    // We use 'static' so we don't need to 'new' the class in the routes
    static getAllProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const result = await productService.getAllProducts();
        res.status(result.statusCode).json(result.data);
    });

    static getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const productId = Number(req.params.id);
        // Ensure this matches the name in your productService (e.g., getProductById)
        const result = await productService.getProductById(productId);
        if (!result.success) {
            res.status(result.statusCode).json({ error: result.message });
            return;
        }
        res.status(result.statusCode).json(result.data);
    });

    static createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { name, description, price, stock, subCategoryId } = req.body;
        if (!name || !description || !price || !subCategoryId) {
            res.status(400).json({ error: "All fields are required." });
            return;
        }
        const imageFileName = req.file ? req.file.filename : null;
        
        const result = await productService.createProduct(
            name, description, Number(price), Number(stock ?? 0), Number(subCategoryId), imageFileName
        );
        if(!result.success) {
            res.status(result.statusCode).json({ error: result.message });
            return;
        }
        res.status(result.statusCode).json(result.data);
    });

    static updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const productId = Number(req.params.id);
        const { name, description, price, stock, subCategoryId } = req.body;
        const imageFileName = req.file ? req.file.filename : undefined;

        const result = await productService.updateProduct(
            productId, 
            name, 
            description, 
            price !== undefined ? Number(price) : undefined, 
            stock !== undefined ? Number(stock) : undefined, 
            subCategoryId ? Number(subCategoryId) : undefined, 
            imageFileName
        );

        if(!result.success) {
            res.status(result.statusCode).json({ error: result.message });
            return;
        }
        res.status(result.statusCode).json(result.data);
    });

    static deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const result = await productService.deleteProduct(Number(req.params.id));
        if (!result.success) {
            res.status(result.statusCode).json({ error: result.message });
            return;
        }
        res.status(result.statusCode).json({ message: result.message });
    });

    static getProductsBySubCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const result = await productService.getProductsBySubCategory(Number(req.params.subCategoryId));
        if (!result.success) {
            res.status(result.statusCode).json({ error: result.message });
            return;
        }
        res.status(result.statusCode).json(result.data);
    });
}