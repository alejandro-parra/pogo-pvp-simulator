import { Pokebattle } from './Pokebattle';
import { Pokemon } from './Pokemon';
import { MoveSelector } from './MoveSelector';
import { searchAttack } from './Utilities';
import { gameData, Move, PokemonInfo, TypeOfMove } from './data';
import { orderedPokemonList, searchPokemonInfo } from './Utilities';
import pokeImages from './data/poke-images/*.png';

var pokemon1: Pokemon;
var pokemon2: Pokemon;
var pokeBattle: Pokebattle;
var turns = [];
var currentHpChart = null;
var currentEnergyChart = null;

enum League {
  Great,
  Ultra,
  Master
}

const init = (): void => {
  populatePokemonList();
  populateGeneralSelects();
  addEventListeners();
  getElement('resultsDiv').style.display = 'none';
}

const initializeChart = () => {
  getElement('resultsDiv').style.display = 'flex';
  getElement('resultText').innerHTML = (pokeBattle.firstKO) ? `¡${pokeBattle.firstKO === pokemon2 ? pokemon1.data.speciesName + (pokemon1.data.speciesId === pokemon2.data.speciesId ? " (izquierda)" : "") : pokemon2.data.speciesName + (pokemon1.data.speciesId === pokemon2.data.speciesId ? " (derecha)" : "")} ganó en ${pokeBattle.results.length-1} turnos!` : `¡Empate! Double KO`;
  turns = [];
  for(let index = 0; index < pokeBattle.results.length; index ++) {
    turns.push(String(index));
  }
  var hpChart = (document.getElementById('hpChart') as HTMLCanvasElement).getContext('2d');
  if(currentHpChart){
    currentHpChart.destroy();
  }
  currentHpChart = new Chart(hpChart, {
      type: 'line',
      data: {
          labels: turns,
          datasets: [
            {
              label: pokemon1.data.speciesName,
              data: pokeBattle.results.map((turn) => turn.pokemon1Hp),
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
              ],
              borderWidth: 1
          },
          {
            label: pokemon2.data.speciesName,
            data: pokeBattle.results.map((turn) => turn.pokemon2Hp),
            backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1
        }
        ]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });

  var energyChart = (document.getElementById('energyChart') as HTMLCanvasElement).getContext('2d');
  if(currentEnergyChart) {
    currentEnergyChart.destroy();
  }
  currentEnergyChart = new Chart(energyChart, {
      type: 'line',
      data: {
          labels: turns,
          datasets: [
            {
              label: pokemon1.data.speciesName,
              data: pokeBattle.results.map((turn) => turn.pokemon1Energy),
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
              ],
              borderWidth: 1
          },
          {
            label: pokemon2.data.speciesName,
            data: pokeBattle.results.map((turn) => turn.pokemon2Energy),
            backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1
        }
        ]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });

};

const battleButtonHandler = (): void => {
  console.log(pokemon1)
  console.log(pokemon2)
  if(!(getElement('pokemon1Shields') as HTMLSelectElement).value || !(getElement('pokemon2Shields') as HTMLSelectElement).value) {
    alert('You must assign a shield number to your pokemon');
  } else if(getElement('pokemon1CP').classList.contains('red') || getElement('pokemon2CP').classList.contains('red')) {
    alert('One of your pokemon has invalid values, CP too high');
  } else if(pokemon1 && pokemon2) {
    pokemon1.data.shields = Number((getElement('pokemon1Shields') as HTMLSelectElement).value);
    pokemon2.data.shields = Number((getElement('pokemon2Shields') as HTMLSelectElement).value);
    recalculatePokemon1();
    recalculatePokemon2();
    console.log((getElement('pokemon1AttackStrategy') as HTMLSelectElement).value)
    console.log((getElement('pokemon2AttackStrategy') as HTMLSelectElement).value)
    pokemon1.data.attackStrategy = (getElement('pokemon1AttackStrategy') as HTMLSelectElement).value;
    pokemon2.data.attackStrategy = (getElement('pokemon2AttackStrategy') as HTMLSelectElement).value;
    pokemon1.data.defenseStrategy = (getElement('pokemon1DefenseStrategy') as HTMLSelectElement).value;
    pokemon2.data.defenseStrategy = (getElement('pokemon2DefenseStrategy') as HTMLSelectElement).value;
    console.log(pokemon1.data.attackStrategy);
    console.log(pokemon2.data.attackStrategy);
    pokeBattle = new Pokebattle(pokemon1, pokemon2);
    pokeBattle.battle();
    initializeChart();
    logAllBattle();
  } else {
    alert('Select 2 pokemon to fight');
  }
}

