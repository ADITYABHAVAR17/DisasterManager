import axios from "axios";

const API_URL = "http://localhost:5000/api/reports";

export const fetchReports = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};
