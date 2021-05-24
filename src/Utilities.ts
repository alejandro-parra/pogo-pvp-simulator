import { cpMultipliers, gameData, Move } from './data';

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