const logAllBattle = () => {
  //<p style="width: 100%;"><div class="type-icon psychic"></div> <span><b>TURNO 1:</b> Altaria usó Dragonbreath, 65 daño</span></p>
  let entriesDiv = getElement('entriesDiv');
  entriesDiv.innerHTML = '';
  pokeBattle.results.forEach((turn, index) => {
    if(turn.pokemon1Attack) {
      let p1 = document.createElement('p');
      p1.style.width = '100%';
      p1.style.textAlign = 'left';
      let typeIcon1 = document.createElement('div');
      typeIcon1.classList.add('type-icon');
      typeIcon1.classList.add(turn.pokemon1AttackType.toLowerCase());
      p1.appendChild(typeIcon1);
      let span1 = document.createElement('span');
      let b1 = document.createElement('b');
      b1.innerHTML = `TURNO ${index}: `;
      span1.appendChild(b1);
      let battleText1 = document.createElement('span');
      battleText1.innerHTML = `${pokemon1.data.speciesName} ` + (pokemon1.data.speciesId === pokemon2.data.speciesId ? `(izquierda) ` : ``) + `usó ${turn.pokemon1Attack}, ${turn.pokemon1AttackDamage} de daño.`;
      if(turn.pokemon2Shielded) {
        battleText1.innerHTML += ` Ataque bloqueado.`;
      }
      span1.appendChild(battleText1)
      p1.appendChild(span1);
      entriesDiv.appendChild(p1);
    }

    if(turn.pokemon2Attack) {
      let p2 = document.createElement('p');
      p2.style.width = '100%';
      p2.style.textAlign = 'left';
      let typeIcon2 = document.createElement('div');
      typeIcon2.classList.add('type-icon');
      typeIcon2.classList.add(turn.pokemon2AttackType.toLowerCase());
      p2.appendChild(typeIcon2);
      let span2 = document.createElement('span');
      let b2 = document.createElement('b');
      b2.innerHTML = `TURNO ${index}: `;
      span2.appendChild(b2);
      let battleText2 = document.createElement('span');
      battleText2.innerHTML = `${pokemon2.data.speciesName} ` + (pokemon1.data.speciesId === pokemon2.data.speciesId ? `(derecha) ` : ``) + `usó ${turn.pokemon2Attack}, ${turn.pokemon2AttackDamage} de daño.`;
      if(turn.pokemon1Shielded) {
        battleText2.innerHTML += ` Ataque bloqueado.`;
      }
      span2.appendChild(battleText2)
      p2.appendChild(span2);
      entriesDiv.appendChild(p2);
    }
  });
};

const populatePokemonList = (): void => {
  populatePokemonSelect('selectPokemon1');
  populatePokemonSelect('selectPokemon2');
  let pokemon1 = getElement('selectPokemon1'); 
  let pokemon2 = getElement('selectPokemon2'); 
  pokemon1.addEventListener('change', pokemonChangeHandler);
  pokemon2.addEventListener('change', pokemonChangeHandler);
  
};

const populateGeneralSelects = (): void => {
  populateLevelSelect('pokemon1Level');
  populateLevelSelect('pokemon2Level');
  populateIVSelect('pokemon1AtkIV');
  populateIVSelect('pokemon1DefIV');
  populateIVSelect('pokemon1HpIV');
  populateIVSelect('pokemon2AtkIV');
  populateIVSelect('pokemon2DefIV');
  populateIVSelect('pokemon2HpIV');
}

const populateLevelSelect = (selectId: string): void => {
  for(let level = 1; level <= 51; level += 0.5) {
    let option = document.createElement('option');
    option.innerHTML = String(level);
    option.value = String(level);
    getElement(selectId).appendChild(option);
  }
}

const populateIVSelect = (selectId: string): void => {
  for(let level = 0; level < 16; level ++) {
    let option = document.createElement('option');
    option.innerHTML = String(level);
    option.value = String(level);
    getElement(selectId).appendChild(option);
  }
}

