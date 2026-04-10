import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../assets/Logo.png';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileType, setProfileType] = useState('athlete');
  const [userTypes, setUserTypes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [levelId, setLevelId] = useState('');
  const [error, setError] = useState('');

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const athleteNameFromCoachFlow = location?.state?.athleteName || '';
  const allowWhileLoggedIn = Boolean(athleteNameFromCoachFlow);

  useEffect(() => {
    if (user && !allowWhileLoggedIn) {
      navigate('/home');
    }
  }, [user, navigate, allowWhileLoggedIn]);

  useEffect(() => {
    if (athleteNameFromCoachFlow) {
      setName(String(athleteNameFromCoachFlow));
      setProfileType('athlete');
    }
  }, [athleteNameFromCoachFlow]);

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [typesRes, levelsRes] = await Promise.all([
          api.get('/user-types'),
          api.get('/levels'),
        ]);

        setUserTypes(typesRes?.data || []);
        setLevels(levelsRes?.data || []);
      } catch (err) {
        setError('Falha ao carregar tipos/níveis.');
      }
    };

    loadRefs();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username || !name || !email || !password || !confirmPassword) {
      setError('Fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!userTypes || userTypes.length === 0) {
      setError('Tipos de usuário não carregados. Recarregue a página e tente novamente.');
      return;
    }

    const profileKey = normalize(profileType);
    const matchesProfileType = (typeRow) => {
      const name = normalize(typeRow?.name ?? typeRow?.nome);
      if (!name) return false;

      if (name === profileKey) return true;

      // Fallbacks for databases that store PT-BR names
      if (profileKey === 'athlete') return name === 'aluno' || name === 'atleta';
      if (profileKey === 'coach') return name === 'professor' || name === 'treinador';
      return false;
    };

    const typeId = userTypes?.find(matchesProfileType)?.id;
    if (!typeId) {
      setError('Tipo de usuário inválido.');
      return;
    }

    if (profileType === 'coach' && !levelId) {
      setError('Selecione um nível para Professor.');
      return;
    }

    try {
      await api.post('/auth/register', {
        usuario: username,
        nome: name,
        email,
        senha: password,
        id_user_type: typeId,
        id_level: profileType === 'coach' ? Number(levelId) : undefined,
      });

      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Unable to create the account. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img className="login-logo" src={Logo} alt="Athletrics" />

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            Username
            <input
              className="login-input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Full Name
            <input
              className="login-input"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Email
            <input
              className="login-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Profile
            <select
              className="login-input"
              value={profileType}
              onChange={(e) => {
                const value = e.target.value;
                setProfileType(value);
                if (value !== 'coach') {
                  setLevelId('');
                }
              }}
              required
              disabled={allowWhileLoggedIn}
            >
              <option value="athlete">Athlete</option>
              <option value="coach">Coach</option>
            </select>
          </label>

          {profileType === 'coach' && (
            <label className="login-label">
              Level
              <select
                className="login-input"
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                required
              >
                <option value="">Select a level</option>
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="login-label">
            Password
            <input
              className="login-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Confirm Password
            <input
              className="login-input"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <button className="login-submit" type="submit">
            REGISTER
          </button>

          {error && <div className="login-error">{error}</div>}

          <div className="login-footer">
            <a
              className="login-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
            >
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
