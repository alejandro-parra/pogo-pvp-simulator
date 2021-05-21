const buildPokemon = (speciesId, level, atkIV, defIV, hpIV, fastMove, chargedMoves) => {
  let info = gameData.pokemon.filter((pokemon) => pokemon.speciesId === speciesId)[0];
  let preBuiltPokemon = {
    ...info,
    level,
    atkIV,
    defIV,
    hpIV,
    fastMove: searchAttack(fastMove),
    chargedMoves: chargedMoves.map((move) => searchAttack(move))
  };
  let statsAtLevel = calculateStatsAtLevel(preBuiltPokemon);
  let cp = calculateCP(preBuiltPokemon);
  let builtPokemon = {
    ...preBuiltPokemon,
    atk: statsAtLevel[0],
    def: statsAtLevel[1],
    hp: statsAtLevel[2],
    cp
  }
  return builtPokemon;
};

const isShadow = (pokemonId) => {
  return pokemonId.endsWith('_shadow') ? true : false;
};

const calculateCP = (pokemon) => {
  const weightedAttack = pokemon.baseStats.atk+pokemon.atkIV;
  const weightedDefense = Math.sqrt(pokemon.baseStats.def+pokemon.defIV);
  const weightedHp = Math.sqrt(pokemon.baseStats.hp+pokemon.hpIV);
  const cpMultiplier = getCpMultiplier(pokemon.level);
  const weightedCpMultiplier = Math.pow(cpMultiplier, 2);
  const unFlooredCP = weightedAttack * weightedDefense * weightedHp * weightedCpMultiplier * 0.1
  return Math.max(Math.floor(unFlooredCP), 10);
}

const calculateStatsAtLevel = (pokemon) => {
  const result = [];
  const cpMultiplier = getCpMultiplier(pokemon.level);
  result.push(truncateOneDecimal(cpMultiplier * (pokemon.baseStats.atk+pokemon.atkIV)));
  result.push(truncateOneDecimal(cpMultiplier * (pokemon.baseStats.def+pokemon.defIV)));
  result.push(Math.floor(cpMultiplier * (pokemon.baseStats.hp+pokemon.hpIV)));
  return result;
};

const getCpMultiplier = (level) => {
  return cpMultipliers[level*2-2];
}

const calculateMoveEffectiveness = (attackType, pokemonTypes) => {
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

const truncateOneDecimal = (number) => {
  let truncatedNumber = Math.trunc(number*10);
  return truncatedNumber / 10;
}

const calculateAttackDamage = (attackingPokemon, attack, opposingPokemon) => {
  const hasStab = attackingPokemon.types.includes(attack.type);
  const stab = hasStab ? 1.2 : 1;
  const bonusMultiplier = 1.3;
  return Math.floor(0.5 * attack.power * (attackingPokemon.atk / opposingPokemon.def) * stab * calculateMoveEffectiveness(attack.type, opposingPokemon.types) * bonusMultiplier) + 1;
};

const searchAttack = (attackName) => {
  return gameData.moves.filter((move) => move.name === attackName)[0];
}