const populateMoveSelect = (selectId: string, moves: Move[]): void => {
  let defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.disabled = true;
  if(selectId === 'pokemon1FastMove' || selectId === 'pokemon2FastMove') {
    defaultOption.innerHTML = 'Fast move:';
  } else if(selectId === 'pokemon1ChargedMove1' || selectId === 'pokemon2ChargedMove1') {
    defaultOption.innerHTML = 'Charged move 1:';
  } else if(selectId === 'pokemon1ChargedMove2' || selectId === 'pokemon2ChargedMove2') {
    defaultOption.innerHTML = 'Charged move 2:';
  }
  let select = getElement(selectId) as HTMLSelectElement;
  select.innerHTML = '';
  select.appendChild(defaultOption);
  moves.forEach((move, index) => {
    let moveOption = document.createElement('option');
    moveOption.innerHTML = move.name;
    moveOption.value = move.moveId;
    select.appendChild(moveOption);
    if(index === 0) {
      select.value = move.moveId;
    }
  }) 
}

const pokemonChangeHandler = (e: Event): void => {
  let select = e.target as HTMLSelectElement;
  let pokemonSelected = select.value;
  if(pokemonSelected) {
    let newPokemon = searchPokemonInfo(pokemonSelected);
    populatePokemonContainer(newPokemon, select.id);
  } else {
    populatePokemonContainer(null, select.id);
  }
}

