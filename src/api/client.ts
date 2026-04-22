import createClient from "openapi-fetch";
import type { paths } from "./v1";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const apiClient = createClient<paths>({ baseUrl: API_BASE_URL });

apiClient.use({
  onRequest({ request }) {
    const stored = localStorage.getItem('sellerinsight_auth');
    if (stored) {
      try {
        const auth = JSON.parse(stored);
        if (auth.username && auth.password) {
          request.headers.set('Authorization', `Basic ${btoa(`${auth.username}:${auth.password}`)}`);
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
    return request;
  }
});
