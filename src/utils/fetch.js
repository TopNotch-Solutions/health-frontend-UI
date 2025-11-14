import { useState, useCallback } from 'react';

const useFetch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
    const baseURL = 'http://localhost:4000';
    const fullURL = `${baseURL}${url}`;

    setLoading(true);
    setError(null);

    try {
      const options = {
        method,
        headers,
      };

      if (body) {
        options.body = JSON.stringify(body);
        options.headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(fullURL, options); // Use the new full URL
      console.log('Fetch response:', response); // Debugging line
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;

    } catch (e) {
      setError(e.message);
      setData(null);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, request };
};

export default useFetch;