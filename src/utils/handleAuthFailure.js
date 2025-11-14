import Swal from 'sweetalert2';
import { toggleSidebarfalse } from "../redux/reducers/sidebarReducer";
import { login } from "../redux/reducers/authReducer";
import {toggleAuthenticationfalse} from "../redux/reducers/twoFactorReducer";

const handleAuthFailure = ({dispatch, navigate, type}) => {
    if (type === 'auth') {
      dispatch(toggleAuthenticationfalse());
      dispatch(toggleSidebarfalse());
      dispatch(login({ user: {} }));
      navigate("/");
    } else if (type === 'network') {
    
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'It seems like you are offline. Please check your internet connection and try again.',
        confirmButtonText: 'OK'
      });
    }
  };
  
export default handleAuthFailure;