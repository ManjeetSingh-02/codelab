// import local modules
import { envConfig } from "../env.js";

// function to generate the content of the verification email
export const verificationMailContentGenerator = (username, verificationToken) => {
  return {
    body: {
      name: username,
      intro: "Welcome to CodeLab! We're very excited to have you on board.",
      action: {
        instructions: "To verify your account, please click here:",
        button: {
          color: "#1a73e8",
          text: "Verify your account",
          link: `${envConfig.ORIGIN_URL}/verify-account/${verificationToken}`,
        },
      },
      outro: "This link is only valid for 5 mins.",
    },
  };
};

// function to generate the content of the forgot pasword email
export const forgotPasswordMailContentGenerator = (username, resetPasswordToken) => {
  return {
    body: {
      name: username,
      intro: "You have requested to reset your password.",
      action: {
        instructions: "To reset your password, please click here:",
        button: {
          color: "#0F9D58",
          text: "Reset your password",
          link: `${envConfig.ORIGIN_URL}/reset-password/${resetPasswordToken}`,
        },
      },
      outro: "This link is only valid for 5 mins.",
    },
  };
};

// function to generate the content of password change confirmation email
export const passwordChangeConfirmationMailContentGenerator = username => {
  return {
    body: {
      name: username,
      intro: "Your password has been successfully changed.",
      action: {
        instructions: "You can now log into your account with your new password.",
        button: {
          color: "#1a73e8",
          text: "Log In",
          link: `${envConfig.ORIGIN_URL}/login`,
        },
      },
    },
  };
};

// function to generate the content of account deletion confirmation email
export const accountDeletionConfirmationMailContentGenerator = username => {
  return {
    body: {
      name: username,
      intro: "Your account has been successfully deleted.",
      action: {
        instructions: "If you have any questions, feel free to contact us.",
        button: {
          color: "#D93025",
          text: "Contact Support",
          link: `${envConfig.ORIGIN_URL}/support`,
        },
      },
    },
  };
};

// function to generate the content of role update confirmation email
export const roleUpdateConfirmationMailContentGenerator = (username, role) => {
  return {
    body: {
      name: username,
      intro: `Your account role has been successfully changed to: ${role.toUpperCase()}.`,
      action: {
        instructions: "Login into your account to access updated role features.",
        button: {
          color: "#1a73e8",
          text: "Log In",
          link: `${envConfig.ORIGIN_URL}/login`,
        },
      },
    },
  };
};
