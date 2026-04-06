import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { asyncHandler } from '../middleware/error.middleware';

export class CartController {
    getCart = asyncHandler(async (req: Request, res: Response) => {
        const userId = Number(req.user?.id);
        const result = await cartService.getCart(userId);

        if (!result.success) {
            return res.status(result.statusCode).json({ message: result.message });
        }
        res.status(result.statusCode).json(result.data);
    });

    addToCart = asyncHandler(async (req: Request, res: Response) => {
        const userId = Number(req.user?.id);
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const result = await cartService.addToCart(userId, productId, Number(quantity));

        if (!result.success) {
            return res.status(result.statusCode).json({ message: result.message });
        }
        res.status(result.statusCode).json(result.data);
    });

    updateCartItem = asyncHandler(async (req: Request, res: Response) => {
        const userId = Number(req.user?.id);
        const cartItemId = Number(req.params.cartItemId);
        const { quantity } = req.body;

        if (quantity === undefined || quantity === null) {
            return res.status(400).json({ message: "Quantity is required" });
        }

        const result = await cartService.updateCartItem(userId, cartItemId, Number(quantity));

        if (!result.success) {
            return res.status(result.statusCode).json({ message: result.message });
        }
        res.status(result.statusCode).json(result.data);
    });

    removeCartItem = asyncHandler(async (req: Request, res: Response) => {
        const userId = Number(req.user?.id);
        const cartItemId = Number(req.params.cartItemId);

        const result = await cartService.removeCartItem(userId, cartItemId);

        if (!result.success) {
            return res.status(result.statusCode).json({ message: result.message });
        }
        res.status(result.statusCode).json(result.data);
    });

    clearCart = asyncHandler(async (req: Request, res: Response) => {
        const userId = Number(req.user?.id);

        const result = await cartService.clearCart(userId);

        if (!result.success) {
            return res.status(result.statusCode).json({ message: result.message });
        }
        res.status(result.statusCode).json(result.data);
    });

    getItemCount = asyncHandler(async (req: Request, res: Response) => {
        const userId = Number(req.user?.id);
        const result = await cartService.getCartItemCount(userId);
        
        res.status(result.statusCode).json(result.data);
    });
}

export const cartController = new CartController();