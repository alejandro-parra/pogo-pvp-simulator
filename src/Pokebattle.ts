import { BuffTarget, Move, typeEffectiveness, TypeOfMove } from './data';
import { Pokemon, Stat } from './Pokemon';
import { calculateMoveEffectiveness } from './Utilities';


export class Pokebattle {
  results?: any;
  pokemon1: Pokemon;
  pokemon2: Pokemon;
  firstKO: Pokemon;

  constructor(pokemon1: Pokemon, pokemon2: Pokemon) {
    this.pokemon1 = pokemon1;
    this.pokemon2 = pokemon2;

    this.pokemon1.setMoveSelector(this.pokemon2, this);
    this.pokemon2.setMoveSelector(this.pokemon1, this);

    this.firstKO = null;
  }


  battle(): void {
    let timeElapsed = 0;
    while(timeElapsed < 240000) {

      if(this.pokemon1.data.currentMove && this.pokemon2.data.currentMove && this.pokemon1.data.currentMove.elapsed + 500 >= this.pokemon1.data.currentMove.cooldown && this.pokemon2.data.currentMove.elapsed + 500 >= this.pokemon2.data.currentMove.cooldown && this.pokemon1.moveSelector.moveKills(TypeOfMove.fast.valueOf()) && this.pokemon2.moveSelector.moveKills(TypeOfMove.fast.valueOf())){
        this.registerAttack(this.pokemon1, this.pokemon2);
        this.registerAttack(this.pokemon2, this.pokemon1);
        this.firstKO = null;
        timeElapsed += 500;
        break;
      }

      if(this.pokemon1.data.currentMove) {
        this.pokemon1.data.currentMove.elapsed += 500;
        if(this.pokemon1.data.currentMove.elapsed >= this.pokemon1.data.currentMove.cooldown) {
          this.registerAttack(this.pokemon1, this.pokemon2);
        }
      }
      if(this.pokemon2.data.currentMove) {
        this.pokemon2.data.currentMove.elapsed += 500;
        if(this.pokemon2.data.currentMove.elapsed >= this.pokemon2.data.currentMove.cooldown) {
          this.registerAttack(this.pokemon2, this.pokemon1);
        }
      }
      
      if(!this.pokemon1.data.currentMove) {
        this.pokemon1.decideNextMove();
      }
      if(!this.pokemon2.data.currentMove) {
        this.pokemon2.decideNextMove();
      }

      //console.log("=========================");
      console.log("Nuevo turno: " + (timeElapsed / 500));
      //console.log("PKMN1 HP: " + this.pokemon1.data.currentHp);
      //console.log("PKMN2 HP: " + this.pokemon2.data.currentHp);
      //console.log("PKMN1 move: " + this.pokemon1.data.currentMove.name);
      //console.log("PKMN2 move: " + this.pokemon2.data.currentMove.name);
      //console.log("=========================");
  
      if(this.pokemon1.data.currentMove && this.pokemon2.data.currentMove && this.pokemon1.data.currentMove.typeOfMove === TypeOfMove.charged && this.pokemon2.data.currentMove.typeOfMove === TypeOfMove.charged) {
        if(this.pokemon1.data.atk > this.pokemon2.data.atk){
          this.registerAttack(this.pokemon1, this.pokemon2);
          this.registerAttack(this.pokemon2, this.pokemon1);
        } else if (this.pokemon1.data.atk < this.pokemon2.data.atk){
          this.registerAttack(this.pokemon2, this.pokemon1);
          this.registerAttack(this.pokemon1, this.pokemon2);
        } else{
          const rand = Math.random();
          if(rand > 0.5){
            this.registerAttack(this.pokemon1, this.pokemon2);
            this.registerAttack(this.pokemon2, this.pokemon1);
          } else{
            this.registerAttack(this.pokemon2, this.pokemon1);
            this.registerAttack(this.pokemon1, this.pokemon2);
          }
        }
      } else if(this.pokemon1.data.currentMove && this.pokemon1.data.currentMove.typeOfMove === TypeOfMove.charged) {
        this.registerAttack(this.pokemon1, this.pokemon2);
      } else if(this.pokemon2.data.currentMove && this.pokemon2.data.currentMove.typeOfMove === TypeOfMove.charged) {
        this.registerAttack(this.pokemon2, this.pokemon1);
      }

      // añadimos el tiempo al contador global
      timeElapsed += 500;

        
      if(this.firstKO){
        break;
      }
    }

    console.log(this.firstKO);
    console.log(timeElapsed / 500);
    console.log("Durant Buffs: " + this.pokemon1.data.buffs);
    console.log("Blissey Buffs: " + this.pokemon2.data.buffs);
    console.log("Durant HP: " + this.pokemon1.data.currentHp);
    console.log("Blissey HP: " + this.pokemon2.data.currentHp);

  };
  
  damageEfficiency(attackingPokemon: Pokemon, attack: Move, defendingPokemon: Pokemon): number {
    return this.calculateAttackDamage(attackingPokemon, attack, defendingPokemon) / attack.energy;
  };
  
  calculateAttackDamage(attackingPokemon: Pokemon, attack: Move, opposingPokemon: Pokemon): number {
    const hasStab = attackingPokemon.data.types.includes(attack.type);
    const stab = hasStab ? 1.2 : 1;
    const bonusMultiplier = 1.3;
    return Math.floor(0.5 * attack.power * ( attackingPokemon.getStat(Stat.atk) / opposingPokemon.getStat(Stat.def)) * stab * calculateMoveEffectiveness(attack.type, opposingPokemon.data.types) * bonusMultiplier) + 1;
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

  
  registerAttack(attackingPokemon: Pokemon, defendingPokemon: Pokemon): void {
    const move = attackingPokemon.data.currentMove;

    if(move.typeOfMove == TypeOfMove.fast){
      attackingPokemon.data.energy += move.energyGain;
      defendingPokemon.data.currentHp -= Math.min(this.calculateAttackDamage(attackingPokemon, move, defendingPokemon), defendingPokemon.data.currentHp);
      this.pokemonFainted(defendingPokemon);

    } else{
      console.log(attackingPokemon.data.speciesName + " used " + move.name);
      attackingPokemon.data.energy -= move.energy;
      
      if(defendingPokemon.decideShield()){
        defendingPokemon.data.currentHp -= 1;
        defendingPokemon.data.shields -= 1;
        this.pokemonFainted(defendingPokemon);
      } else{
        defendingPokemon.data.currentHp -= Math.min(this.calculateAttackDamage(attackingPokemon, move, defendingPokemon), defendingPokemon.data.currentHp);
        this.pokemonFainted(defendingPokemon);
      }

      if(move.buffs){
        const rand = 1 - Math.random();
        if(parseFloat(move.buffApplyChance) >= rand){
          const bt = (move.buffTarget === BuffTarget.self ? attackingPokemon : defendingPokemon);
          for(var i = 0; i < 2; i++){
            bt.data.buffs[i] = Math.min(Math.max(bt.data.buffs[i] + move.buffs[i], -4), 4);
          }
        }
      }

      if(defendingPokemon.data.currentMove && defendingPokemon.data.currentMove.typeOfMove === TypeOfMove.fast && defendingPokemon.data.currentMove.elapsed > 0){
        this.registerAttack(defendingPokemon, attackingPokemon);
      }

    }

    attackingPokemon.data.currentMove = null;
  }

  pokemonFainted(pokemon: Pokemon): void {
    if(pokemon.data.currentHp == 0 && !this.firstKO) {
      this.firstKO = pokemon;
    }
  }

}