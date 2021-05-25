import { gameData, Move, PokemonInfo, TypeOfMove } from './data';
import { MoveSelector } from './MoveSelector';
import { Pokebattle } from './Pokebattle';
import { getCpMultiplier, searchAttack, truncateOneDecimal, calculateMoveEffectiveness } from './Utilities';

export enum Stat {
  atk,
  def
}

export class Pokemon {
  data: PokemonInfo;
  moveSelector: MoveSelector;

  constructor(speciesId: string, level: number, atkIV: number, defIV: number, hpIV: number, fastMove: string, chargedMoves: string[], shields: number) {
    this.data = gameData.pokemon.filter((pokemon) => pokemon.speciesId === speciesId)[0];
    this.data.level = level;
    this.data.atkIV = atkIV;
    this.data.defIV = defIV;
    this.data.hpIV = hpIV;
    this.data.currentFastMove = searchAttack(fastMove);
    this.data.currentFastMove.typeOfMove = TypeOfMove.fast;
    this.data.currentChargedMoves = chargedMoves
    .map((move) => searchAttack(move))
    .map((move) => { move.typeOfMove = TypeOfMove.charged; return move });
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

  isMoveCharged = (index: number): boolean => {
    if(index > 0 && this.data.currentChargedMoves.length == 1){
      return false;
    }

    return this.data.energy >= this.data.currentChargedMoves[index].energy;
  }

  calculateAttackDamage(attack: number, opposingPokemon: Pokemon): number {
    let move;
    if(attack == -1){
      move = this.data.currentMove;
    } else if(attack == 0){
      move = this.data.currentFastMove;
    } else if(attack == 1){
      move = this.data.currentChargedMoves[0];
    } else if(attack == 2 && this.data.currentChargedMoves.length > 1){
      move = this.data.currentChargedMoves[1];
    }
    const hasStab = this.data.types.includes(move.type);
    const stab = hasStab ? 1.2 : 1;
    const bonusMultiplier = 1.3;
    return Math.floor(0.5 * move.power * ( this.getStat(Stat.atk) / opposingPokemon.getStat(Stat.def)) * stab * calculateMoveEffectiveness(move.type, opposingPokemon.data.types) * bonusMultiplier) + 1;
  };

  getLowerEnergyMove(): number {
    if(this.data.currentChargedMoves.length == 1){
      return 1;
    }
    if(this.data.currentChargedMoves[0].energy <= this.data.currentChargedMoves[1].energy){
      return 1;
    } else {
      return 2;
    }
  }

  setMoveSelector(defendingPokemon: Pokemon, pokeBattle: Pokebattle): void {
    this.moveSelector = new MoveSelector(this, defendingPokemon, pokeBattle);
  }

  decideNextMove(): void{
    this.data.currentMove = this.moveSelector.decideNextMove();
    this.data.currentMove.elapsed = 0;
  }

  decideShield(): boolean {
    return this.moveSelector.decideShield();
  }

}


















