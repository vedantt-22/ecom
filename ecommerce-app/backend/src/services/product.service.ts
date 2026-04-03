import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { SubCategory } from "../entities/SubCategory";
import { Category } from "../entities/Category";
import path from "path";
import fs from "fs";


const productRepo = () => AppDataSource.getRepository(Product);
const subCategoryRepo = () => AppDataSource.getRepository(SubCategory);
const categoryRepo = () => AppDataSource.getRepository(Category);

function buildImageUrl(imagePath: string | null): string {
    if(!imagePath) return "/ProductImages/placeholder.png";
    return `/ProductImages/${path.basename(imagePath)}`;
}

function deleteImageFile(filename: string | null): void {
    if (!filename) return;
    const filePath = path.join(__dirname, "../../public/ProductImages", filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

export class ProductService {
    async getAllProducts() {
        const products = await productRepo().find({
            relations: ["subCategory", "subCategory.category", "subCategory.category.type"],
            order: { createdAt: "DESC" },
        });
        const data = products.map((p) => ({
            ...p,
            imageUrl: buildImageUrl(p.imagePath),
        }));
        return {
            success: true,
            statusCode: 200,
            data,
        };
    }

    async getproductById(productId: number) {
        const product = await productRepo().findOne({
            where:{id: productId},
            relations: ["subCategory", "subCategory.category", "subCategory.category.type"],
        });
        if (!product) {
            return {
                success: false,
                statusCode: 404,
                message: "Product not found",
            };
        }
        return {
            success: true,
            statusCode: 200,
            data: {
                ...product,
                imageUrl: buildImageUrl(product.imagePath),
            },
        };
    }

}

export const productService = new ProductService();