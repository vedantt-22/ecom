import { Request, Response }  from "express";
import { searchService }      from "../services/search.service";
import { asyncHandler } from "../middleware/error.middleware";

export class SearchController {

  search = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      q, typeId, categoryId, subCategoryId,
      minPrice, maxPrice, inStock,
      sortBy, sortOrder, page, pageSize,
    } = req.query;

    if (typeId === undefined) {
      res.status(400).json({ message: "typeId is required" });
      return;
    }

    const parsedTypeId = Number(typeId);

    if (Number.isNaN(parsedTypeId)) {
      res.status(400).json({ message: "typeId must be a valid number" });
      return;
    }

    const result = await searchService.searchProducts({
      q:             q             ? String(q)             : undefined,
      typeId:        parsedTypeId, 
      categoryId:    categoryId    ? Number(categoryId)    : undefined,
      subCategoryId: subCategoryId ? Number(subCategoryId) : undefined,
      minPrice:      minPrice      ? Number(minPrice)      : undefined,
      maxPrice:      maxPrice      ? Number(maxPrice)      : undefined,
      inStock:       inStock === "true" ? true             : undefined,
      sortBy:        sortBy        ? String(sortBy)        : undefined,
      sortOrder:     sortOrder === "ASC" ? "ASC"
                   : sortOrder === "DESC" ? "DESC"
                   : undefined,
      page:          page          ? Number(page)          : undefined,
      pageSize:      pageSize      ? Number(pageSize)      : undefined,
    });

    res.status(result.statusCode).json(result.result);
  });
}

export const searchController = new SearchController();