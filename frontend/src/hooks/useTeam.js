import { useState, useCallback } from 'react';

/**
 * Custom hook for team state management
 */
export function useTeam(initialTeam = []) {
  const [team, setTeam] = useState(initialTeam);

  const addPokemon = useCallback((pokemon, slot) => {
    const newTeam = [...team];
    const targetSlot = Math.min(slot, newTeam.length);

    newTeam[targetSlot] = {
      pokemon,
      moves: [],
      ability: pokemon.abilities[0]?.name || '',
      nature: 'Timid',
      item: ''
    };
    setTeam(newTeam);
  }, [team]);

  const removePokemon = useCallback((slot) => {
    const newTeam = team.filter((_, idx) => idx !== slot);
    setTeam(newTeam);
  }, [team]);

  const setMoves = useCallback((slot, moves) => {
    const newTeam = [...team];
    if (newTeam[slot]) {
      newTeam[slot].moves = moves.slice(0, 4); // Max 4 moves
    }
    setTeam(newTeam);
  }, [team]);

  const setAbility = useCallback((slot, ability) => {
    const newTeam = [...team];
    if (newTeam[slot]) {
      newTeam[slot].ability = ability;
    }
    setTeam(newTeam);
  }, [team]);

  const setNature = useCallback((slot, nature) => {
    const newTeam = [...team];
    if (newTeam[slot]) {
      newTeam[slot].nature = nature;
    }
    setTeam(newTeam);
  }, [team]);

  const setItem = useCallback((slot, item) => {
    const newTeam = [...team];
    if (newTeam[slot]) {
      newTeam[slot].item = item;
    }
    setTeam(newTeam);
  }, [team]);

  const swapSlots = useCallback((fromSlot, toSlot) => {
    const newTeam = [...team];
    [newTeam[fromSlot], newTeam[toSlot]] = [newTeam[toSlot], newTeam[fromSlot]];
    setTeam(newTeam);
  }, [team]);

  const clearTeam = useCallback(() => {
    setTeam([]);
  }, []);

  return {
    team,
    addPokemon,
    removePokemon,
    setMoves,
    setAbility,
    setNature,
    setItem,
    swapSlots,
    clearTeam
  };
}

export default useTeam;
