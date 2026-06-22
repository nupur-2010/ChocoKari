import { Router } from "express";
import { getDashboardStats, promoteToAdmin, promoteToAdminPublic } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

const router = Router();

router.route("/dashboard").get(verifyJWT, getDashboardStats);
router.route("/promote").post(verifyJWT, promoteToAdmin);
router.route("/promote-public").post(promoteToAdminPublic);

export default router;

