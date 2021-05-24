import { Pokebattle } from './Pokebattle';
import { Pokemon } from './Pokemon';

const init = (): void => {
  let durant = new Pokemon('durant', 50, 15, 15, 15, 'Bug Bite', ['X-Scissor', 'Stone Edge'], 2);
  let blissey = new Pokemon('blissey', 50, 15, 15, 15, 'Spark', ['Discharge', 'Thunderbolt'], 2);

  let pokeBattle = new Pokebattle(durant, blissey);

  //pokeBattle.battle();
  console.log(pokeBattle.calculateAttackDamage(pokeBattle.pokemon1, pokeBattle.pokemon1.data.currentFastMove, pokeBattle.pokemon2));
  console.log(pokeBattle.calculateAttackDamage(pokeBattle.pokemon2, pokeBattle.pokemon2.data.currentFastMove, pokeBattle.pokemon1));

  console.log(pokeBattle.maxDamageInTurns(pokeBattle.pokemon1, pokeBattle.pokemon2, 20));
  console.log(pokeBattle.maxDamageInTurns(pokeBattle.pokemon2, pokeBattle.pokemon1, 20));
}

window.addEventListener('DOMContentLoaded', init);
