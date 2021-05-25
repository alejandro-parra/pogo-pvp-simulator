import { Pokebattle } from './Pokebattle';
import { Pokemon } from './Pokemon';
import { MoveSelector } from './MoveSelector';
import { searchAttack } from './Utilities';

const init = (): void => {
  let durant = new Pokemon('durant', 50, 15, 15, 15, 'Bug Bite', ['X-Scissor'], 2);
  let blissey = new Pokemon('blissey', 50, 15, 15, 15, 'Pound', ['Psychic', 'Hyper Beam'], 2);

  let pokeBattle = new Pokebattle(durant, blissey);

  //pokeBattle.battle();
  console.log(pokeBattle.calculateAttackDamage(pokeBattle.pokemon1, pokeBattle.pokemon1.data.currentFastMove, pokeBattle.pokemon2));
  console.log(pokeBattle.calculateAttackDamage(pokeBattle.pokemon2, pokeBattle.pokemon2.data.currentFastMove, pokeBattle.pokemon1));

  console.log(pokeBattle.maxDamageInTurns(pokeBattle.pokemon1, pokeBattle.pokemon2, 20));
  console.log(pokeBattle.maxDamageInTurns(pokeBattle.pokemon2, pokeBattle.pokemon1, 20));

  let ms = new MoveSelector(blissey, durant, pokeBattle);

  console.log(ms.decideNextMove());

}

window.addEventListener('DOMContentLoaded', init);
