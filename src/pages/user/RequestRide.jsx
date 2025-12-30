import React from 'react';
import { useNavigate } from 'react-router-dom';

const RequestRide = () => {
  const navigate = useNavigate();

  // Redirect to main dashboard (where request button is)
  React.useEffect(() => {
    navigate('/user');
  }, [navigate]);

  return null;
};

export default RequestRide;