import { cpMultipliers, gameData, Move, typeEffectiveness } from './data';

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

export const calculateMoveEffectiveness = (attackType: string, pokemonTypes: string[]): number => {
  let baseEffectiveness = 1;
  let attackTE = typeEffectiveness.filter((type) => type.name === attackType)[0];
  for(let type of pokemonTypes) {
    if(attackTE.immunes.includes(type)) {
      baseEffectiveness *= 0.390625;
    } else if(attackTE.weaknesses.includes(type)) {
      baseEffectiveness *= 0.625;
    } else if (attackTE.strengths.includes(type)) {
      baseEffectiveness *= 1.6;
    }
  }
  return baseEffectiveness;
};