import { AppDataSource } from "../data-source";
import { SubCategory } from "../entities/SubCategory";
import { Category } from "../entities/Category";
import { ProductType } from "../entities/ProductType";
import { validateInput } from "../utils/validation";
// Repository helpers
const categoryRepo = () => AppDataSource.getRepository(Category);
const subCategoryRepo = () => AppDataSource.getRepository(SubCategory);
const typeRepo = () => AppDataSource.getRepository(ProductType);

export class TaxonomyService {
    //Product Type
    async getAllTypes() {
        const types = await typeRepo().find({
            order: {
                name: "ASC",
            },
        });
        return {
            success: true,
            statusCode: 200,
            data: types,
        };
    }
    async getTypeWithCategories(typeId: number) {
        const type = await typeRepo().findOne({
            where: {id: typeId},
            //relations tells typeorm to also fetch the related categories and subcategories in one query and join the 2 tables and return a nested javascript object with the type, its categories and their subcategories. This is more efficient than making separate queries for each level of the hierarchy.
            relations: ["categories", "categories.subCategories"],
            order: {
                categories: {
                    name: "ASC",
                },
            },
        });

        if(!type) {
            return {
                success: false,
                statusCode: 404,
                message: "Product type not found",
            };
        }
        return {
            success: true,
            statusCode: 200,
            data: type,
        };
    }

    async createType(name: string) {
        const cleanName = validateInput(name);

        if(cleanName.length < 2) {
            return {
                success: false,
                statusCode: 400,
                message: "Product type name must be at least 2 characters long",
            };
        }

        const existing = await typeRepo().findOne({
            where: { name: cleanName },
        });
        if(existing) {
            return {
                success: false,
                statusCode: 400,
                message: "Product type with this name already exists",
            };
        }

        const newType = typeRepo().create({ name: cleanName });
        await typeRepo().save(newType);

        return {
            success: true,
            statusCode: 201,
            message: "Product type created successfully",
            data: newType,
        };
    }

    async updateType(typeId: number, name: string) {
        const cleanName = validateInput(name);

        if(!cleanName || cleanName.length < 2) {
            return {
                success: false,
                statusCode: 400,
                message: "Product type name must be at least 2 characters long",
            };
        }
        

        const type = await typeRepo().findOne({where : {id: typeId}});

        if(!type) {
            return {
                success: false,
                statusCode: 404,
                message: "Product type not found",
            };
        }

        type.name = cleanName;
        await typeRepo().save(type);

        return {
            success: true,
            statusCode: 200,
            message: "Product type updated successfully",
            data: type,
        };
    }

    async deleteType(typeId: number) {
        const type = await typeRepo().findOne({where : {id: typeId}});

        if(!type) {
            return {
                success: false,
                statusCode: 404,
                message: "Product type not found",
            };
        }

        await typeRepo().remove(type);
        return {
            success: true,
            statusCode: 200,
            message: "Product type deleted successfully",
        };
    }

    // Categories

    async getAllCategories(typeId?: number) {
        const where = typeId ? { type: { id: typeId } } : {};
        const categories = await categoryRepo().find({
            where, 
            relations: ["type"],
            order: {
                name: "ASC",
            }
        });
        return {
            success: true,
            statusCode: 200,
            data: categories,
        };
    }

    async getCategoriesWithSubCategories(categoryId: number) {
        const Category = await categoryRepo().findOne({
            where: {id: categoryId},
            relations: ["type", "subCategories"],
            order: {
                subCategories: {
                    name: "ASC",
                }
            },
        });

        return {
            success: true,
            statusCode: 200,
            data: Category,
        }
    }

    async createCategory(name: string, typeId: number) {
        const cleanName = validateInput(name);

        if(!cleanName || cleanName.length < 2) {
            return {
                success: false,
                statusCode: 400,
                message: "Category name must be at least 2 characters long",
            };
        }

        const type = await typeRepo().findOne({where: {id: typeId}});

        if(!typeId) {
            return {
                success: false,
                statusCode: 404,
                message: "Product type not found",
            };
        }

        const existing = await categoryRepo().findOne({
            where: {
                name: cleanName,
                type: { id: typeId },
            },
        });

        if(existing) {
            return {
                success: false,
                statusCode: 400,
                message: "Category with this name already exists in the specified product type",
            };
        }

        const newcategory = categoryRepo().create({
            name: cleanName,
            type: { id: typeId }
        });

        await categoryRepo().save(newcategory);

        return {
            success: true,
            statusCode: 201,
            message: "Category created successfully",
            data: newcategory,
        };
    
    }

