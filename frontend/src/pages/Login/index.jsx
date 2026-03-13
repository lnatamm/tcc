import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import Background from '../../assets/Background.png';
import Logo from '../../assets/Logo.png';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Preencha usuário e senha.');
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        identifier: username,
        senha: password,
      });

      login(response.data);
      navigate('/home');
    } catch (err) {
      const message = err?.response?.data?.detail || 'Falha ao fazer login.';
      setError(message);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${Background})` }}>
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

          <button className="login-submit" type="submit">
            ENTRAR
          </button>

          {error && <div className="login-error">{error}</div>}

          <div className="login-footer">
            <a
              className="login-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}
            >
              Crie sua conta
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
