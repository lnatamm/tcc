import React from 'react';
import { useCreateTurma, useUpdateTurma, useDeleteTurma } from '../hooks/useApi';

/**
 * Exemplo de como usar React Query Mutations
 * 
 * Este componente demonstra:
 * - useCreateTurma - Criar nova turma
 * - useUpdateTurma - Atualizar turma existente
 * - useDeleteTurma - Deletar turma
 */

const ExemploMutations = () => {
  const createTurma = useCreateTurma();
  const updateTurma = useUpdateTurma();
  const deleteTurma = useDeleteTurma();

  const handleCriarTurma = () => {
    createTurma.mutate({
      nome: "Nova Turma",
      id_treinador: 1,
      id_esporte: 1,
      foto_path: "/images/turma.jpg"
    }, {
      onSuccess: (data) => {
        console.log('Turma criada:', data);
      },
      onError: (error) => {
        console.error('Erro ao criar turma:', error);
      }
    });
  };

  const handleAtualizarTurma = (turmaId) => {
    updateTurma.mutate({
      id: turmaId,
      data: {
        nome: "Turma Atualizada"
      }
    }, {
      onSuccess: (data) => {
        console.log('Turma atualizada:', data);
      },
      onError: (error) => {
        console.error('Erro ao atualizar turma:', error);
      }
    });
  };

  const handleDeletarTurma = (turmaId) => {
    deleteTurma.mutate(turmaId, {
      onSuccess: () => {
        console.log('Turma deletada com sucesso');
      },
      onError: (error) => {
        console.error('Erro ao deletar turma:', error);
      }
    });
  };

  return (
    <div>
      <h2>Exemplo de Mutations</h2>
      
      <button 
        onClick={handleCriarTurma}
        disabled={createTurma.isPending}
      >
        {createTurma.isPending ? 'Criando...' : 'Criar Turma'}
      </button>

      <button 
        onClick={() => handleAtualizarTurma(1)}
        disabled={updateTurma.isPending}
      >
        {updateTurma.isPending ? 'Atualizando...' : 'Atualizar Turma'}
      </button>

      <button 
        onClick={() => handleDeletarTurma(1)}
        disabled={deleteTurma.isPending}
      >
        {deleteTurma.isPending ? 'Deletando...' : 'Deletar Turma'}
      </button>

      {createTurma.isError && (
        <p style={{ color: 'red' }}>Erro: {createTurma.error.message}</p>
      )}
    </div>
  );
};

export default ExemploMutations;
