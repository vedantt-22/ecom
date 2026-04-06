// src/controllers/admin.controller.ts
//
// Thin controller — extracts from req, calls service, sends response.
// All admin controllers use asyncHandler.

import { Request, Response } from "express";
import { adminService }      from "../services/admin.service";
import { productService }    from "../services/product.service";
import { asyncHandler } from "../middleware/error.middleware";

export class AdminController {

  // ── DASHBOARD ──────────────────────────────────────────────

  getDashboardStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const result = await adminService.getDashboardStats();
    res.status(result.statusCode).json(result.data);
  });

  // ── CUSTOMER MANAGEMENT ────────────────────────────────────

  getAllCustomers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const result = await adminService.getAllCustomers();
    res.status(result.statusCode).json(result.data);
  });

  getCustomerById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = Number(req.params.id);
    const result     = await adminService.getCustomerById(customerId);

    if (!result.success) {
      res.status(result.statusCode).json({ error: result.message });
      return;
    }

    res.status(result.statusCode).json(result.data);
  });

  lockCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = Number(req.params.id);
    // Pass the admin's own ID for the self-lock safety check
    const adminId    = req.user!.id;
    const result     = await adminService.lockCustomer(customerId, adminId);

    if (!result.success) {
      res.status(result.statusCode).json({ error: result.message });
      return;
    }

    res.status(result.statusCode).json({ message: result.message });
  });

  unlockCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = Number(req.params.id);
    const adminId    = req.user!.id;

    const result     = await adminService.unlockCustomer(customerId, adminId);

    if (!result.success) {
      res.status(result.statusCode).json({ error: result.message });
      return;
    }

    res.status(result.statusCode).json({ message: result.message });
  });


  // src/controllers/admin.controller.ts — add this method

updateOrderStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: "status is required." });
    return;
  }

  const result = await adminService.updateOrderStatus(orderId, status);

  if (!result.success) {
    res.status(result.statusCode).json({ error: result.message });
    return;
  }

  res.status(result.statusCode).json({
    message: result.message,
    data:    result.data,
  });
});

  // ── ORDER MANAGEMENT ───────────────────────────────────────

  getAllOrders = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const result = await adminService.getAllOrders();
    res.status(result.statusCode).json(result.data);
  });

  getOrderById = asyncHandler(async (req:Request, res:Response): Promise<void> => {
    const orderId = Number(req.params.id);
    const result  = await adminService.getOrderById(orderId);

    if (!result.success) {
      res.status(result.statusCode).json({ error: result.message });
      return;
    }

    res.status(result.statusCode).json(result.data);
  });

  // ── PRODUCT MANAGEMENT ─────────────────────────────────────
  // Admin product routes reuse productService directly.
  // No duplication — same business logic, same validation.
  // The difference is only at the route level (admin vs public).

  adminGetAllProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await productService.getAllProducts();
    res.status(result.statusCode).json(result.data);
  });

  adminGetProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await productService.getProductById(Number(req.params.id));
    if (!result.success) {
      res.status(result.statusCode).json({ error: result.message });
      return;
    }
    res.status(result.statusCode).json(result.data);
  });

  adminCreateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, description, price, stock, subCategoryId } = req.body;

    if (!name || !description || !price || !subCategoryId) {
      res.status(400).json({
        error: "Name, description, price and subCategoryId are required.",
      });
      return;
    }

    const imageFilename = req.file?.filename ?? null;
    const result = await productService.createProduct(
      name, description,
      Number(price), Number(stock ?? 0),
      Number(subCategoryId), imageFilename
    );

    if (!result.success) {
      res.status(result.statusCode).json({ error: result.message });
      return;
    }

    res.status(result.statusCode).json(result.data);
  });

  adminUpdateProduct = asyncHandler(async (req: Request, res: Response): Promise<void>  => {
    const { name, description, price, stock, subCategoryId } = req.body;
    const imageFilename = req.file?.filename;

    const result = await productService.updateProduct(
      Number(req.params.id), name, description,
      price         !== undefined ? Number(price)         : undefined,
      stock         !== undefined ? Number(stock)         : undefined,
      subCategoryId !== undefined ? Number(subCategoryId) : undefined,
      imageFilename
    );

    if (!result.success) {
      res.status(result.statusCode).json({ error: result.message });
      return;
    }

    res.status(result.statusCode).json(result.data);
  });

  adminDeleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await productService.deleteProduct(Number(req.params.id));

    if (!result.success) {
      res.status(result.statusCode).json({ error: result.message });
      return;
    }

    res.status(result.statusCode).json({ message: result.message });
  });
}

export const adminController = new AdminController();