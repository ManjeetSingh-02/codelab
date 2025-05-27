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
  C: {
    id: 103,
    compiler: "C (GCC 14.1.0)",
  },
  CPP: {
    id: 105,
    compiler: "C++ (GCC 14.1.0)",
  },
  PYTHON: {
    id: 70,
    compiler: "Python (2.7.17)",
  },
  PYTHON3: {
    id: 71,
    compiler: "Python (3.8.1)",
  },
  JAVA: {
    id: 62,
    compiler: "Java (OpenJDK 13.0.1)",
  },
  JAVASCRIPT: {
    id: 93,
    compiler: "JavaScript (Node.js 18.15.0)",
  },
};
