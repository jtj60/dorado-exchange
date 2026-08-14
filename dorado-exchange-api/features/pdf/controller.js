import { asyncHandler } from "#shared/middleware/asyncHandler.js";
import * as pdfRepo from "#features/pdf/repo.js"

const sendPdf = (res, pdf, filename) => {
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": pdf.length,
  });
  res.end(pdf);
};

export const generatePackingList = asyncHandler(async (req, res) => {
  const pdf = await pdfRepo.generatePackingList(req.body);
  sendPdf(res, pdf, "packing-list.pdf");
});

export const generateReturnPackingList = asyncHandler(async (req, res) => {
  const pdf = await pdfRepo.generateReturnPackingList(req.body);
  sendPdf(res, pdf, "packing-list.pdf");
});

export const generateInvoice = asyncHandler(async (req, res) => {
  const pdf = await pdfRepo.generateInvoice(req.body);
  sendPdf(res, pdf, "packing-list.pdf");
});

export const generateSalesOrderInvoice = asyncHandler(async (req, res) => {
  const pdf = await pdfRepo.generateSalesOrderInvoice(req.body);
  sendPdf(res, pdf, "packing-list.pdf");
});
