import { Router } from "express";
import { createCustom, getCustomById } from "../controllers/custom.controller.js";

const router = Router();

router.route("/").post(createCustom);
router.route("/:customId").get(getCustomById);

export default router;
