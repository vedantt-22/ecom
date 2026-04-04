import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { validateInput } from "../utils/validation";

const productRepo = () => AppDataSource.getRepository(Product);

export interface SearchParams {
    query: string;
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