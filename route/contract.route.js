import express from "express";
import { getContract } from "../controller/contract.controller.js";

const router = express.Router();

router.get("/",getContract);

export default router;