import { AppDataSource } from "../data-source";
import { Category } from "../entities/Category";
import { Product } from "../entities/Product";
import { validateInput } from "../utils/validation";

const productRepo = () => AppDataSource.getRepository(Product);

export interface SearchParams {
    q?: string;
    typeId: number;
    categoryId?: number;
    subCategoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    pageSize?: number;

}

export interface SearchResult {
    data: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export class SearchService {

    async searchProducts(params: SearchParams) {
        const page = params.page ?? 1;
        const pageSize = Math.min(params.pageSize ?? 12, 50);

        const allowedSortFields = ["name", "price", "createdAt", "stock"];
        const sortBy = allowedSortFields.includes(params.sortBy ?? "") ? params.sortBy! : "createdAt";

        const sortOrder = params.sortOrder === "ASC" ? "ASC" : "DESC";

        const qb = productRepo()
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.subCategory", "subCategory")
            .leftJoinAndSelect("subCategory.category", "category")
            .leftJoinAndSelect("category.type", "type")
            .where("type.id = :typeId", { typeId: params.typeId });

            if(params.q) {
                const cleanQuery = validateInput(params.q).toLowerCase();
                qb.andWhere("LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search", { search: `%${cleanQuery}%` });
            }

            if(params.subCategoryId) {
                qb.andWhere("subCategory.id = :subCategoryId", { subCategoryId: params.subCategoryId });
            }

            if(params.categoryId) {
                qb.andWhere("category.id = :categoryId", { categoryId: params.categoryId});
            }

            if(params.typeId) {
                qb.andWhere("type.id = :typeId", { typeId: params.typeId });
            }

            if(params.minPrice !== undefined && !isNaN(params.minPrice)) {
                qb.andWhere("product.price >= :minPrice", { minPrice: params.minPrice });
            }

            if(params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
                qb.andWhere("product.price <= :maxPrice", { maxPrice: params.maxPrice });
            }
            if(params.inStock === true) {
                qb.andWhere("product.stock > 0");
            }

            qb.orderBy(`product.${sortBy}`, sortOrder)
              .skip((page - 1) * pageSize)
              .take(pageSize);


            const [products, total] = await qb.getManyAndCount();

            const data = products.map((p) => ({
                ...p,
                imageUrl: p.imagePath ?
                `/ProductImages/${p.imagePath}` : "/ProductImages/placeholder.png",
            }));

            const totalPages = Math.ceil(total / pageSize);

            return {
                success: true,
                statusCode: 200,
                result: {
                    data,
                    total,
                    page,
                    pageSize,
                    totalPages,
                } as SearchResult,
            };
        }
}

export const searchService = new SearchService();