import { store } from "../redux/store";

const getStoredToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (token) return token;
  } catch {
    // ignore
  }
  try {
    const stateToken = store?.getState?.()?.auth?.user?.token;
    if (stateToken) return stateToken;
  } catch {
    // ignore
  }
  return null;
};

const fetchJSON = async (url, method = "GET", data = null, token = null) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const authToken = token || getStoredToken();
    if (authToken) {
      const cleanToken = authToken.startsWith("Bearer ")
        ? authToken.slice(7).trim()
        : authToken.trim();
      headers["Authorization"] = `Bearer ${cleanToken}`;
      headers["x-access-token"] = `Bearer ${cleanToken}`;
    }

    const options = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const text = await response.text();

    let result = null;
    if (text) {
      const trimmed = text.trimStart();
      if (trimmed.startsWith("<")) {
        throw new Error(
          `Server returned HTML (status ${response.status}) instead of JSON for ${url}. Check the route and API base URL.`
        );
      }
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          `Invalid JSON response from ${url}: ${text.slice(0, 120).replace(/\s+/g, " ")}…`
        );
      }
    }

    if (!response.ok) {
      throw new Error(result?.message || `Request failed (${response.status})`);
    }

    return result;
  } catch (error) {
    console.error("fetchJSON error:", error);
    throw error;
  }
};

export default fetchJSON;
