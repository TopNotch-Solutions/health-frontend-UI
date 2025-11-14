import { Navigate } from 'react-router-dom';

const AuthRoute = ({ element, isAuthenticated, ...rest }) => {
  return isAuthenticated ? element : <Navigate to="/" />;
};

export default AuthRoute;