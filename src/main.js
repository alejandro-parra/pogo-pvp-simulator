/* struct Pokemon{
  level: number,
  atkIV: number,
  defIV: number,
  hpIV: number,
  info: jsonObject
} 
*/

const init = () => {
  let pokemon1 = buildPokemon('medicham', 40, 15, 15, 15);
  let pokemon2 = buildPokemon('wurmple', 50, 15, 15, 15);

  timeElapsed = 0;
  while(timeElapsed < 240000) {

    if(pokemon1.currentMove) {
      pokemon1.currentMove.elapsed += 500;
      if(pokemon1.currentMove.elapsed >= pokemon1.currentMove.cooldown) {
        pokemon2.currentHp -= calculateAttackDamage(pokemon1, pokemon1.currentMove, pokemon2);
        pokemon1.currentMove = null;
      }
    }
    if(pokemon2.currentMove) {
      pokemon2.currentMove.elapsed += 500;
      if(pokemon2.currentMove.elapsed >= pokemon2.currentMove.cooldown) {
        pokemon1.currentHp -= calculateAttackDamage(pokemon2, pokemon2.currentMove, pokemon1);
        pokemon2.currentMove = null;
      }
    }
    
    if(!pokemon1.currentMove) {
      pokemon1.currentMove = decideNextMove(pokemon1, pokemon2);
    }
    if(!pokemon2.currentMove) {
      pokemon2.currentMove = decideNextMove(pokemon2, pokemon1);
    }

    if(pokemon1.currentMove && pokemon2.currentMove && pokemon1.currentMove.typeOfMove === 'charged' && pokemon2.currentMove.typeOfMove === 'charged') {
      // ver quien ataca
      timeElapsed += 5000;
    } else if(pokemon1.currentMove && pokemon1.currentMove.typeOfMove === 'charged') {
      // ataca pokemon1, pokemon2 ve si usa un shield
      timeElapsed += 5000;
    } else if(pokemon2.currentMove && pokemon2.currentMove.typeOfMove === 'charged') {
      // ataca pokemon2, pokemon1 ve si usa un shield
      timeElapsed += 5000;
    }

    // añadimos el tiempo al contador global
    timeElapsed += 500;
  }
}



const decideNextMove = (attackingPokemon, defendingPokemon) => {
  let bestMove = [attackingPokemon.fastMove, ]
  for()
};

const damageEfficiency = () => {

};

window.addEventListener('DOMContentLoaded', init);