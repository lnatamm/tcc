import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './style.css';
import logo from '../../assets/Logo.png';
import { authService } from '../../services/apiService';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    usuario: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações básicas
    if (!formData.nome.trim() || !formData.usuario.trim() || !formData.email.trim() || !formData.senha.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(
        formData.usuario,
        formData.email,
        formData.nome,
        formData.senha
      );

      if (response && response.data) {
        setSuccess('Conta criada com sucesso! Redirecionando para login...');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-logo">
          <img src={logo} alt="Athlestiscs Logo" />
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="nome">NOME COMPLETO</label>
            <input
              type="text"
              id="nome"
              name="nome"
              placeholder="Digite seu nome"
              value={formData.nome}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="usuario">USUÁRIO</label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              placeholder="Escolha um usuário"
              value={formData.usuario}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Digite seu email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">SENHA</label>
            <input
              type="password"
              id="senha"
              name="senha"
              placeholder="Digite sua senha"
              value={formData.senha}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">CONFIRMAR SENHA</label>
            <input
              type="password"
              id="confirmarSenha"
              name="confirmarSenha"
              placeholder="Confirme sua senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'CRIANDO...' : 'CRIAR CONTA'}
          </button>
        </form>

        <div className="register-footer">
          <Link to="/login">Voltar para login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
