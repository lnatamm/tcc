import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../../assets/Background.png';
import Logo from '../../assets/Logo.png';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

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
      setError('Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const typeId = userTypes?.find((t) => t?.name === profileType)?.id;
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
      const message = err?.response?.data?.detail || 'Falha ao cadastrar.';
      setError(message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img className="login-logo" src={Logo} alt="Athletrics" />

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            Usuário
            <input
              className="login-input"
              type="text"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Nome
            <input
              className="login-input"
              type="text"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            E-mail
            <input
              className="login-input"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Perfil
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
            >
              <option value="athlete">Aluno</option>
              <option value="coach">Professor</option>
            </select>
          </label>

          {profileType === 'coach' && (
            <label className="login-label">
              Nível
              <select
                className="login-input"
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                required
              >
                <option value="">Selecione um nível</option>
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="login-label">
            Senha
            <input
              className="login-input"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Confirmar senha
            <input
              className="login-input"
              type="password"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <button className="login-submit" type="submit">
            CADASTRAR
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
              Já tem conta? Faça login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
