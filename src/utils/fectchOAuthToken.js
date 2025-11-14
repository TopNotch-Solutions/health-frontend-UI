export const fetchOAuthToken = async () => {
    try {
      const response = await fetch('https://api-gw.mtc.com.na/v1/km/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic UlA1SEZuOGFLV05NQnRYOVRnSEdkMF9CRGhJYTp1WVBySldSajM2ZTNCQlZqSllWTDV2WE1JMThh`, // Replace with environment variable in production
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
        }).toString(),
        //credentials: 'include',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching token:', errorData);
        throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(data)
      return data; // Return the fetched token data
    } catch (error) {
      console.error('Fetch Error:', error);
      throw error; // Re-throw the error for the caller to handle
    }
  };
  