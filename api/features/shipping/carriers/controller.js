import { asyncHandler } from "#shared/middleware/asyncHandler.js";
import * as carriersRepo from "#features/shipping/carriers/repo.js";

export const getAll = asyncHandler(async (req, res) => {
  const result = await carriersRepo.getAll();
  return res.status(200).json(result);
});

export const getOne = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const result = await carriersRepo.getById(id);
  return res.status(200).json(result);
});

export const create = asyncHandler(async (req, res) => {
  const { carrier } = req.body;
  const result = await carriersRepo.create(carrier);
  return res.status(201).json(result);
});

export const update = asyncHandler(async (req, res) => {
  const { carrier } = req.body;
  const result = await carriersRepo.update(carrier);
  return res.status(200).json(result);
});

export const remove = asyncHandler(async (req, res) => {
  await carriersRepo.remove(req.body);
  return res.status(200).json(true);
});
