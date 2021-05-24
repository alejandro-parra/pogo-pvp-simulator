import { BuffTarget, Move, typeEffectiveness, TypeOfMove } from './data';
import { Pokemon, Stat } from './Pokemon';

export class Pokebattle {
  results?: any;
  pokemon1: Pokemon;
  pokemon2: Pokemon;

  constructor(pokemon1: Pokemon, pokemon2: Pokemon) {
    this.pokemon1 = pokemon1;
    this.pokemon2 = pokemon2;
  }


  battle(): void {
    let timeElapsed = 0;
    while(timeElapsed < 240000) {
  
      if(this.pokemon1.data.currentMove) {
        this.pokemon1.data.currentMove.elapsed += 500;
        if(this.pokemon1.data.currentMove.elapsed >= this.pokemon1.data.currentMove.cooldown) {
          this.pokemon2.data.currentHp -= this.calculateAttackDamage(this.pokemon1, this.pokemon1.data.currentMove, this.pokemon2);
          this.pokemon1.data.currentMove = null;
        }
      }
      if(this.pokemon2.data.currentMove) {
        this.pokemon2.data.currentMove.elapsed += 500;
        if(this.pokemon2.data.currentMove.elapsed >= this.pokemon2.data.currentMove.cooldown) {
          this.pokemon1.data.currentHp -= this.calculateAttackDamage(this.pokemon2, this.pokemon2.data.currentMove, this.pokemon1);
          this.pokemon2.data.currentMove = null;
        }
      }
      
      if(!this.pokemon1.data.currentMove) {
        // this.pokemon1.data.currentMove = decideNextMove(this.pokemon1, this.pokemon2);
      }
      if(!this.pokemon2.data.currentMove) {
        // this.pokemon2.data.currentMove = decideNextMove(this.pokemon2, this.pokemon1);
      }
  
      if(this.pokemon1.data.currentMove && this.pokemon2.data.currentMove && this.pokemon1.data.currentMove.typeOfMove === TypeOfMove.charged && this.pokemon2.data.currentMove.typeOfMove === TypeOfMove.charged) {
        // ver quien ataca
        timeElapsed += 5000;
      } else if(this.pokemon1.data.currentMove && this.pokemon1.data.currentMove.typeOfMove === TypeOfMove.charged) {
        // ataca this.pokemon1, this.pokemon2 ve si usa un shield
        timeElapsed += 5000;
      } else if(this.pokemon2.data.currentMove && this.pokemon2.data.currentMove.typeOfMove === TypeOfMove.charged) {
        // ataca this.pokemon2, this.pokemon1 ve si usa un shield
        timeElapsed += 5000;
      }
  
      // añadimos el tiempo al contador global
      timeElapsed += 500;
    }
  };

  decideNextMove(attackingPokemon: Pokemon, defendingPokemon: Pokemon) {
  };
  
  damageEfficiency(attackingPokemon: Pokemon, attack: Move, defendingPokemon: Pokemon): number {
    return this.calculateAttackDamage(attackingPokemon, attack, defendingPokemon) / attack.energy;
  };
  
  calculateMoveEffectiveness(attackType: string, pokemonTypes: string[]): number {
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
  
  calculateAttackDamage(attackingPokemon: Pokemon, attack: Move, opposingPokemon: Pokemon): number {
    const hasStab = attackingPokemon.data.types.includes(attack.type);
    const stab = hasStab ? 1.2 : 1;
    const bonusMultiplier = 1.3;
    return Math.floor(0.5 * attack.power * ( attackingPokemon.getStat(Stat.atk) / opposingPokemon.getStat(Stat.def)) * stab * this.calculateMoveEffectiveness(attack.type, opposingPokemon.data.types) * bonusMultiplier) + 1;
  };
  
  maxDamageInTurns(attackingPokemon: Pokemon, defendingPokemon: Pokemon, turns: number): number {
    let timeLeft = turns * 500;
    let maxDamage = 0;
    let currentEnergy = attackingPokemon.data.energy;
   
    if(attackingPokemon.data.currentMove && timeLeft >= (attackingPokemon.data.currentMove.cooldown - attackingPokemon.data.currentMove.elapsed)){
      timeLeft -= (attackingPokemon.data.currentMove.cooldown - attackingPokemon.data.currentMove.elapsed);
      maxDamage += this.calculateAttackDamage(attackingPokemon, attackingPokemon.data.currentMove, defendingPokemon);
      currentEnergy += attackingPokemon.data.currentMove.energyGain;
    }
  
    maxDamage += this.chargedDamage(attackingPokemon, defendingPokemon, timeLeft, currentEnergy);
  
    return maxDamage
  }
  
  chargedDamage(attackingPokemon: Pokemon, defendingPokemon: Pokemon, timeLeft: number, currentEnergy: number): number {
    let damage1 = this.chargedDamage2(attackingPokemon,defendingPokemon,timeLeft,currentEnergy,attackingPokemon.data.currentChargedMoves[0]);
    let damage2 = 0
    if(attackingPokemon.data.currentChargedMoves.length > 1){
       damage2 += this.chargedDamage2(attackingPokemon,defendingPokemon,timeLeft,currentEnergy,attackingPokemon.data.currentChargedMoves[1]);
    }
    return Math.max(damage1,damage2);
  }
  
  chargedDamage2(attackingPokemon: Pokemon, defendingPokemon: Pokemon, timeLeft: number, currentEnergy: number, move: Move): number {
    const atkBuffs = attackingPokemon.data.buffs;
    const defBuffs = defendingPokemon.data.buffs;
    let baseDamage = 0;
    while(currentEnergy < move.energy && timeLeft > 0 && timeLeft >= attackingPokemon.data.currentFastMove.cooldown){
      timeLeft -= attackingPokemon.data.currentFastMove.cooldown;
      baseDamage += this.calculateAttackDamage(attackingPokemon, attackingPokemon.data.currentFastMove, defendingPokemon);
      currentEnergy += attackingPokemon.data.currentFastMove.energyGain;
    }
  
    if(currentEnergy >= move.energy){
      baseDamage += this.calculateAttackDamage(attackingPokemon, move, defendingPokemon);
      currentEnergy -= move.energy;
      if(move.buffs && move.buffApplyChance === '1'){
        const bt = move.buffTarget === BuffTarget.self ? attackingPokemon : defendingPokemon;
        for(var i = 0; i < 2; i++){
          bt.data.buffs[i] = Math.min(Math.max(bt.data.buffs[i] + move.buffs[i], -4), 4);
        }
      }
    }
  
    let damage1 = baseDamage;
    let damage2 = baseDamage;
  
    if(timeLeft > 0 && timeLeft >= attackingPokemon.data.currentFastMove.cooldown){
      damage1 += this.chargedDamage2(attackingPokemon,defendingPokemon,timeLeft,currentEnergy,attackingPokemon.data.currentChargedMoves[0]);
      if(attackingPokemon.data.currentChargedMoves.length > 1){
        damage2 += this.chargedDamage2(attackingPokemon,defendingPokemon,timeLeft,currentEnergy,attackingPokemon.data.currentChargedMoves[1]);
      }
    }
  
    attackingPokemon.data.buffs = atkBuffs;
    defendingPokemon.data.buffs = defBuffs;
  
    return Math.max(damage1,damage2);
  }
}