// import package modules
import { z } from "zod";

// import local modules
import { AvailableJudge0Languages } from "../../../utils/constants.js";

// zod schema for execute code
export const executeCodeSchema = z.object({
  source_code: z.string(),
  language: z.enum(AvailableJudge0Languages, { message: "Invalid programming language" }),
  stdin: z.array(z.string()),
  expected_outputs: z.array(z.string()),
  problemSlug: z.string(),
});
