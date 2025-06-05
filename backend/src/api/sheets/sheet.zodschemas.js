// import package modules
import { z } from "zod";

// zod schema for sheet title
const sheetTitleSchema = z
  .string()
  .trim()
  .nonempty({ message: "Sheet Title is required" })
  .min(5, { message: "Sheet Title must be at least 5 characters long" })
  .max(20, { message: "Sheet Title must be at most 20 characters long" });

// zod schema for sheet description
const sheetDescriptionSchema = z
  .string()
  .trim()
  .nonempty({ message: "Sheet Description is required" })
  .min(10, { message: "Sheet Description must be at least 10 characters long" })
  .max(100, { message: "Sheet Description must be at most 100 characters long" });

// zod schema for createSheet
export const createSheetSchema = z.object({
  title: sheetTitleSchema,
  description: sheetDescriptionSchema,
});

// zod schema for updateProblemIntoSheet
export const updateProblemIntoSheetSchema = z.object({
  problemSlug: z.string().trim().nonempty({ message: "Problem Slug is required" }),
});
