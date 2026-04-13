import { Request, Response } from "express";
import { addressService } from "../services/address.service";
import { asyncHandler } from "../middleware/error.middleware";

export class AddressController {

  getAddresses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await addressService.getAddresses(req.user!.id);
    res.status(200).json(data);
  });

  createAddress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      label, fullName, phone,
      addressLine1, addressLine2,
      city, state, pincode, isDefault,
    } = req.body;

    console.log('Creating address with payload:', req.body);

    if (!label || !fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      console.warn('Missing required fields:', { label, fullName, phone, addressLine1, city, state, pincode });
      res.status(400).json({ error: "All required address fields must be provided." });
      return;
    }

    try {
      const data = await addressService.createAddress(req.user!.id, {
        label, fullName, phone,
        addressLine1, addressLine2,
        city, state, pincode, isDefault,
      });

      console.log('Address created successfully:', data);
      res.status(201).json(data);
    } catch (error: any) {
      console.error('Address creation service error:', error.message);
      res.status(400).json({ error: error.message });
    }
  });

  updateAddress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await addressService.updateAddress(
      req.user!.id,
      Number(req.params.id),
      req.body
    );
    res.status(200).json(data);
  });

  deleteAddress = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await addressService.deleteAddress(req.user!.id, Number(req.params.id));
    res.status(200).json({ message: "Address deleted." });
  });

  setDefault = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = await addressService.setDefault(
      req.user!.id,
      Number(req.params.id)
    );
    res.status(200).json(data);
  });
}

export const addressController = new AddressController();