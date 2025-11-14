import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

function AdminRoute() {
  const currentUser = useSelector((state) => state.auth.user);
  return currentUser && Object.keys(currentUser).length > 0 ? <Outlet /> : <Navigate to="/" />;
}

export default AdminRoute;
