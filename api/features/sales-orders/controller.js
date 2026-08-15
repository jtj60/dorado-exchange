import { asyncHandler } from "#shared/middleware/asyncHandler.js";
import * as salesOrderService from "#features/sales-orders/service.js"

export const getSalesOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await salesOrderService.getById(orderId);
  return res.json(order);
});

export const getSalesOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orders = await salesOrderService.listOrdersForUser(userId);
  return res.json(orders);
});

export const getAllSalesOrders = asyncHandler(async (req, res) => {
  const orders = await salesOrderService.getAll();
  return res.json(orders);
});

export const getOrderMetals = asyncHandler(async (req, res) => {
  const { sales_order_id } = req.body;
  const metals = await salesOrderService.getMetalsForOrder(sales_order_id);
  return res.json(metals);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const result = await salesOrderService.cancelOrder(req.body);
  return res.status(200).json(result);
});

export const createSalesOrder = asyncHandler(async (req, res) => {
  const order = await salesOrderService.createSalesOrder(req.body, req.headers);
  return res.status(200).json(order);
});

export const adminCreateSalesOrder = asyncHandler(async (req, res) => {
  const order = await salesOrderService.adminCreateSalesOrder(req.body);
  return res.status(200).json(order);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const updated = await salesOrderService.updateStatus(req.body);
  return res.status(200).json(updated);
});

export const sendOrderToSupplier = asyncHandler(async (req, res) => {
  const order = await salesOrderService.sendOrderToSupplier(req.body);
  return res.status(200).json(order);
});

export const updateOrderTracking = asyncHandler(async (req, res) => {
  const order = await salesOrderService.updateTracking(req.body);
  return res.status(200).json(order);
});

export const createReview = asyncHandler(async (req, res) => {
  const result = await salesOrderService.createReview(req.body);
  return res.status(200).json(result);
});
