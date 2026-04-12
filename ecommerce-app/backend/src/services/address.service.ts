import { AppDataSource } from "../data-source";
import { Address } from "../entities/Address";
import { validateInput } from "../utils/validation";

const addressRepo = () => AppDataSource.getRepository(Address);

// Define a clear interface for address data
interface AddressInput {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export class AddressService {

  async getAddresses(userId: number) {
    return addressRepo().find({
      where: { userId },
      order: { isDefault: "DESC", createdAt: "DESC" },
    });
  }

  async createAddress(userId: number, data: AddressInput) {
    // 1. Validation matching your middleware needs
    if (!/^\d{6}$/.test(data.pincode)) {
      throw new Error("Pincode must be 6 digits.");
    }

    if (!/^\d{10}$/.test(data.phone)) {
      throw new Error("Phone must be 10 digits.");
    }

    // 2. Handle Default Logic
    if (data.isDefault) {
      await addressRepo().update(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    const count = await addressRepo().count({ where: { userId } });
    const isDefault = data.isDefault ?? count === 0;

    // 3. Create with explicit mapping to avoid Type overlap errors
    const address = addressRepo().create({
      userId,
      label: validateInput(data.label),
      fullName: validateInput(data.fullName),
      phone: data.phone,
      addressLine1: validateInput(data.addressLine1),
      addressLine2: data.addressLine2 ? validateInput(data.addressLine2) : null,
      city: validateInput(data.city),
      state: validateInput(data.state),
      pincode: data.pincode,
      isDefault,
    });

    return addressRepo().save(address);
  }

  async updateAddress(userId: number, addressId: number, data: Partial<AddressInput>) {
    const address = await addressRepo().findOne({
      where: { id: addressId },
    });

    if (!address) throw new Error("Address not found.");
    
    // Ownership check (IDOR Protection)
    if (address.userId !== userId) {
      throw new Error("Unauthorized: Access denied.");
    }

    if (data.isDefault) {
      await addressRepo().update(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    // Explicitly map inputs to avoid "null vs undefined" TypeORM errors
    if (data.label) address.label = validateInput(data.label);
    if (data.fullName) address.fullName = validateInput(data.fullName);
    if (data.phone) address.phone = data.phone;
    if (data.addressLine1) address.addressLine1 = validateInput(data.addressLine1);
    if (data.addressLine2 !== undefined) address.addressLine2 = data.addressLine2 ? validateInput(data.addressLine2) : null;
    if (data.city) address.city = validateInput(data.city);
    if (data.state) address.state = validateInput(data.state);
    if (data.pincode) address.pincode = data.pincode;
    if (data.isDefault !== undefined) address.isDefault = data.isDefault;

    return addressRepo().save(address);
  }

  async deleteAddress(userId: number, addressId: number) {
    const address = await addressRepo().findOne({
      where: { id: addressId },
    });

    if (!address) throw new Error("Address not found.");
    if (address.userId !== userId) throw new Error("Unauthorized: Access denied.");

    const wasDefault = address.isDefault;
    await addressRepo().remove(address);

    // If we deleted the default, pick the next best one
    if (wasDefault) {
      const remaining = await addressRepo().findOne({
        where: { userId },
        order: { createdAt: "DESC" },
      });

      if (remaining) {
        remaining.isDefault = true;
        await addressRepo().save(remaining);
      }
    }
  }

  async setDefault(userId: number, addressId: number) {
    const address = await addressRepo().findOne({
      where: { id: addressId },
    });

    if (!address) throw new Error("Address not found.");
    if (address.userId !== userId) throw new Error("Unauthorized: Access denied.");

    await addressRepo().update(
      { userId, isDefault: true },
      { isDefault: false }
    );

    address.isDefault = true;
    return addressRepo().save(address);
  }
}

export const addressService = new AddressService();