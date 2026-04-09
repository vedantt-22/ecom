import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { SubCategory } from "../entities/SubCategory";
import { Category } from "../entities/Category";
import path from "path";
import fs from "fs";
import { validateInput } from "../utils/validation";


const productRepo = () => AppDataSource.getRepository(Product);
const subCategoryRepo = () => AppDataSource.getRepository(SubCategory);
const categoryRepo = () => AppDataSource.getRepository(Category);

function buildImageUrl(imagePath: string | null): string {
    if(!imagePath) return "/images/placeholder.png";
    return `/images/${path.basename(imagePath)}`;
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

    async getProductById(productId: number) {
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

    async createProduct(
        name: string,
        description: string,
        price: number,
        stock: number,
        subCategoryId: number,
        imageFilename: string | null
    ) {
        const cleanName = validateInput(name);
        if(!cleanName || cleanName.length < 2) {
            return {
                success: false,
                statusCode: 400,
                message: "Product name must be at least 2 characters long and not contain special characters.",
            };
        }

        const cleanDescription = validateInput(description);
        if(!cleanDescription || cleanDescription.length < 10) {
            return {
                success: false,
                statusCode: 400,
                message: "Product description must be at least 10 characters long and not contain special characters.",
            };
        }

        if(price <= 0 || isNaN(price)) {
            return {
                success: false,
                statusCode: 400,
                message: "Price must be a positive number.",
            };
        }

        if(stock < 0 || isNaN(stock)) {
            return {
                success: false,
                statusCode: 400,
                message: "Stock must be a non-negative number.",
            };
        }

        const subCategory = await subCategoryRepo().findOneBy({ id: subCategoryId });
        if (!subCategory) {
            return {
                success: false,
                statusCode: 404,
                message: "Sub-category not found.",
            };
        }

        const newProduct = productRepo().create({
            name: cleanName,
            description: cleanDescription,
            price,
            stock,
            subCategory,
            imagePath: imageFilename,
        });

        await productRepo().save(newProduct);

        return {
            success: true,
            statusCode: 201,
            data: {
                ...newProduct,
                imageUrl: buildImageUrl(newProduct.imagePath),
            },
        };
    }

    async updateProduct(
        productId: number,
        name?: string,
        description?: string,
        price?: number,
        stock?: number,
        subCategoryId?: number,
        imageFilename?: string | null
    ) {
        const product = await productRepo().findOne({ where: { id: productId }, relations: ["subCategory"]});

        if (!product) {
            return {
                success: false,
                statusCode: 404,
                message: "Product not found",
            };
        }

        if (name !== undefined) {
            const cleanName = validateInput(name);
            if(!cleanName || cleanName.length < 2) {
                return {
                    success: false,
                    statusCode: 400,
                    message: "Product name must be at least 2 characters long and not contain special characters.",
                };
            }
            product.name = cleanName;
        }

        if (description !== undefined) {
            const cleanDescription = validateInput(description);
            if(!cleanDescription || cleanDescription.length < 10) {
                return {
                    success: false,
                    statusCode: 400,
                    message: "Product description must be at least 10 characters long and not contain special characters.",
                };
            }
            product.description = cleanDescription;
        }

        if (price !== undefined) {
            if(price <= 0 || isNaN(price)) {
                return {
                    success: false,
                    statusCode: 400,
                    message: "Price must be a positive number.",
                };
            }
            product.price = price;
        }

        if (stock !== undefined) {
            if(stock < 0 || isNaN(stock)) {
                return {
                    success: false,
                    statusCode: 400,
                    message: "Stock must be a non-negative number.",
                };
            }
            product.stock = stock;
        }

        if (subCategoryId !== undefined) {
            const subCategory = await subCategoryRepo().findOneBy({ id: subCategoryId });
            if (!subCategory) {
                return {
                    success: false,
                    statusCode: 404,
                    message: "Sub-category not found.",
                };
            }
            product.subCategory = subCategory;
        }

        if (imageFilename !== undefined) {
            deleteImageFile(product.imagePath);
            product.imagePath = imageFilename;
        }

        await productRepo().save(product);

        return {
            success: true,
            statusCode: 200,
            data: {
                ...product,
                imageUrl: buildImageUrl(product.imagePath),
            },
        };
    }

async deleteProduct(productId: number) {
        const product = await productRepo().findOne({
            where: {id: productId},
        });

        if(!product) {
            return {
                successs: false,
                statusCode: 404,
                message: "Product not found",
            };
        }

        deleteImageFile(product.imagePath);

        await productRepo().remove(product);

        return {
            success: true,
            statusCode: 200,
            message: "Product deleted successfully",
        };
    }

    async getProductsBySubCategory(subCategoryId: number) {
        const subCategory = await subCategoryRepo().findOne({
            where: { id: subCategoryId },
        });

        if(!subCategory) {
            return {
                success: false, 
                statusCode: 404,
                message: "Sub-category not found",
            };
        }

        const products = await productRepo().find({
            where: {subCategory : { id: subCategoryId }},
            relations: ["subCategory", 
            "subCategory.category",
             "subCategory.category.type"
            ]
        });

        return {
            success: true,
            statusCode: 200,
            data: products?.map((p) => ({
                ...p,
                imageUrl: buildImageUrl(p.imagePath),
            })),
        };
    }
}
export const productService = new ProductService();

