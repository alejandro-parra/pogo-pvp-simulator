import { gameData, PokemonInfo, TypeOfMove } from './data';
import { getCpMultiplier, searchAttack, truncateOneDecimal } from './Utilities';

export enum Stat {
  atk,
  def
}

export class Pokemon {
  data: PokemonInfo;

  constructor(speciesId: string, level: number, atkIV: number, defIV: number, hpIV: number, fastMove: string, chargedMoves: string[], shields: number) {
    this.data = gameData.pokemon.filter((pokemon) => pokemon.speciesId === speciesId)[0];
    this.data.level = level;
    this.data.atkIV = atkIV;
    this.data.defIV = defIV;
    this.data.hpIV = hpIV;
    this.data.currentFastMove = {...searchAttack(fastMove), typeOfMove: TypeOfMove.fast};
    this.data.currentChargedMoves = chargedMoves.map((move) => {return {...searchAttack(move), typeOfMove: TypeOfMove.charged}});
    this.data.shields = shields;
    this.data.currentMove = null;
    this.data.energy = 0;
    this.data.buffs = [0,0];
    this.calculateCP();
    this.calculateStatsAtLevel();
  }

  calculateCP(): void {
    const weightedAttack = this.data.baseStats.atk+this.data.atkIV;
    const weightedDefense = Math.sqrt(this.data.baseStats.def+this.data.defIV);
    const weightedHp = Math.sqrt(this.data.baseStats.hp+this.data.hpIV);
    const cpMultiplier = getCpMultiplier(this.data.level);
    const weightedCpMultiplier = Math.pow(cpMultiplier, 2);
    const unFlooredCP = weightedAttack * weightedDefense * weightedHp * weightedCpMultiplier * 0.1
    this.data.cp = Math.max(Math.floor(unFlooredCP), 10);
  }

  calculateStatsAtLevel(): void {
    const result = [];
    const cpMultiplier = getCpMultiplier(this.data.level);
    result.push(truncateOneDecimal(cpMultiplier * (this.data.baseStats.atk+this.data.atkIV)));
    result.push(truncateOneDecimal(cpMultiplier * (this.data.baseStats.def+this.data.defIV)));
    result.push(Math.floor(cpMultiplier * (this.data.baseStats.hp+this.data.hpIV)));
    this.data.atk = result[0];
    this.data.def = result[1];
    this.data.hp = result[2];
    this.data.currentHp = result[2];
  };

  isShadow(): boolean {
    return this.data.speciesId.endsWith('_shadow') ? true : false;
  };

  getStat(stat: Stat): number {
    switch(stat) {
      case Stat.atk:
        return this.data.atk * (this.isShadow() ? (1.2) : 1) * this.getBuffMultiplier(Stat.atk);
      case Stat.def:
        return this.data.def * (this.isShadow() ? (5/6) : 1) * this.getBuffMultiplier(Stat.def);
    }
  }

  getBuffMultiplier = (stat: Stat): number => {
    const statToCheck = this.data.buffs[stat];
    if(statToCheck > 0) {
      return (4 + statToCheck) / 4;
    } else{
      return 4 / (4 - statToCheck);
    }
  }
}


















