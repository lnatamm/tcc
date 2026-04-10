import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const normalizeUserTypeName = (raw) => {
  const v = String(raw || '').trim().toLowerCase();
  if (!v) return null;

  if (['athlete', 'atleta', 'aluno'].includes(v)) return 'athlete';
  if (['coach', 'treinador', 'professor'].includes(v)) return 'coach';

  return v;
};

const normalizeList = (list) => {
  if (!Array.isArray(list)) return null;
  const normalized = list
    .map((x) => normalizeUserTypeName(x) || String(x || '').trim().toLowerCase())
    .filter(Boolean);
  return normalized.length ? normalized : null;
};

const PrivateRoute = ({ children, allowUserTypes, denyUserTypes }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeUserTypeName(user?.user_type_name);
  const allow = normalizeList(allowUserTypes);
  const deny = normalizeList(denyUserTypes);

  if (allow && !allow.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  if (deny && deny.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PrivateRoute;
