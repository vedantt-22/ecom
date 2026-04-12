import { AppDataSource } from "../data-source";
import { Category } from "../entities/Category";
import { Product } from "../entities/Product";
import { validateInput } from "../utils/validation";
import path from "path";

const productRepo = () => AppDataSource.getRepository(Product);

function buildImageUrl(imagePath: string | null): string {
    if (!imagePath) return "";

    const normalized = imagePath.trim();
    if (!normalized) return "";

    if (
        /^https?:\/\//i.test(normalized) ||
        normalized.startsWith("/images/") ||
        normalized.startsWith("data:image/")
    ) {
        return normalized;
    }

    return `/images/${path.basename(normalized)}`;
}

export interface SearchParams {
  q?: string;
    typeId?: number;
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
    // 1. Strict Pagination Parsing
    const page = Math.max(1, parseInt(String(params.page)) || 1);
    const pageSize = Math.max(1, Math.min(parseInt(String(params.pageSize)) || 12, 50));

    // 2. Sorting Setup
    const allowedSortFields = ["name", "price", "createdAt", "stock"];
    const sortBy = allowedSortFields.includes(params.sortBy || "") ? params.sortBy! : "createdAt";
    const sortOrder = params.sortOrder === "ASC" ? "ASC" : "DESC";

    // 3. Initialize Query Builder WITHOUT a .where()
    const qb = productRepo()
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.subCategory", "subCategory")
        .leftJoinAndSelect("subCategory.category", "category")
        .leftJoinAndSelect("category.type", "type");

        // 4. Optional Type ID Filter
        if (params.typeId !== undefined) {
            const tId = parseInt(String(params.typeId));
            if (!isNaN(tId)) {
                qb.andWhere("type.id = :tId", { tId });
            }
    }

    // 5. Conditional Filters (Using unique parameter names to avoid collisions)
    if (params.q) {
        const cleanQuery = validateInput(params.q).toLowerCase();
        qb.andWhere("(LOWER(product.name) LIKE :q OR LOWER(product.description) LIKE :q)", { 
            q: `%${cleanQuery}%` 
        });
    }

    if (params.categoryId) {
        const cId = parseInt(String(params.categoryId));
        if (!isNaN(cId)) qb.andWhere("category.id = :cId", { cId });
    }

    if (params.subCategoryId) {
        const sId = parseInt(String(params.subCategoryId));
        if (!isNaN(sId)) qb.andWhere("subCategory.id = :sId", { sId });
    }

    if (params.minPrice !== undefined) {
        const minP = parseFloat(String(params.minPrice));
        if (!isNaN(minP)) qb.andWhere("product.price >= :minP", { minP });
    }

    if (params.maxPrice !== undefined) {
        const maxP = parseFloat(String(params.maxPrice));
        if (!isNaN(maxP)) qb.andWhere("product.price <= :maxP", { maxP });
    }

    if (params.inStock === true) {
        qb.andWhere("product.stock > 0");
    }

    // 6. Pagination & Ordering
    // We use getManyAndCount but ensure skip/take receive clean integers
    qb.orderBy(`product.${sortBy}`, sortOrder)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    // 7. Execute with Error Catching
    try {
        const [products, total] = await qb.getManyAndCount();
        
        const data = products.map((p) => ({
            ...p,
            imageUrl: buildImageUrl(p.imagePath),
        }));

        return {
            success: true,
            statusCode: 200,
            result: {
                data,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    } catch (err) {
        console.error("Database Error:", err);
        throw err; // This will be caught by your asyncHandler
    }
}
}
export const searchService = new SearchService();
