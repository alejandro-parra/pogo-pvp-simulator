import { Move, typeEffectiveness, TypeOfMove } from './data';
import { Pokemon, Stat } from './Pokemon';

const init = (): void => {
  let medicham = new Pokemon('medicham', 40, 15, 15, 15, 'counter', ['ice punch, psychic'], 2);
  let bastiodon = new Pokemon('bastiodon', 50, 0, 15, 15, 'smack down', ['flamethrower', 'stone edge'], 2);

  battle(medicham, bastiodon);  
}

const battle = (pokemon1: Pokemon, pokemon2: Pokemon): void => {
  let timeElapsed = 0;
  while(timeElapsed < 240000) {

    if(pokemon1.data.currentMove) {
      pokemon1.data.currentMove.elapsed += 500;
      if(pokemon1.data.currentMove.elapsed >= pokemon1.data.currentMove.cooldown) {
        pokemon2.data.currentHp -= calculateAttackDamage(pokemon1, pokemon1.data.currentMove, pokemon2);
        pokemon1.data.currentMove = null;
      }
    }
    if(pokemon2.data.currentMove) {
      pokemon2.data.currentMove.elapsed += 500;
      if(pokemon2.data.currentMove.elapsed >= pokemon2.data.currentMove.cooldown) {
        pokemon1.data.currentHp -= calculateAttackDamage(pokemon2, pokemon2.data.currentMove, pokemon1);
        pokemon2.data.currentMove = null;
      }
    }
    
    if(!pokemon1.data.currentMove) {
      // pokemon1.data.currentMove = decideNextMove(pokemon1, pokemon2);
    }
    if(!pokemon2.data.currentMove) {
      // pokemon2.data.currentMove = decideNextMove(pokemon2, pokemon1);
    }

    if(pokemon1.data.currentMove && pokemon2.data.currentMove && pokemon1.data.currentMove.typeOfMove === TypeOfMove.charged && pokemon2.data.currentMove.typeOfMove === TypeOfMove.charged) {
      // ver quien ataca
      timeElapsed += 5000;
    } else if(pokemon1.data.currentMove && pokemon1.data.currentMove.typeOfMove === TypeOfMove.charged) {
      // ataca pokemon1, pokemon2 ve si usa un shield
      timeElapsed += 5000;
    } else if(pokemon2.data.currentMove && pokemon2.data.currentMove.typeOfMove === TypeOfMove.charged) {
      // ataca pokemon2, pokemon1 ve si usa un shield
      timeElapsed += 5000;
    }

    // añadimos el tiempo al contador global
    timeElapsed += 500;
  }
};
const decideNextMove = (attackingPokemon: Pokemon, defendingPokemon: Pokemon) => {
};

const damageEfficiency = (attackingPokemon: Pokemon, attack: Move, defendingPokemon: Pokemon): number => {
  return calculateAttackDamage(attackingPokemon, attack, defendingPokemon) / attack.energy;
};

const calculateMoveEffectiveness = (attackType: string, pokemonTypes: string[]): number => {
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

const calculateAttackDamage = (attackingPokemon: Pokemon, attack: Move, opposingPokemon: Pokemon) => {
  const hasStab = attackingPokemon.data.types.includes(attack.type);
  const stab = hasStab ? 1.2 : 1;
  const bonusMultiplier = 1.3;
  return Math.floor(0.5 * attack.power * ( attackingPokemon.getStat(Stat.atk) / opposingPokemon.getStat(Stat.def)) * stab * calculateMoveEffectiveness(attack.type, opposingPokemon.data.types) * bonusMultiplier) + 1;
};

window.addEventListener('DOMContentLoaded', init);
