// import package modules
import mongoose, { Schema } from "mongoose";

// import local modules
import { AvailableSheetStatuses, SheetStatusEnum } from "../../../utils/constants.js";

// schema for sheet
const sheetSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: AvailableSheetStatuses,
      default: SheetStatusEnum.PRIVATE,
    },
    problems: {
      type: [Schema.Types.ObjectId],
      ref: "Problem",
      default: [],
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

// export sheet model
export const Sheet = mongoose.model("Sheet", sheetSchema);
