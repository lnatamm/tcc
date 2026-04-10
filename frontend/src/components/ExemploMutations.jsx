import React from 'react';
import { useCreateTurma, useUpdateTurma, useDeleteTurma } from '../hooks/useApi';

/**
 * Example of how to use React Query mutations
 * 
 * This component demonstrates:
 * - useCreateTurma - Create a new team
 * - useUpdateTurma - Update an existing team
 * - useDeleteTurma - Delete a team
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
        console.log('Team created:', data);
      },
      onError: (error) => {
        console.error('Error creating team:', error);
      }
    });
  };

  const handleAtualizarTurma = (turmaId) => {
    updateTurma.mutate({
      id: turmaId,
      data: {
        nome: "Updated Team"
      }
    }, {
      onSuccess: (data) => {
        console.log('Team updated:', data);
      },
      onError: (error) => {
        console.error('Error updating team:', error);
      }
    });
  };

  const handleDeletarTurma = (turmaId) => {
    deleteTurma.mutate(turmaId, {
      onSuccess: () => {
        console.log('Team deleted successfully');
      },
      onError: (error) => {
        console.error('Error deleting team:', error);
      }
    });
  };

  return (
    <div>
      <h2>Mutation Example</h2>
      
      <button 
        onClick={handleCriarTurma}
        disabled={createTurma.isPending}
      >
        {createTurma.isPending ? 'Creating...' : 'Create Team'}
      </button>

      <button 
        onClick={() => handleAtualizarTurma(1)}
        disabled={updateTurma.isPending}
      >
        {updateTurma.isPending ? 'Updating...' : 'Update Team'}
      </button>

      <button 
        onClick={() => handleDeletarTurma(1)}
        disabled={deleteTurma.isPending}
      >
        {deleteTurma.isPending ? 'Deleting...' : 'Delete Team'}
      </button>

      {createTurma.isError && (
        <p style={{ color: 'red' }}>Error: {createTurma.error.message}</p>
      )}
    </div>
  );
};

export default ExemploMutations;
