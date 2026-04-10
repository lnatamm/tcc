import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Home from '../Home';
import AthleteHome from '../AthleteHome';

const isAthleteUser = (user) => {
  const name = (user?.user_type_name || '').trim().toLowerCase();
  return name === 'athlete';
};

const HomeGate = () => {
  const { user } = useAuth();

  if (isAthleteUser(user)) {
    return <AthleteHome />;
  }

  return <Home />;
};

export default HomeGate;
