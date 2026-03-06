import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './style.css';
import logo from '../../assets/Logo.png';
import { authService } from '../../services/apiService';

const Login = ({ setAuth }) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!usuario.trim() || !senha.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(usuario, senha);
      
      if (response && response.data) {
        // Armazenar token e dados do usuário
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setSuccess('Login realizado com sucesso!');
        setAuth(true);
        
        // Redirecionar para a página principal após 1 segundo
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="Athlestiscs Logo" />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="usuario">USUÁRIO</label>
            <input
              type="text"
              id="usuario"
              placeholder="Digite seu usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'CARREGANDO...' : 'ENTRAR'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/register">Criar sua conta</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