const populatePokemonContainer = (pokemon: PokemonInfo, pokemonNumber: string) => {
  let league = Number((getElement('selectLeague') as HTMLSelectElement).value);
  let defaultIVs: number[];
  if(league === League.Great.valueOf()){
    defaultIVs = pokemon.defaultIVs.cp1500;
  } else if (league === League.Ultra.valueOf()) {
    defaultIVs = pokemon.defaultIVs.cp2500;
  } else {
    defaultIVs = [50,15,15,15];
  }

  if(pokemonNumber === 'selectPokemon1') {
    getElement('pokemon1CP').classList.remove('red');
    if(pokemon1) {
      getElement('pokemon1').classList.remove(pokemon1.data.types[0]);
    }
    pokemon1 = new Pokemon(pokemon.speciesId, defaultIVs[0], defaultIVs[1], defaultIVs[2], defaultIVs[3], pokemon.fastMoves[0], [pokemon.chargedMoves[0]], 0);
    getElement('pokemon1').classList.add(pokemon1.data.types[0]);
    console.log(pokemon1.data.types[0]);
    let postInd = setPostIndex(pokemon1.data.speciesId);
    (getElement('pokemon1Img') as HTMLImageElement).src = pokeImages[pokemon1.data.dex + (postInd != 0 ? "-" + postInd : "")];   
    getElement('pokemon1Name').innerHTML = pokemon.speciesName;
    getElement('pokemon1CP').innerHTML = String(pokemon1.data.cp);
    getElement('pokemon1Atk').innerHTML = String(pokemon1.data.atk);
    getElement('pokemon1Def').innerHTML = String(pokemon1.data.def);
    getElement('pokemon1Hp').innerHTML = String(pokemon1.data.hp);
    (getElement('pokemon1Level') as HTMLSelectElement).value = String(defaultIVs[0]);
    (getElement('pokemon1AtkIV') as HTMLSelectElement).value = String(defaultIVs[1]);
    (getElement('pokemon1DefIV') as HTMLSelectElement).value = String(defaultIVs[2]);
    (getElement('pokemon1HpIV') as HTMLSelectElement).value = String(defaultIVs[3]);
    populateMoveSelect('pokemon1FastMove', pokemon.fastMoves.map((moveId) => searchAttack(moveId)));
    populateMoveSelect('pokemon1ChargedMove1', pokemon.chargedMoves.map((moveId) => searchAttack(moveId)));
    populateMoveSelect('pokemon1ChargedMove2', pokemon.chargedMoves.map((moveId) => searchAttack(moveId)));
    (getElement('pokemon1Shields') as HTMLSelectElement).value = '2';
  } else if(pokemonNumber === 'selectPokemon2') {
    getElement('pokemon2CP').classList.remove('red');
    if(pokemon2) {
      getElement('pokemon2').classList.remove(pokemon2.data.types[0]);
    }
    pokemon2 = new Pokemon(pokemon.speciesId, defaultIVs[0], defaultIVs[1], defaultIVs[2], defaultIVs[3], pokemon.fastMoves[0], [pokemon.chargedMoves[0]], 0);
    getElement('pokemon2').classList.add(pokemon2.data.types[0]);
    let postInd = setPostIndex(pokemon2.data.speciesId);
    (getElement('pokemon2Img') as HTMLImageElement).src = pokeImages[pokemon2.data.dex + (postInd != 0 ? "-" + postInd : "")];
    getElement('pokemon2Name').innerHTML = pokemon.speciesName;
    getElement('pokemon2CP').innerHTML = String(pokemon2.data.cp);
    getElement('pokemon2Atk').innerHTML = String(pokemon2.data.atk);
    getElement('pokemon2Def').innerHTML = String(pokemon2.data.def);
    getElement('pokemon2Hp').innerHTML = String(pokemon2.data.hp);
    (getElement('pokemon2Level') as HTMLSelectElement).value = String(defaultIVs[0]);
    (getElement('pokemon2AtkIV') as HTMLSelectElement).value = String(defaultIVs[1]);
    (getElement('pokemon2DefIV') as HTMLSelectElement).value = String(defaultIVs[2]);
    (getElement('pokemon2HpIV') as HTMLSelectElement).value = String(defaultIVs[3]);
    populateMoveSelect('pokemon2FastMove', pokemon.fastMoves.map((moveId) => searchAttack(moveId)));
    populateMoveSelect('pokemon2ChargedMove1', pokemon.chargedMoves.map((moveId) => searchAttack(moveId)));
    populateMoveSelect('pokemon2ChargedMove2', pokemon.chargedMoves.map((moveId) => searchAttack(moveId)));
    (getElement('pokemon2Shields') as HTMLSelectElement).value = '2';
  } else {
    if(pokemonNumber === 'selectPokemon1') {
      getElement('pokemon1CP').classList.remove('red');
      if(pokemon1) {
        getElement('pokemon1').classList.remove(pokemon1.data.types[0]);
      }
      pokemon1 = null;
      getElement('pokemon1Name').innerHTML = '';
      getElement('pokemon1CP').innerHTML = '';
      getElement('pokemon1Atk').innerHTML = '';
      getElement('pokemon1Def').innerHTML = '';
      getElement('pokemon1Hp').innerHTML = '';
      (getElement('pokemon1Level') as HTMLSelectElement).value = '';
      (getElement('pokemon1AtkIV') as HTMLSelectElement).value = '';
      (getElement('pokemon1DefIV') as HTMLSelectElement).value = '';
      (getElement('pokemon1HpIV') as HTMLSelectElement).value = '';
      populateMoveSelect('pokemon1FastMove', []);
      populateMoveSelect('pokemon1ChargedMove1', []);
      populateMoveSelect('pokemon1ChargedMove2', []);
      (getElement('pokemon1Shields') as HTMLSelectElement).value = '';
    } else {
      getElement('pokemon2CP').classList.remove('red');
      if(pokemon2) {
        getElement('pokemon2').classList.remove(pokemon2.data.types[0]);
      }
      pokemon2 = null;
      getElement('pokemon2Name').innerHTML = '';
      getElement('pokemon2CP').innerHTML = '';
      getElement('pokemon2Atk').innerHTML = '';
      getElement('pokemon2Def').innerHTML = '';
      getElement('pokemon2Hp').innerHTML = '';
      (getElement('pokemon2Level') as HTMLSelectElement).value = '';
      (getElement('pokemon2AtkIV') as HTMLSelectElement).value = '';
      (getElement('pokemon2DefIV') as HTMLSelectElement).value = '';
      (getElement('pokemon2HpIV') as HTMLSelectElement).value = '';
      populateMoveSelect('pokemon2FastMove', []);
      populateMoveSelect('pokemon2ChargedMove1', []);
      populateMoveSelect('pokemon2ChargedMove2', []);
      (getElement('pokemon2Shields') as HTMLSelectElement).value = '';
    }
  }
};

const populatePokemonSelect = (selectId: string): void => {
  let select = getElement(selectId);
  for(let pokemon of orderedPokemonList()) {
    let pokemonOption = document.createElement('option');
    pokemonOption.value = pokemon.speciesId;
    pokemonOption.innerHTML = pokemon.speciesName;
    select.appendChild(pokemonOption);
  }
};

const getElement = (id: string): HTMLElement => {
  return document.getElementById(id);
};

const modifyLeague = (): void => {
  if(pokemon1){
    populatePokemonContainer(pokemon1.data, 'selectPokemon1');
  }
  if(pokemon2) {
    populatePokemonContainer(pokemon2.data, 'selectPokemon2');
  }
}

