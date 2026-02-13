import axios from "axios";

export const getRandomProblem = async () => {
  const response = await axios.get(
    `${process.env.PROBLEM_SERVICE_URL}/problems/random`
  );
  return response.data;
};
