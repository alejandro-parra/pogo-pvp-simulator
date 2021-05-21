/* struct Pokemon{
  level: number,
  atkIV: number,
  defIV: number,
  hpIV: number,
  info: jsonObject
} 
*/

const init = async () => {
  let medicham = buildPokemon('medicham', 40, 15, 15, 15);
  let wurmple = buildPokemon('wurmple', 50, 15, 15, 15);
  timeElapsed = 0;
  pokemon1CurrentMove = null;
  pokemon1ElapsedTime = 0;
  pokemon2CurrentMove = null;
  pokemon2ElapsedTime = 0;
  pokemon1Energy = 0;
  pokemon2Energy = 0;
  pokemon1Hp = medicham.hp;
  pokemon2Hp = wurmple.hp;
  while(timeElapsed < 240000) {
    timeElapsed += 500;
  }
}

window.addEventListener('DOMContentLoaded', init);
