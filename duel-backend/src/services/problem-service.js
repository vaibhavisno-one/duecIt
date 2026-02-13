import axios from "axios";

export const getRandomProblem = async (difficulty = "easy") => {
  const response = await axios.get(
    `${process.env.PROBLEM_SERVICE_URL}/problems/random`,
    {
      params: { difficulty },
      headers: {
        "x-service-key": process.env.PROBLEM_SERVICE_KEY
      }
    }
  );

  return response.data.data;
};
