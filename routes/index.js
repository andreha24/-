import { Router } from "express";
import { body, param } from "express-validator";
import multer from "multer";
import { validate } from "../middleware/validate.js";
import * as bookController from "../controllers/bookController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const router = Router();

export function setupRoutes(app) {
  router.post(
    "/books",
    upload.single("file"),
    [
      body("title").notEmpty().trim(),
      body("author").notEmpty().trim(),
      body("price").isNumeric(),
    ],
    validate,
    bookController.registerBook
  );

  router.post(
    "/books/:id/buy",
    [param("id").isNumeric(), body("value").isNumeric()],
    validate,
    bookController.buyBook
  );

  router.get(
    "/books/:id/download",
    [param("id").isNumeric()],
    validate,
    bookController.downloadBook
  );

  router.patch(
    "/books/:id/availability",
    [param("id").isNumeric(), body("isAvailable").isBoolean()],
    validate,
    bookController.updateBookAvailability
  );

  // Маршрут для оновлення ціни книги
  router.patch(
    "/books/:id/price",
    [param("id").isNumeric(), body("price").isNumeric().isInt({ min: 1 })],
    validate,
    bookController.updateBookPrice
  );

  app.use("/api", router);
}