    async updateCategory(categorytId: number, name: string) {
        const category = await categoryRepo().findOne({where: {id: categorytId}, relations: ["type"]});

        if(!category) {
            return {
                success: false,
                statusCode: 404,
                message: "Category not found",
            };
        }

        category.name = validateInput(name);
        await categoryRepo().save(category);

        return {
            success: true,
            statusCode: 200,
            message: "Category updated successfully",
            data: category,
        };
    }

    async deleteCategory(categoryId: number) {
        const category = await categoryRepo().findOne({where: {id: categoryId}});
        if(!category) {
            return {
                success: false,
                statusCode: 404,
                message: "Category not found",
            };
        }
        await categoryRepo().remove(category);
        return {
            success: true,
            statusCode: 200,
            message: "Category deleted successfully",
        }
    }

    // Subcategories

    async getAllSubCategories(categoryId?: number) {

        const where = categoryId ? { category: { id: categoryId } } : {};
        const subCategory = await subCategoryRepo().find({ 
            where,
            relations: ["category", "category.type"],
            order: {
                category: {
                name: "ASC",
            }
        },
    });

    return {
        success: true,
        statusCode: 200,
        data: subCategory,
    };
    }

    async getSubCategoryWithProducts(subCategoryId: number) {
        const subCategory = await subCategoryRepo().findOne({
            where:{id: subCategoryId},
            relations: ["category", "category.type", "products"],
            order: {
                products: {
                    name: "ASC",
                }
            },
        });

        if(!subCategory) {
            return {
                success: false, 
                statusCode: 404,
                message: "Subcategory not found",
            };
        }   
        return {
            success: true,
            statusCode: 200,
            data: subCategory,
            }
        }

    async createSubCategory(name: string, categoryId: number) {
        const cleanName = validateInput(name);

            if(!cleanName || cleanName.length < 2) {
                return {
                    success: false,
                    statusCode: 400,
                    message: "Subcategory name must be at least 2 characters long",
                };
            }

            const category = await categoryRepo().findOne({where: {id: categoryId}});

            if(!category) {
                return {
                    success: false,
                    statusCode: 404,
                    message: "Category not found",
                };
            }

            const existing = await subCategoryRepo().findOne({
                where: {
                    name: cleanName,
                    category: { id: categoryId },
                }
            });

            if(existing) {
                return {
                    success: false,
                    statusCode: 400,
                    message: "Subcategory already exists",
                };
            }
            const sub = subCategoryRepo().create({
                name: cleanName,
                category: { id: categoryId },
            });
            await subCategoryRepo().save(sub);

            return {
                success: true,
                statusCode: 201,
                message: "Subcategory created successfully",
                data: sub,
            };
        }
    async updateSubCategory(subCategoryId: number, name: string) {
            const subCategory = await subCategoryRepo().findOne({where: {id: subCategoryId}, relations: ["category", "category.type"]});
            if(!subCategory) {
                return {
                    success: false,
                    statusCode: 404,
                    message: "Subcategory not found",
                };
            }

            subCategory.name = validateInput(name);
            await subCategoryRepo().save(subCategory);
            return {
                success: true,
                statusCode: 200,
                message: "Subcategory updated successfully",
                data: subCategory,
            };
        }
    
    async deleteSubCategory(subCategoryId: number) {
    const repo = subCategoryRepo();
    
    // 1. Find the subcategory
    const subCategory = await repo.findOne({ where: { id: subCategoryId } });

    if (!subCategory) {
        return {
            success: false,
            statusCode: 404,
            message: "Subcategory not found",
        };
    }

    // 2. Remove it
    await repo.remove(subCategory);

    return {
        success: true,
        statusCode: 200,
        message: "Subcategory deleted successfully",
    };
}

    async getFullTree() {
        const types = await typeRepo().find({
            relations: ["categories", "categories.subCategories"],
            order: {    
                name: "ASC",
            }
        });
        return {
            success: true,
            statusCode: 200,
            data: types,
        };
    }
}

export const taxonomyService = new TaxonomyService();



    