import express from "express";

import {
  create,
  getAll,
  getOne,
  remove,
  update,
} from "#features/shipping/carriers/controller.js";

import {
  requireAdmin,
  requireUser,
} from "#shared/middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", requireUser, getAll);

router.get("/get_one", requireAdmin, getOne);
router.post("/create", requireAdmin, create);
router.post("/update", requireAdmin, update);
router.delete("/delete", requireAdmin, remove);

export default router;
