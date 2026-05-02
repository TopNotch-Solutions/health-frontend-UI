const fetchJSON = async (url, method = "GET", data = null, token = null) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
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