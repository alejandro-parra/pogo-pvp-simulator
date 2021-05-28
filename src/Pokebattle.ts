import { BuffTarget, Move, typeEffectiveness, TypeOfMove } from './data';
import { Pokemon, Stat } from './Pokemon';
import { calculateMoveEffectiveness } from './Utilities';

interface Turn {
  pokemon1Attack?: string;
  pokemon1AttackType?: string;
  pokemon1AttackTypeOfMove?: TypeOfMove;
  pokemon1AttackDamage?: number;
  pokemon1Shielded?: boolean;
  pokemon1Shields: number;
  pokemon2Attack?: string;
  pokemon2AttackType?: string;
  pokemon2AttackTypeOfMove?: TypeOfMove;
  pokemon2AttackDamage?: number;
  pokemon2Shielded?: boolean;
  pokemon2Shields: number;
  pokemon1Hp: number;
  pokemon2Hp: number;
  pokemon1Energy: number;
  pokemon2Energy: number;
  pokemon1Buffs?: number[];
  pokemon2Buffs?: number[];
}

export class Pokebattle {
  results: Turn[];
  pokemon1: Pokemon;
  pokemon2: Pokemon;
  firstKO: Pokemon;

  constructor(pokemon1: Pokemon, pokemon2: Pokemon) {
    this.pokemon1 = pokemon1;
    this.pokemon1.data = JSON.parse(JSON.stringify(pokemon1.data));
    this.pokemon2 = pokemon2;
    this.pokemon2.data = JSON.parse(JSON.stringify(pokemon2.data));

    if(pokemon1.data.currentChargedMoves.length > 1){
      console.log(pokemon1.data.currentChargedMoves.sort((a, b) => (this.damageEfficiency(pokemon1, a, pokemon2) > this.damageEfficiency(pokemon1, b, pokemon2) ? 1 : -1)));
    }

    if(pokemon2.data.currentChargedMoves.length > 1){
      console.log(pokemon2.data.currentChargedMoves.sort((a, b) => (this.damageEfficiency(pokemon2, a, pokemon1) > this.damageEfficiency(pokemon2, b, pokemon1) ? 1 : -1)));
    }

    this.pokemon1.setMoveSelector(this.pokemon2, this);
    this.pokemon2.setMoveSelector(this.pokemon1, this);

    this.firstKO = null;
    this.results = [];
  }