const handleSelectChange = (e: Event): void => {
  let event = e.target as HTMLSelectElement;
  if(event.id === 'pokemon1Level') {
    pokemon1.data.level = Number(event.value);
    recalculatePokemon1();
  } else if(event.id === 'pokemon1AtkIV') {
    pokemon1.data.atkIV = Number(event.value);
    recalculatePokemon1();
  } else if(event.id === 'pokemon1DefIV') {
    pokemon1.data.defIV = Number(event.value);
    recalculatePokemon1();
  } else if(event.id === 'pokemon1HpIV') {
    pokemon1.data.hpIV = Number(event.value);
    recalculatePokemon1();
  } else if(event.id === 'pokemon2Level') {
    pokemon2.data.level = Number(event.value);
    recalculatePokemon2();
  } else if(event.id === 'pokemon2AtkIV') {
    pokemon2.data.atkIV = Number(event.value);
    recalculatePokemon2();
  } else if(event.id === 'pokemon2DefIV') {
    pokemon2.data.defIV = Number(event.value);
    recalculatePokemon2();
  } else if(event.id === 'pokemon2HpIV') {
    pokemon2.data.hpIV = Number(event.value);
    recalculatePokemon2();
  }  else if(event.id === 'pokemon1Shields') {
    pokemon1.data.shields = Number(event.value);
  } else if(event.id === 'pokemon2Shields') {
    pokemon2.data.shields = Number(event.value);
  } else if(event.id === 'pokemon1FastMove') {
    pokemon1.data.currentFastMove = {...searchAttack(event.value), typeOfMove: TypeOfMove.fast};
  } else if(event.id === 'pokemon2FastMove') {
    pokemon2.data.currentFastMove = {...searchAttack(event.value), typeOfMove: TypeOfMove.fast};
  } else if(event.id === 'pokemon1ChargedMove1') {
    pokemon1.data.currentChargedMoves[0] = {...searchAttack(event.value), typeOfMove: TypeOfMove.charged};
  } else if(event.id === 'pokemon1ChargedMove2') {
    pokemon1.data.currentChargedMoves[1] = {...searchAttack(event.value), typeOfMove: TypeOfMove.charged};
  } else if(event.id === 'pokemon2ChargedMove1') {
    pokemon2.data.currentChargedMoves[0] = {...searchAttack(event.value), typeOfMove: TypeOfMove.charged};
  } else if(event.id === 'pokemon2ChargedMove2') {
    pokemon2.data.currentChargedMoves[1] = {...searchAttack(event.value), typeOfMove: TypeOfMove.charged};
  } else if(event.id === 'pokemon1AttackStrategy') {
    pokemon1.data.attackStrategy = event.value;
  } else if(event.id === 'pokemon2AttackStrategy') {
    pokemon2.data.attackStrategy = event.value;
  } else if(event.id === 'pokemon1DefenseStrategy') {
    pokemon2.data.defenseStrategy = event.value;
  } else if(event.id === 'pokemon2DefenseStrategy') {
    pokemon2.data.defenseStrategy = event.value;
  }
};

const recalculatePokemon1 = (): void => {
  pokemon1 = new Pokemon(pokemon1.data.speciesId, pokemon1.data.level, pokemon1.data.atkIV, pokemon1.data.defIV, pokemon1.data.hpIV, pokemon1.data.currentFastMove.moveId, pokemon1.data.currentChargedMoves.map((move) => move.moveId), pokemon1.data.shields);
  getElement('pokemon1CP').innerHTML = String(pokemon1.data.cp);
  getElement('pokemon1Atk').innerHTML = String(pokemon1.data.atk);
  getElement('pokemon1Def').innerHTML = String(pokemon1.data.def);
  getElement('pokemon1Hp').innerHTML = String(pokemon1.data.hp);
  let league = Number((getElement('selectLeague') as HTMLSelectElement).value);
  if(league === League.Great.valueOf() && pokemon1.data.cp > 1500){
    getElement('pokemon1CP').classList.add('red');
  } else if(league === League.Ultra.valueOf() && pokemon1.data.cp > 2500){
    getElement('pokemon1CP').classList.add('red');
  } else {
    getElement('pokemon1CP').classList.remove('red');
  }
}

