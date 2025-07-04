import { BASE_URL as DEV_URL } from "./env.dev";
import { BASE_URL as PROD_URL } from "./env.prod";

export const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;
