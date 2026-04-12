import {Request, Response} from "express";
import {orderService} from "../services/order.service";
import {asyncHandler} from "../middleware/error.middleware";

export class OrderController {

    checkout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const userId = Number(req.user?.id);
        const { paymentMethod, shippingAddressId } = req.body;
        const parsedShippingAddressId = shippingAddressId != null
            ? Number(shippingAddressId)
            : undefined;

        if(!paymentMethod) {
            res.status(400).json({ message: "Payment method is required." });
            return;
        }

        if (shippingAddressId != null && (parsedShippingAddressId == null || Number.isNaN(parsedShippingAddressId))) {
            res.status(400).json({ message: "Valid shipping address is required." });
            return;
        }

        const result = await orderService.checkout(userId, paymentMethod, parsedShippingAddressId);

        if (!result.success) {
            res.status(result.statusCode).json({ message: result.message });
            return;
        }
        res.status(result.statusCode).json(result.data);
    });

    getMyOrders = asyncHandler(async (req: Request, res: Response) => {
        const userId = Number(req.user?.id);
        const result = await orderService.getMyOrders(userId);
        res.status(result.statusCode).json(result.data);
    });

    getOrderById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const userId = Number(req.user?.id);
        const orderId = Number(req.params.id);
        const isAdmin = req.user?.role === "admin";

        if (Number.isNaN(orderId)) {
            res.status(400).json({ message: "Order id must be a valid number." });
            return;
        }

        const result = await orderService.getOrderById(userId, orderId, isAdmin);
        if (!result.success) {
            res.status(result.statusCode).json({ message: result.message });
            return;
        }
        res.status(result.statusCode).json(result.data);
    });

    getAllOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const isAdmin = req.user?.role === "admin";

        const result = await orderService.getAllOrders(isAdmin);
        res.status(result.statusCode).json(result.data);
    });

}

export const orderController = new OrderController();