  battle(): void {
    let timeElapsed = 0;
    this.results.push({
      pokemon1Energy: 0,
      pokemon1Hp: this.pokemon1.data.hp,
      pokemon1Shields: this.pokemon1.data.shields,
      pokemon2Energy: 0,
      pokemon2Hp: this.pokemon2.data.hp,
      pokemon2Shields: this.pokemon2.data.shields
    })
    while(timeElapsed < 240000) {
      if(this.pokemon1.data.currentMove && this.pokemon2.data.currentMove && this.pokemon1.data.currentMove.elapsed + 500 >= this.pokemon1.data.currentMove.cooldown && this.pokemon2.data.currentMove.elapsed + 500 >= this.pokemon2.data.currentMove.cooldown && this.pokemon1.moveSelector.moveKills(TypeOfMove.fast.valueOf()) && this.pokemon2.moveSelector.moveKills(TypeOfMove.fast.valueOf())){
        this.results.push({
          pokemon1Hp: 0,
          pokemon2Hp: 0,
          pokemon1Energy: this.pokemon1.data.energy,
          pokemon2Energy: this.pokemon2.data.energy,
          pokemon1Attack: this.pokemon1.data.currentMove.name,
          pokemon2Attack: this.pokemon2.data.currentMove.name,
          pokemon1AttackType: this.pokemon1.data.currentMove.type,
          pokemon2AttackType: this.pokemon2.data.currentMove.type,
          pokemon1AttackDamage: this.results[this.results.length-1].pokemon2Hp,
          pokemon2AttackDamage: this.results[this.results.length-1].pokemon1Hp,
          pokemon1AttackTypeOfMove: TypeOfMove.fast,
          pokemon2AttackTypeOfMove: TypeOfMove.fast,
          pokemon1Shields: this.pokemon1.data.shields,
          pokemon2Shields: this.pokemon2.data.shields
        });
        this.registerAttack(this.pokemon1, this.pokemon2);
        this.registerAttack(this.pokemon2, this.pokemon1);
        this.firstKO = null;
        timeElapsed += 500;
        break;
      }

      //console.log("PKMN1 move: " + this.pokemon1.data.currentMove);
      //console.log("PKMN2 move: " + this.pokemon2.data.currentMove);
      let newTurn: Turn = {
        pokemon1Hp: this.pokemon1.data.currentHp,
        pokemon2Hp: this.pokemon2.data.currentHp,
        pokemon1Energy: this.pokemon1.data.energy,
        pokemon2Energy: this.pokemon2.data.energy,
        pokemon1Shields: this.pokemon1.data.shields,
        pokemon2Shields: this.pokemon2.data.shields
      }
      if(this.pokemon1.data.currentMove) {
        this.pokemon1.data.currentMove.elapsed += 500;
        if(this.pokemon1.data.currentMove.elapsed >= this.pokemon1.data.currentMove.cooldown) {
          newTurn = {
            ...newTurn,
            pokemon1Attack: this.pokemon1.data.currentMove.name,
            pokemon1AttackType: this.pokemon1.data.currentMove.type,
            pokemon1AttackDamage: this.calculateMoveDamage(this.pokemon1, this.pokemon1.data.currentMove, this.pokemon2),
            pokemon1AttackTypeOfMove: TypeOfMove.fast,
          };
          this.registerAttack(this.pokemon1, this.pokemon2);
          newTurn.pokemon1Energy = this.pokemon1.data.energy;
          newTurn.pokemon2Hp = this.pokemon2.data.currentHp;
        }
      }
      if(this.pokemon2.data.currentMove) {
        this.pokemon2.data.currentMove.elapsed += 500;
        if(this.pokemon2.data.currentMove.elapsed >= this.pokemon2.data.currentMove.cooldown) {
          newTurn = {
            ...newTurn,
            pokemon2Attack: this.pokemon2.data.currentMove.name,
            pokemon2AttackType: this.pokemon2.data.currentMove.type,
            pokemon2AttackDamage: this.calculateMoveDamage(this.pokemon2, this.pokemon2.data.currentMove, this.pokemon1),
            pokemon2AttackTypeOfMove: TypeOfMove.fast,
          };
          this.registerAttack(this.pokemon2, this.pokemon1);
          newTurn.pokemon2Energy = this.pokemon2.data.energy;
          newTurn.pokemon1Hp = this.pokemon1.data.currentHp;
        }
      }
      
      if(!this.pokemon1.data.currentMove) {
        this.pokemon1.decideNextMove();
      }
      if(!this.pokemon2.data.currentMove) {
        this.pokemon2.decideNextMove();
      }
      this.results.push(newTurn);

      if(this.firstKO){
        break;
      }

      //console.log("=========================");
      //console.log("Nuevo turno: " + (timeElapsed / 500));
      //console.log("PKMN1 HP: " + this.pokemon1.data.currentHp);
      //console.log("PKMN2 HP: " + this.pokemon2.data.currentHp);
      //console.log("PKMN1 move: " + this.pokemon1.data.currentMove.name);
      //console.log("PKMN2 move: " + this.pokemon2.data.currentMove.name);
      //console.log("=========================");
      let newChargedTurn: Turn = {
        pokemon1Hp: this.pokemon1.data.currentHp,
        pokemon2Hp: this.pokemon2.data.currentHp,
        pokemon1Energy: this.pokemon1.data.energy,
        pokemon2Energy: this.pokemon2.data.energy,
        pokemon1Shields: this.pokemon1.data.shields,
        pokemon2Shields: this.pokemon2.data.shields
      };

      
      if(this.pokemon1.data.currentMove && this.pokemon2.data.currentMove && this.pokemon1.data.currentMove.typeOfMove === TypeOfMove.charged && this.pokemon2.data.currentMove.typeOfMove === TypeOfMove.charged) {
        newChargedTurn = {
          ...newChargedTurn,
          pokemon1Attack: this.pokemon1.data.currentMove.name,
          pokemon1AttackType: this.pokemon1.data.currentMove.type,
          pokemon1AttackDamage: this.calculateMoveDamage(this.pokemon1, this.pokemon1.data.currentMove, this.pokemon2),
          pokemon1AttackTypeOfMove: TypeOfMove.charged,
          pokemon2Attack: this.pokemon2.data.currentMove.name,
          pokemon2AttackType: this.pokemon2.data.currentMove.type,
          pokemon2AttackDamage: this.calculateMoveDamage(this.pokemon2, this.pokemon2.data.currentMove, this.pokemon1),
          pokemon2AttackTypeOfMove: TypeOfMove.charged,
        };
        let pokemon1BuffTmp = this.pokemon1.data.buffs;
        let pokemon2BuffTmp = this.pokemon2.data.buffs;
        if(this.pokemon1.data.atk > this.pokemon2.data.atk){
          this.registerAttack(this.pokemon1, this.pokemon2);
          if (pokemon1BuffTmp !== this.pokemon1.data.buffs ) {
            newChargedTurn.pokemon1Buffs = [this.pokemon1.data.buffs[0]-pokemon1BuffTmp[0],
                                            this.pokemon1.data.buffs[1]-pokemon1BuffTmp[1]];
          }
          if ( pokemon2BuffTmp !== this.pokemon2.data.buffs ) {
            newChargedTurn.pokemon1Buffs = [this.pokemon2.data.buffs[0]-pokemon2BuffTmp[0],
                                            this.pokemon2.data.buffs[1]-pokemon2BuffTmp[1]];
          }
          pokemon1BuffTmp = this.pokemon1.data.buffs;
          pokemon2BuffTmp = this.pokemon2.data.buffs;
          this.registerAttack(this.pokemon2, this.pokemon1);
          if (pokemon1BuffTmp !== this.pokemon1.data.buffs ) {
            newChargedTurn.pokemon2Buffs = [this.pokemon1.data.buffs[0]-pokemon1BuffTmp[0],
                                            this.pokemon1.data.buffs[1]-pokemon1BuffTmp[1]];
          }
          if ( pokemon2BuffTmp !== this.pokemon2.data.buffs ) {
            newChargedTurn.pokemon2Buffs = [this.pokemon2.data.buffs[0]-pokemon2BuffTmp[0],
                                            this.pokemon2.data.buffs[1]-pokemon2BuffTmp[1]];
          }
          pokemon1BuffTmp = this.pokemon1.data.buffs;
          pokemon2BuffTmp = this.pokemon2.data.buffs;
        } else if (this.pokemon1.data.atk < this.pokemon2.data.atk){
          this.registerAttack(this.pokemon2, this.pokemon1);
          if (pokemon1BuffTmp !== this.pokemon1.data.buffs ) {
            newChargedTurn.pokemon2Buffs = [this.pokemon1.data.buffs[0]-pokemon1BuffTmp[0],
                                            this.pokemon1.data.buffs[1]-pokemon1BuffTmp[1]];
          }
          if ( pokemon2BuffTmp !== this.pokemon2.data.buffs ) {
            newChargedTurn.pokemon2Buffs = [this.pokemon2.data.buffs[0]-pokemon2BuffTmp[0],
                                            this.pokemon2.data.buffs[1]-pokemon2BuffTmp[1]];
          }
          pokemon1BuffTmp = this.pokemon1.data.buffs;
          pokemon2BuffTmp = this.pokemon2.data.buffs;
          this.registerAttack(this.pokemon1, this.pokemon2);
          if (pokemon1BuffTmp !== this.pokemon1.data.buffs ) {
            newChargedTurn.pokemon1Buffs = [this.pokemon1.data.buffs[0]-pokemon1BuffTmp[0],
                                            this.pokemon1.data.buffs[1]-pokemon1BuffTmp[1]];
          }
          if ( pokemon2BuffTmp !== this.pokemon2.data.buffs ) {
            newChargedTurn.pokemon1Buffs = [this.pokemon2.data.buffs[0]-pokemon2BuffTmp[0],
                                            this.pokemon2.data.buffs[1]-pokemon2BuffTmp[1]];
          }
          pokemon1BuffTmp = this.pokemon1.data.buffs;
          pokemon2BuffTmp = this.pokemon2.data.buffs;
        } else{
          const rand = Math.random();
          if(rand > 0.5){
            
            this.registerAttack(this.pokemon1, this.pokemon2);
            if (pokemon1BuffTmp !== this.pokemon1.data.buffs ) {
              newChargedTurn.pokemon1Buffs = [this.pokemon1.data.buffs[0]-pokemon1BuffTmp[0],
                                              this.pokemon1.data.buffs[1]-pokemon1BuffTmp[1]];
            }
            if ( pokemon2BuffTmp !== this.pokemon2.data.buffs ) {
              newChargedTurn.pokemon1Buffs = [this.pokemon2.data.buffs[0]-pokemon2BuffTmp[0],
                                              this.pokemon2.data.buffs[1]-pokemon2BuffTmp[1]];
            }
            pokemon1BuffTmp = this.pokemon1.data.buffs;
            pokemon2BuffTmp = this.pokemon2.data.buffs;
            this.registerAttack(this.pokemon2, this.pokemon1);
            if (pokemon1BuffTmp !== this.pokemon1.data.buffs ) {
              newChargedTurn.pokemon2Buffs = [this.pokemon1.data.buffs[0]-pokemon1BuffTmp[0],
                                              this.pokemon1.data.buffs[1]-pokemon1BuffTmp[1]];
            }
            if ( pokemon2BuffTmp !== this.pokemon2.data.buffs ) {
              newChargedTurn.pokemon2Buffs = [this.pokemon2.data.buffs[0]-pokemon2BuffTmp[0],
                                              this.pokemon2.data.buffs[1]-pokemon2BuffTmp[1]];
            }
            pokemon1BuffTmp = this.pokemon1.data.buffs;
            pokemon2BuffTmp = this.pokemon2.data.buffs;
          } else{
            
            this.registerAttack(this.pokemon2, this.pokemon1);
            if (pokemon1BuffTmp !== this.pokemon1.data.buffs ) {
              newChargedTurn.pokemon2Buffs = [this.pokemon1.data.buffs[0]-pokemon1BuffTmp[0],
                                              this.pokemon1.data.buffs[1]-pokemon1BuffTmp[1]];
            }
            if ( pokemon2BuffTmp !== this.pokemon2.data.buffs ) {
              newChargedTurn.pokemon2Buffs = [this.pokemon2.data.buffs[0]-pokemon2BuffTmp[0],
                                              this.pokemon2.data.buffs[1]-pokemon2BuffTmp[1]];
            }
            pokemon1BuffTmp = this.pokemon1.data.buffs;
            pokemon2BuffTmp = this.pokemon2.data.buffs;
            this.registerAttack(this.pokemon1, this.pokemon2);
            if (pokemon1BuffTmp !== this.pokemon1.data.buffs ) {
              newChargedTurn.pokemon1Buffs = [this.pokemon1.data.buffs[0]-pokemon1BuffTmp[0],
                                              this.pokemon1.data.buffs[1]-pokemon1BuffTmp[1]];
            }
            if ( pokemon2BuffTmp !== this.pokemon2.data.buffs ) {
              newChargedTurn.pokemon1Buffs = [this.pokemon2.data.buffs[0]-pokemon2BuffTmp[0],
                                              this.pokemon2.data.buffs[1]-pokemon2BuffTmp[1]];
            }
            pokemon1BuffTmp = this.pokemon1.data.buffs;
            pokemon2BuffTmp = this.pokemon2.data.buffs;
          }

        }
        newChargedTurn.pokemon1Energy = this.pokemon1.data.energy;
        newChargedTurn.pokemon2Hp = this.pokemon2.data.currentHp;
        newChargedTurn.pokemon2Energy = this.pokemon2.data.energy;
        newChargedTurn.pokemon1Hp = this.pokemon1.data.currentHp;
        newChargedTurn.pokemon1AttackDamage = this.results[this.results.length-1].pokemon2Hp - this.pokemon2.data.currentHp;
        newChargedTurn.pokemon2AttackDamage = this.results[this.results.length-1].pokemon1Hp - this.pokemon1.data.currentHp;
      } else if(this.pokemon1.data.currentMove && this.pokemon1.data.currentMove.typeOfMove === TypeOfMove.charged) {
        newChargedTurn = {
          ...newChargedTurn,
          pokemon1Attack: this.pokemon1.data.currentMove.name,
          pokemon1AttackType: this.pokemon1.data.currentMove.type,
          pokemon1AttackDamage: this.calculateMoveDamage(this.pokemon1, this.pokemon1.data.currentMove, this.pokemon2),
          pokemon1AttackTypeOfMove: TypeOfMove.charged,
        };
        let pokemon1BuffTmp = this.pokemon1.data.buffs;
        let pokemon2BuffTmp = this.pokemon2.data.buffs;
        this.registerAttack(this.pokemon1, this.pokemon2);
        if (pokemon1BuffTmp !== this.pokemon1.data.buffs ) {
          newChargedTurn.pokemon1Buffs = [this.pokemon1.data.buffs[0]-pokemon1BuffTmp[0],
                                          this.pokemon1.data.buffs[1]-pokemon1BuffTmp[1]];
        }
        if ( pokemon2BuffTmp !== this.pokemon2.data.buffs ) {
          newChargedTurn.pokemon1Buffs = [this.pokemon2.data.buffs[0]-pokemon2BuffTmp[0],
                                          this.pokemon2.data.buffs[1]-pokemon2BuffTmp[1]];
        }
        pokemon1BuffTmp = this.pokemon1.data.buffs;
        pokemon2BuffTmp = this.pokemon2.data.buffs;
        newChargedTurn.pokemon1Energy = this.pokemon1.data.energy;
        newChargedTurn.pokemon2Hp = this.pokemon2.data.currentHp;
        newChargedTurn.pokemon1AttackDamage = this.results[this.results.length-1].pokemon2Hp - this.pokemon2.data.currentHp;
      } else if(this.pokemon2.data.currentMove && this.pokemon2.data.currentMove.typeOfMove === TypeOfMove.charged) {
        newChargedTurn = {
          ...newChargedTurn,
          pokemon2Attack: this.pokemon2.data.currentMove.name,
          pokemon2AttackType: this.pokemon2.data.currentMove.type,
          pokemon2AttackDamage: this.calculateMoveDamage(this.pokemon2, this.pokemon2.data.currentMove, this.pokemon1),
          pokemon2AttackTypeOfMove: TypeOfMove.charged,
        };
        let pokemon1BuffTmp = this.pokemon1.data.buffs;
        let pokemon2BuffTmp = this.pokemon2.data.buffs;
        this.registerAttack(this.pokemon2, this.pokemon1);
        if (pokemon1BuffTmp !== this.pokemon1.data.buffs ) {
          newChargedTurn.pokemon2Buffs = [this.pokemon1.data.buffs[0]-pokemon1BuffTmp[0],
                                          this.pokemon1.data.buffs[1]-pokemon1BuffTmp[1]];
        }
        if ( pokemon2BuffTmp !== this.pokemon2.data.buffs ) {
          newChargedTurn.pokemon2Buffs = [this.pokemon2.data.buffs[0]-pokemon2BuffTmp[0],
                                          this.pokemon2.data.buffs[1]-pokemon2BuffTmp[1]];
        }
        pokemon1BuffTmp = this.pokemon1.data.buffs;
        pokemon2BuffTmp = this.pokemon2.data.buffs;
        newChargedTurn.pokemon2Energy = this.pokemon2.data.energy;
        newChargedTurn.pokemon1Hp = this.pokemon1.data.currentHp;
        newChargedTurn.pokemon2AttackDamage = this.results[this.results.length-1].pokemon1Hp - this.pokemon1.data.currentHp;
      }
      if(newChargedTurn.pokemon1Attack || newChargedTurn.pokemon2Attack) {
        newChargedTurn.pokemon1Shielded = this.results[this.results.length-1].pokemon1Shields != this.pokemon1.data.shields;
        newChargedTurn.pokemon2Shielded = this.results[this.results.length-1].pokemon2Shields != this.pokemon2.data.shields;
        this.results.push(newChargedTurn);
      }
      // añadimos el tiempo al contador global
      timeElapsed += 500;

        
      if(this.firstKO){
        console.log(newChargedTurn);
        break;
      }
    }
    console.log(this.results)
    console.log(this.firstKO);
    console.log(timeElapsed / 500);
    console.log("PKMN1 Buffs: " + this.pokemon1.data.buffs);
    console.log("PKMN2 Buffs: " + this.pokemon2.data.buffs);
    console.log("PKMN1 HP: " + this.pokemon1.data.currentHp);
    console.log("PKMN2 HP: " + this.pokemon2.data.currentHp);

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

    if(move){
      if(move.typeOfMove == TypeOfMove.fast){
        attackingPokemon.data.energy += move.energyGain;
        defendingPokemon.data.currentHp -= Math.min(this.calculateAttackDamage(attackingPokemon, move, defendingPokemon), defendingPokemon.data.currentHp);
        this.pokemonFainted(defendingPokemon);
  
      } else{
        console.log(attackingPokemon.data.speciesName + " used " + move.name);
        attackingPokemon.data.energy -= move.energy;
        
        if(defendingPokemon.decideShield()){
          console.log("shielded");
          defendingPokemon.data.currentHp -= 1;
          defendingPokemon.data.shields -= 1;
          this.pokemonFainted(defendingPokemon);
        } else{
          console.log("not shielded");
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
          //PENDIENTE: registrar daño en results
          this.registerAttack(defendingPokemon, attackingPokemon);
        }
  
      }
    }

    attackingPokemon.data.currentMove = null; 

  }

  pokemonFainted(pokemon: Pokemon): void {
    if(pokemon.data.currentHp == 0 && !this.firstKO) {
      this.firstKO = pokemon;
    }
  }

  calculateMoveDamage(pokemon1: Pokemon, move: Move, pokemon2: Pokemon): number {
    return Math.min(this.calculateAttackDamage(pokemon1, pokemon1.data.currentMove, pokemon2), pokemon2.data.currentHp)
  }

}