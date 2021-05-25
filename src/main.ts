import { Pokebattle } from './Pokebattle';
import { Pokemon } from './Pokemon';
import { MoveSelector } from './MoveSelector';
import { searchAttack } from './Utilities';

const init = (): void => {
  let durant = new Pokemon('cresselia', 20, 4, 7, 13, 'Psycho Cut', ['Moonblast', 'Grass Knot'], 2);
  let blissey = new Pokemon('altaria', 28.5, 4, 14, 11, 'Dragon Breath', ['Sky Attack', 'Dragon Pulse'], 2);

  let pokeBattle = new Pokebattle(durant, blissey);

  pokeBattle.battle();
  /*console.log(pokeBattle.calculateAttackDamage(pokeBattle.pokemon1, pokeBattle.pokemon1.data.currentFastMove, pokeBattle.pokemon2));
  console.log(pokeBattle.calculateAttackDamage(pokeBattle.pokemon2, pokeBattle.pokemon2.data.currentFastMove, pokeBattle.pokemon1));

  console.log(pokeBattle.maxDamageInTurns(pokeBattle.pokemon1, pokeBattle.pokemon2, 20));
  console.log(pokeBattle.maxDamageInTurns(pokeBattle.pokemon2, pokeBattle.pokemon1, 20));*/

}

window.addEventListener('DOMContentLoaded', init);
