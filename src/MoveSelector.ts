import { Pokebattle } from './Pokebattle';
import { Pokemon } from './Pokemon';
import { Move } from './data';

export class MoveSelector {
    attackingPokemon: Pokemon;
    defendingPokemon: Pokemon;
    pokebattle: Pokebattle;
    currentState: number;

    shieldMatrix: string[][] =
    [
        ["false", "true"],
        ["true", "false"],
        ["true", "false"]
    ]
    moveMatrix: number[][] =
    [
        [0, 0, 0, 0, 1], //q-1
        [1, 0, 0, 0, 0], //q0
        [0, 1, 0, 0, 0], //q1
        [0, 0, 0, 0, 1], //q2
        [0, 0, 1, 0, 0], //q3
        [0, 0, 0, 0, 1], //q4
        [0, 0, 0, 0, 1], //q5
        [0, 0, 0, 0, 1], //q6
        [0, 0, 0, 0, 1], //q7
        [0, 0, 0, 0, 1], //q8

    ]                                         
    transitionMatrix: string[][] =
    [
                 //  q-1     q0      q1      q2      q3      q4      q5      q6      q7      q8
        /* q-1 */ ["false", "!this.charged(1) && !this.charged(2)", "this.charged(1) && !this.charged(2)", "!this.charged(1) && this.charged(2)", "false", "false", "false", "this.charged(1) && this.charged(2)", "false", "false"],
        /* q0 */  ["true", "false", "false", "false", "false", "false", "false", "false", "false", "false"],
        /* q1 */  ["true", "false", "false", "false", "false", "false", "false", "false", "false", "false"],
        /* q2 */  ["false", "false", "false", "false", "this.moveKills(2)", "!this.moveKills(2)", "false", "false", "false", "false"],
        /* q3 */  ["true", "false", "false", "false", "false", "false", "false", "false", "false", "false"],
        /* q4 */  ["false", "this.defendingPokemon.data.shields != 0", "false", "false", "false", "false", "this.defendingPokemon.data.shields == 0", "false", "false", "false"],
        /* q5 */  ["false", "this.C1IsReachable()", "false", "false", "!this.C1IsReachable()", "false", "false", "false", "false", "false"],
        /* q6 */  ["false", "false", "this.defendingPokemon.data.shields == 0", "false", "false", "false", "false", "false", "this.defendingPokemon.data.shields == 2", "this.defendingPokemon.data.shields == 1"],
        /* q7 */  ["false", "false", "this.attackingPokemon.getLowerEnergyMove() == 1", "false", "this.attackingPokemon.getLowerEnergyMove() == 2", "false", "false", "false", "false", "false"],
        /* q8 */  ["false", "false", "this.attackingPokemon.data.currentHp >= 50", "false", "this.attackingPokemon.data.currentHp < 50", "false", "false", "false", "false", "false"]

    ]

    constructor(attackingPokemon: Pokemon, defendingPokemon: Pokemon, pokebattle: Pokebattle) {
        this.attackingPokemon = attackingPokemon;
        this.defendingPokemon = defendingPokemon;
        this.pokebattle = pokebattle;
        this.currentState = 0;
      }

    moveKills(index: number): boolean {
        return this.attackingPokemon.calculateAttackDamage(index, this.defendingPokemon) >= this.defendingPokemon.data.currentHp;
    }

    c1IsReachable(): boolean {
        const energyLeft = this.attackingPokemon.data.energy;
        let timeLeft = Math.ceil((this.attackingPokemon.data.currentChargedMoves[0].energy - energyLeft) / this.attackingPokemon.data.currentFastMove.energyGain) * 500;
        timeLeft -= this.attackingPokemon.data.currentMove ? this.attackingPokemon.data.currentMove.cooldown - this.attackingPokemon.data.currentMove.elapsed : 0;
        timeLeft /= 500;

        return this.pokebattle.maxDamageInTurns(this.defendingPokemon, this.attackingPokemon, timeLeft) < this.attackingPokemon.data.currentHp;

    }

    charged(index: number): boolean {
        if(index == 1){
            return this.attackingPokemon.data.energy >= this.attackingPokemon.data.currentChargedMoves[0].energy;
        } else if(index == 2){
            if(this.attackingPokemon.data.currentChargedMoves.length == 1){
                return false;
            } else{
                return this.attackingPokemon.data.energy >= this.attackingPokemon.data.currentChargedMoves[1].energy;
            }
        }

    }

    decideNextMove(): Move {
        for(var i = 0; i < this.transitionMatrix[this.currentState].length; i++){
            if(eval(this.transitionMatrix[this.currentState][i])){
                this.currentState = i;
                const rand = 1 - Math.random();
                let totalProb = 0;
                for(var j = 0; j < this.moveMatrix[this.currentState].length; j++){
                    totalProb += this.moveMatrix[this.currentState][j];
                    if(this.moveMatrix[this.currentState][j] >= rand){
                        switch(j){
                            case 0:
                                return this.attackingPokemon.data.currentFastMove;
                            case 1:
                                return this.attackingPokemon.data.currentChargedMoves[0];
                            case 2:
                                return this.attackingPokemon.data.currentChargedMoves[1];
                            case 3:
                                return null;
                            case 4:
                                return this.decideNextMove();
                        }
                    }
                }
            }
        }

        return null;
    }

}