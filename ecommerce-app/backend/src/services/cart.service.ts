import { AppDataSource } from "../data-source";
import { Cart } from "../entities/Cart";
import { Product } from "../entities/Product";
import { CartItem } from "../entities/CartItem";

const cartRepo = () => AppDataSource.getRepository(Cart);
const cartItemRepo = () => AppDataSource.getRepository(CartItem);
const productRepo = () => AppDataSource.getRepository(Product);

function buildImageUrl(imagePath: string | null): string {
    if (!imagePath) {
        return "/images/placeholder.png";
    }
    return `/images/${imagePath}`;
}

function formatCart(cart: Cart) {
    const items = cart.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            stock: item.product.stock,
            imageUrl: buildImageUrl(item.product.imagePath),
        },
        lineTotal: Number(item.product.price) * item.quantity,
    }));

    const totalPrice = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
        cartId: cart.id,
        items,
        total: totalPrice,
        itemCount: items.length,
    };
}

export class CartService {
    async getCart(userId: number) {
        const cart = await cartRepo().findOne({
            where: { user: { id: userId } },
            relations: ["items", "items.product", "items.product.subCategory", "items.product.subCategory.category", "items.product.subCategory.category.type"],
        });

        if (!cart) {
            return {
                success: false,
                statusCode: 404,
                message: "Cart not found",
            };
        }

        return {
            success: true,
            statusCode: 200,
            data: formatCart(cart),
        };
    }

    async addToCart(userId: number, productId: number, quantity: number) {
        if (!quantity || quantity < 1) {
            return {
                success: false,
                statusCode: 400,
                message: "Quantity must be at least 1",
            };
        }

        const product = await productRepo().findOneBy({ id: productId });
        if (!product) {
            return {
                success: false,
                statusCode: 404,
                message: "Product not found",
            };
        }

        const cart = await cartRepo().findOne({
            where: { user: { id: userId } },
        });

        if (!cart) {
            return {
                success: false,
                statusCode: 404,
                message: "Cart not found",
            };
        }

        const existingItem = await cartItemRepo().findOne({
            where: { cart: { id: cart.id }, product: { id: productId } },
        });

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > product.stock) {
                return {
                    success: false,
                    statusCode: 400,
                    message: `Not enough stock available. Max: ${product.stock}`,
                };
            }

            existingItem.quantity = newQuantity;
            await cartItemRepo().save(existingItem);
        } else {
            if (quantity > product.stock) {
                return {
                    success: false,
                    statusCode: 400,
                    message: "Not enough stock available",
                };
            }
            const newItem = cartItemRepo().create({
                cart,
                product,
                quantity,
            });
            await cartItemRepo().save(newItem);
        }

        return this.getCart(userId);
    }

    async updateCartItem(userId: number, cartItemId: number, quantity: number) {
        if (!quantity || quantity < 1) {
            return {
                success: false,
                statusCode: 400,
                message: "Quantity must be at least 1",
            };
        }

        const item = await cartItemRepo().findOne({
            where: { id: cartItemId },
            relations: ["product", "cart", "cart.user"],
        });

        if (!item || item.cart.user.id !== userId) {
            return {
                success: false,
                statusCode: 404,
                message: "Cart item not found",
            };
        }

        if (item.product.stock < quantity) {
            return {
                success: false,
                statusCode: 400,
                message: "Not enough stock available",
            };
        }

        item.quantity = quantity;
        await cartItemRepo().save(item);

        return this.getCart(userId);
    }

    async getCartItemCount(userId: number) {
        const cart = await cartRepo().findOne({
            where: { user: { id: userId } },
            relations: ["items"],
        });

        const count = cart?.items.length ?? 0;

        return {
            success: true,
            statusCode: 200,
            data: { count },
        };
    }

    async removeCartItem(userId: number, cartItemId: number) {
        const item = await cartItemRepo().findOne({
            where: { id: cartItemId },
            relations: ["cart", "cart.user"],
        });

        if (!item || item.cart.user.id !== userId) {
            return {
                success: false,
                statusCode: 404,
                message: "Cart item not found",
            };
        }

        await cartItemRepo().remove(item);
        return this.getCart(userId);
    }

    async clearCart(userId: number) {
        const cart = await cartRepo().findOne({
            where: { user: { id: userId } },
            relations: ["items"],
        });

        if (!cart) {
            return {
                success: false,
                statusCode: 404,
                message: "Cart not found.",
            };
        }

        if (cart.items.length > 0) {
            await cartItemRepo().remove(cart.items);
        }

        return {
            success: true,
            statusCode: 200,
            data: {
                cartId: cart.id,
                items: [],
                total: 0,
                itemCount: 0,
            },
        };
    }
}

export const cartService = new CartService();