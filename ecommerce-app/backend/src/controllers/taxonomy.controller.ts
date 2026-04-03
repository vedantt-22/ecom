import {Request, Response} from "express"
import { taxonomyService } from "../services/taxonomy.service";
import { asyncHandler } from "../middleware/error.middleware";

export class TaxonomyController {

    static getAllTypes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const result = await taxonomyService.getAllTypes();
        res.status(result.statusCode).json(result.data);
    });

    static getTypesWithCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
            const typeId = Number(req.params.typeId);
            const result = await taxonomyService.getTypeWithCategories(typeId);

            if(!result.success) {
                res.status(result.statusCode).json({ error: result.message });
                return;
            }
            res.status(result.statusCode).json(result.data);
        });

    static createType = asyncHandler(async (req: Request, res: Response): Promise<void> => {
            const { name } = req.body;
            if (!name) {
                res.status(400).json({ error: "Name is required." });
                return;
            }
            const result = await taxonomyService.createType(name);
            if(!result.success) {
                res.status(result.statusCode).json({ error: result.message });
                return;
            }
            res.status(result.statusCode).json(result.data);
        });
        
    static updateType = asyncHandler(async (req: Request, res: Response): Promise<void> => {
            const typeId = Number(req.params.typeId);
            const { name} = req.body;
            if (!name) {
                res.status(400).json({ error: "Name is required." });
                return;
            }
            const result = await taxonomyService.updateType(typeId, name);
            if(!result.success) {
                res.status(result.statusCode).json({ error: result.message });
                return;
            }
            res.status(result.statusCode).json(result.data);
        });

    static deleteType = asyncHandler(async (req: Request, res: Response): Promise<void> => {
            const typeId = Number(req.params.typeId);
            const result = await taxonomyService.deleteType(typeId);
            if(!result.success) {
                res.status(result.statusCode).json({ error: result.message });
                return;
            }
            res.status(result.statusCode).json(result.message);
        });

    static getAllCategories = asyncHandler(async(req: Request, res: Response): Promise<void> => {
        const typeId = req.query.typeId ? Number(req.query.typeId) : undefined;
        const result = await taxonomyService.getAllCategories(typeId);
        res.status(result.statusCode).json(result.data);
    });

    static getCategoriesWithSubCategories = asyncHandler(async(req: Request, res: Response): Promise<void> => {
        const categoryId = Number(req.params.categoryId);
        const result = await taxonomyService.getCategoriesWithSubCategories(categoryId);
        if(!result.success) {
            res.status(result.statusCode).json({ error: result.data });
            return;
        }
        res.status(result.statusCode).json(result.data);
    });

    static createCategory = asyncHandler(async(req: Request, res: Response): Promise<void> => {
        const { name, typeId } = req.body;
        if (!name || !typeId) {
            res.status(400).json({ error: "Name and typeId are required." });
            return;
        }
        const result = await taxonomyService.createCategory(name, typeId);
        if(!result.success) {
            res.status(result.statusCode).json({ error: result.data });
            return;
        }   
        res.status(result.statusCode).json(result.data);
    });

    static updateCategory = asyncHandler(async(req: Request, res: Response): Promise<void> => {
        const categoryId = Number(req.params.categoryId);
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: "Name is required." });
            return;
        }
        const result = await taxonomyService.updateCategory(categoryId, name);
        if(!result.success) {
            res.status(result.statusCode).json({ error: result.data });
            return;
        }   
        res.status(result.statusCode).json(result.data);4
    });

    static deleteCategory = asyncHandler(async(req: Request, res: Response): Promise<void> => {
        const categoryId = Number(req.params.categoryId);
        const result = await taxonomyService.deleteCategory(categoryId);
        if(!result.success) {
            res.status(result.statusCode).json({ error: result.message });
            return;
        }   
        res.status(result.statusCode).json(result.message);
    });

    static getAllSubCategories = asyncHandler(async(req: Request, res: Response): Promise<void> => {
        const categoryId = req.query.categoryId ? Number(req.params.categoryId) : undefined;
        const result = await taxonomyService.getAllSubCategories(categoryId);
        res.status(result.statusCode).json(result.data);
    });

    static getSubCategoryWithProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const subCategoryId = Number(req.params.subCategoryId);
        const result = await taxonomyService.getSubCategoryWithProducts(subCategoryId);
        if(!result.success) {
            res.status(result.statusCode).json({ error: result.message });
            return; 
        }
        res.status(result.statusCode).json(result.data);
    });

    static createSubCategory = asyncHandler(async(req: Request, res: Response): Promise<void> => {
        const { name, categoryId } = req.body;
        if (!name || !categoryId) {
            res.status(400).json({ error: "Name and categoryId are required." });
            return;
        }
        const result = await taxonomyService.createSubCategory(name, categoryId);
        if(!result.success) {
            res.status(result.statusCode).json({ error: result.data });
            return;
        }
        res.status(result.statusCode).json(result.data);
    });

    static updateSubCategory = asyncHandler(async(req: Request, res: Response): Promise<void> => {
        const subCategoryId = Number(req.params.subCategoryId);
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: "Name is required." });
            return;
        }
        const result = await taxonomyService.updateSubCategory(subCategoryId, name);
        if(!result.success) {
            res.status(result.statusCode).json({ error: result.data });
            return;
        }
        res.status(result.statusCode).json(result.data);
    });

    static deleteSubCategory = asyncHandler(async(req: Request, res: Response): Promise<void> => {
        const subCategoryId = Number(req.params.subCategoryId);
        const result = await taxonomyService.deleteSubCategory(subCategoryId);
        if(!result.success) {
            res.status(result.statusCode).json({ error: result.message });
            return;
        }   
        res.status(result.statusCode).json(result.message);
    });

    static getFullTree = asyncHandler(async(req: Request, res: Response): Promise<void> => {
        const result = await taxonomyService.getFullTree();
        res.status(result.statusCode).json(result.data);
    });
}

export const taxonomyController = new TaxonomyController();
