import { Pokebattle } from './Pokebattle';
import { Pokemon } from './Pokemon';
import { gameData } from './data';
import { orderedPokemonList } from './Utilities';

enum League {
  Great,
  Ultra,
  Master
}

const init = (): void => {
  hide('battleButton');
  populatePokemonList();
}

const populatePokemonList = (): void => {
  populatePokemonSelect('selectPokemon1');
  populatePokemonSelect('selectPokemon2');

  let pokemon1 = getElement('selectPokemon1'); 
  pokemon1.addEventListener('change', (e: Event) => {
    let target = e.target as HTMLSelectElement;
    if(target.value) {
      show('pokemon1');
    } else {
      hide('pokemon1');
    }
  });
  getElement('pokemon2').addEventListener('change', (e: Event) => {
    
  });
};

const populatePokemonSelect = (selectId: string): void => {
  let select = getElement(selectId);
  for(let pokemon of orderedPokemonList()) {
    let pokemonOption = document.createElement('option');
    pokemonOption.value = pokemon.speciesId;
    pokemonOption.innerHTML = pokemon.speciesId;
    select.appendChild(pokemonOption);
  }
};

const show = (element: string): void => {
  getElement(element).style.display = 'block';
}

const hide = (element: string): void => {
  getElement(element).style.display = 'none';
}

const getElement = (id: string): HTMLElement => {
  return document.getElementById(id);
};

window.addEventListener('DOMContentLoaded', init);
