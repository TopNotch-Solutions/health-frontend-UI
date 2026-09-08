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

export const fetchFormData = async (url, method = "POST", formData, token = null) => {
  try {
    const headers = {};

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
      body: formData,
    };

    const response = await fetch(url, options);
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = "Upload failed";
      try {
        const errorResult = await response.json();
        errorMessage = errorResult.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Try to parse JSON response
    let result;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      // If not JSON, return text or empty object
      const text = await response.text();
      result = text ? { message: text } : { status: true };
    }

    return result;
  } catch (error) {
    console.error("fetchFormData error:", error);
    // Re-throw with more context if it's a network error
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error("Network error: Unable to connect to server. Please check your connection and ensure the server is running.");
    }
    throw error;
  }
};
