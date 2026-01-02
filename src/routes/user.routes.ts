import { Router } from "express";
import { currentUser, loginUser, logoutUser, refreshToken, registerUser } from "../controller/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

//protected
router.route("/user").post(verifyJwt, currentUser)
router.route("/refresh").get(verifyJwt, refreshToken)
router.route("/logout").get(verifyJwt, logoutUser)

export default router