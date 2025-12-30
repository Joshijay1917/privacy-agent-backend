import { Router } from "express";
import { callLLM } from "../controller/gemini.controller.js";

const router = Router()

router.route("/query").post(callLLM)

export default router