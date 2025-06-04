// import package modules
import mongoose, { Schema } from "mongoose";

// import local modules
import { AvailableSheetStatuses } from "../../utils/constants";

// schema for sheet
const sheetSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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
      required: true,
    },
    problems: {
      type: [Schema.Types.ObjectId],
      ref: "Problem",
      default: [],
    },
  },
  { timestamps: true },
);

// export sheet model
export const Sheet = mongoose.model("Sheet", sheetSchema);
