import axios from "axios";
import { BASE_URL } from "../env";
const baseURL = BASE_URL;

export function req(config: object) {
  const instance = axios.create({
    // baseURL: "https://blog.urchin.website/",
    baseURL: baseURL,
    timeout: 5000,
  });
  return instance(config);
}
