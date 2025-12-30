import React from 'react';
import { useNavigate } from 'react-router-dom';

const MyRides = () => {
  const navigate = useNavigate();

  // Redirect to main dashboard (where rides are shown)
  React.useEffect(() => {
    navigate('/user');
  }, [navigate]);

  return null;
};

export default MyRides;