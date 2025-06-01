// import package modules
import axios from "axios";

// import local modules
import { envConfig } from "./env.js";

// function to get all batch submission tokens from judge0 API
export const submitBatchAndGetTokens = async submissions => {
  try {
    // get data from judge0 API
    const { data } = await axios.request({
      method: "POST",
      url: `${envConfig.JUDGE0_API_URL}`,
      params: {
        base64_encoded: "false",
      },
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        submissions,
      },
    });

    return data;
  } catch (error) {
    return error;
  }
};

// function to get all submission results by polling tokens
export const pollBatchTokensAndGetResults = async tokens => {
  try {
    // loop to continuously check for submission results
    while (true) {
      // get data from judge0 API
      const { data } = await axios.request({
        method: "GET",
        url: `${envConfig.JUDGE0_API_URL}`,
        params: {
          tokens: tokens.join(","),
          base64_encoded: "false",
          fields: "*",
        },
      });

      // check if all results are received
      const gotAllResults = data.submissions.every(s => s.status.id !== 1 && s.status.id !== 2);

      // if all results are received, return the data
      if (gotAllResults) return data;

      // wait for 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    return error;
  }
};
