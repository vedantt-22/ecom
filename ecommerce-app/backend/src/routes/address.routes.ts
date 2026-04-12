import { Router }             from "express";
import { addressController }  from "../controllers/address.controller";
import { requireAuth }        from "../middleware/auth.middleware";
import { requiredRole } from "../middleware/rbac.middleware";

const router = Router();

router.use(requireAuth, requiredRole("customer"));

router.get("/",  addressController.getAddresses);
router.post("/", addressController.createAddress);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);
router.patch("/:id/set-default", addressController.setDefault);

export default router;