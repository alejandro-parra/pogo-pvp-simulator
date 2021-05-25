import { cpMultipliers, gameData, Move, PokemonInfo } from './data';
import { Pokemon } from './Pokemon';

export const getCpMultiplier = (level: number): number => {
  return cpMultipliers[level*2-2];
}

export const truncateOneDecimal = (numToTruncate: number): number => {
  let truncatedNumber = Math.trunc(numToTruncate*10);
  return truncatedNumber / 10;
}

export const searchAttack = (attackName: string): Move => {
  return gameData.moves.filter((move) => move.name === attackName)[0];
}

export const orderedPokemonList = ():PokemonInfo[] => {
  return gameData.pokemon.sort((pokemon1,pokemon2) => {
    if(pokemon1.speciesId < pokemon2.speciesId) {
      return -1;
    } else if(pokemon1.speciesId > pokemon2.speciesId) {
      return 1;
    }
    return 0;
  })
}