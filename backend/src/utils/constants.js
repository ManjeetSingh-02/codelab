// all roles that can be assigned to a user
export const UserRolesEnum = {
  ADMIN: "admin",
  PROBLEM_MANAGER: "problem_manager",
  USER: "user",
};

// values array of the UserRolesEnum
export const AvailableUserRoles = Object.values(UserRolesEnum);

// all possible user states for /get-all-users route
export const UserStatesEnum = {
  ALL: "all",
  ADMIN: "admin",
  PROBLEM_MANAGER: "problem_manager",
  VERIFIED_USER: "verified_user",
  UNVERIFIED_USER: "unverified_user",
};

// values array of the UserStatesEnum
export const AvailableUserStates = Object.values(UserStatesEnum);

// all possible problem difficulties
export const ProblemDifficultiesEnum = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

// values array of the ProblemDifficultiesEnum
export const AvailableProblemDifficulties = Object.values(ProblemDifficultiesEnum);

// all problem solving languages judge0 id
export const Judge0LanguagesIdMap = {
  C: { id: 50, compiler: "C (GCC 9.2.0)" },
  CPP: { id: 54, compiler: "C++ (GCC 9.2.0)" },
  PYTHON2: { id: 70, compiler: "Python (2.7.17)" },
  PYTHON3: { id: 71, compiler: "Python (3.8.1)" },
  JAVA: { id: 62, compiler: "Java (OpenJDK 13.0.1)" },
  JAVASCRIPT: { id: 63, compiler: "JavaScript (Node.js 12.14.0)" },
};

// keys array of the Judge0LanguagesIdMap to obtain languages names
export const AvailableJudge0Languages = Object.keys(Judge0LanguagesIdMap);

// all possible judge0 error ids
export const Judge0ErrorIdMap = {
  3: { statusCode: 200, statusMessage: "Accepted" },
  4: { statusCode: 422, statusMessage: "Wrong Answer" },
  5: { statusCode: 422, statusMessage: "Time Limit Exceeded" },
  6: { statusCode: 422, statusMessage: "Compilation Error" },
  7: { statusCode: 422, statusMessage: "Runtime Error: Segmentation Fault" },
  8: { statusCode: 422, statusMessage: "Runtime Error: File Size Limit Exceeded" },
  9: { statusCode: 422, statusMessage: "Runtime Error: Floating Point Exception" },
  10: { statusCode: 422, statusMessage: "Runtime Error: Program Aborted Unexpectedly" },
  11: { statusCode: 422, statusMessage: "Runtime Error: Program Exited with a code other than 0" },
  12: { statusCode: 500, statusMessage: "Runtime Error: Unknown" },
  13: { statusCode: 500, statusMessage: "Internal Error" },
  14: { statusCode: 500, statusMessage: "Exec Format Error: Invalid Executable Format" },
};

// values array of the Judge0ErrorIdMap error messages
export const AvailableJudge0ErrorIdMessages = Object.values(Judge0ErrorIdMap).map(
  e => e.statusMessage,
);

// all possible status of submissions
export const SubmissionStatusEnum = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
};

// values array of the SubmissionStatusEnum
export const AvailableSubmissionStatuses = Object.values(SubmissionStatusEnum);

// all possible status of sheets
export const SheetStatusEnum = {
  PUBLIC: "public",
  PRIVATE: "private",
};

// values array of the SheetStatusEnum
export const AvailableSheetStatuses = Object.values(SheetStatusEnum);
