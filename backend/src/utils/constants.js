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