const recalculatePokemon2 = (): void => {
  pokemon2 = new Pokemon(pokemon2.data.speciesId, pokemon2.data.level, pokemon2.data.atkIV, pokemon2.data.defIV, pokemon2.data.hpIV, pokemon2.data.currentFastMove.moveId, pokemon2.data.currentChargedMoves.map((move) => move.moveId), pokemon2.data.shields);
  getElement('pokemon2CP').innerHTML = String(pokemon2.data.cp);
  getElement('pokemon2Atk').innerHTML = String(pokemon2.data.atk);
  getElement('pokemon2Def').innerHTML = String(pokemon2.data.def);
  getElement('pokemon2Hp').innerHTML = String(pokemon2.data.hp);
  let league = Number((getElement('selectLeague') as HTMLSelectElement).value);
  if(league === League.Great.valueOf() && pokemon2.data.cp > 1500){
    getElement('pokemon2CP').classList.add('red');
  } else if(league === League.Ultra.valueOf() && pokemon2.data.cp > 2500){
    getElement('pokemon2CP').classList.add('red');
  } else {
    getElement('pokemon2CP').classList.remove('red');
  }
}

const addEventListeners = (): void => {
  getElement('selectLeague').addEventListener('change', modifyLeague);
  getElement('battleButton').addEventListener('click', battleButtonHandler);
  document.addEventListener('change', handleSelectChange);
};

const setPostIndex = (id: string): number => {
    let ret = 0;
    ret = id.endsWith("_alolan") || id.includes("_mega") ? 1 : 0;
    ret += id.includes("_galarian") ? id.includes("meowth") ? 2 : 1 : 0;
    ret += id.endsWith("_y") ? 1 : 0;

    if(id.startsWith("castform")) {
      if(id.endsWith("_sunny")) return 1;
      if(id.endsWith("_rainy")) return 2;
      if(id.endsWith("_snowy")) return 3;
    }

    if(id.startsWith("deoxys")) {
      if(id.endsWith("_attack")) return 1;
      if(id.endsWith("_defense")) return 2;
      if(id.endsWith("_speed")) return 3;
    }

    if(id.startsWith("burmy") || id.startsWith("wormadam")){
      if(id.endsWith("_sandy")) return 1;
      if(id.endsWith("_trash")) return 2;
    }

    if(id.startsWith("cherrim") && id.endsWith("_sunny")) return 1;

    if(id.endsWith("_east_sea")) return 1;

    if(id.startsWith("rotom")){
      if(id.endsWith("_heat")) return 1;
      if(id.endsWith("_wash")) return 2;
      if(id.endsWith("_frost")) return 3;
      if(id.endsWith("_fan")) return 4;
      if(id.endsWith("_mow")) return 5;
    }

    if(id.startsWith("giratina") && id.endsWith("_altered")) return 1;

    if(id.startsWith("shaymin") && id.endsWith("_sky")) return 1;

    if(id.startsWith("arceus")){
      if(id.endsWith("_fighting")) return 1;
      if(id.endsWith("_flying")) return 2;
      if(id.endsWith("_poison")) return 3;
      if(id.endsWith("_ground")) return 4;
      if(id.endsWith("_rock")) return 5;
      if(id.endsWith("_bug")) return 6;
      if(id.endsWith("_ghost")) return 7;
      if(id.endsWith("_steel")) return 8;
      if(id.endsWith("_fire")) return 9;
      if(id.endsWith("_water")) return 10;
      if(id.endsWith("_grass")) return 11;
      if(id.endsWith("_electric")) return 12;
      if(id.endsWith("_psychic")) return 13;
      if(id.endsWith("_ice")) return 14;
      if(id.endsWith("_dragon")) return 15;
      if(id.endsWith("_dark")) return 16;
      if(id.endsWith("_fairy")) return 17;
    }

    if(id.startsWith("darmanitan")){
      ret = 0;
      if(id.includes("_galarian")) ret = 2;
      if(id.includes("_zen")) ret += 1;
    }

    if(id.startsWith("tornadus") || id.startsWith("thundurus") || id.startsWith("landorus")){
      if(id.endsWith("_therian")) return 1;
    }

    if(id.startsWith("kyurem")){
      if(id.endsWith("_white")) return 1;
      if(id.endsWith("_black")) return 2;
    }

    if(id.startsWith("keldeo") && id.endsWith("_resolute")) return 1;

    if(id.startsWith("meloetta") && id.endsWith("_pirouette")) return 1;

    if(id.startsWith("genesect")){
      if(id.endsWith("_douse")) return 1;
      if(id.endsWith("_shock")) return 2;
      if(id.endsWith("_burn")) return 3;
      if(id.endsWith("_chill")) return 4;
    }

    if(id.startsWith("meowstic") && id.endsWith("_female")) return 1;

    return ret;
}

window.addEventListener('DOMContentLoaded', init);
