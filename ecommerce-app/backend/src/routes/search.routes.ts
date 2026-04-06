import { searchController } from "../controllers/search.controller";
import { Router } from "express";

const router = Router();

router.get("/", searchController.search);

export default router;

