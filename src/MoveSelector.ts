import { Pokebattle } from './Pokebattle';
import { Pokemon } from './Pokemon';
import { Move } from './data';

export class MoveSelector {
    attackingPokemon: Pokemon;
    defendingPokemon: Pokemon;
    pokebattle: Pokebattle;
    currentState: number;
    moveMatrix: number[][];
    transitionMatrix: string[][];
    shieldVector: string[];


    constructor(attackingPokemon: Pokemon, defendingPokemon: Pokemon, pokebattle: Pokebattle) {
        this.attackingPokemon = attackingPokemon;
        this.defendingPokemon = defendingPokemon;
        this.pokebattle = pokebattle;
        this.setMatrixes(this.attackingPokemon.data.attackStrategy, this.attackingPokemon.data.defenseStrategy);
        console.log(this.attackingPokemon.data.shields);
      }

    moveKills(index: number): boolean {
        return this.attackingPokemon.calculateAttackDamage(index, this.defendingPokemon) >= this.defendingPokemon.data.currentHp;
    }

    c1IsReachable(energyDelta: number): boolean {
        const energyLeft = this.attackingPokemon.data.energy + energyDelta;
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

    decideShield(): boolean {
        if(this.attackingPokemon.data.shields == 0){
            return false;
        }
        return eval(this.shieldVector[this.attackingPokemon.data.shields - 1]);
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

    setMatrixes(attackStrategy: string, defenseStrategy: string): void {
        if(attackStrategy === "optimal"){
            this.moveMatrix = [
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
                [0, 0, 0, 0, 1]  //q9
            ];

            this.transitionMatrix = [
                          //  q-1     q0      q1      q2      q3      q4      q5      q6      q7      q8      q9
                /* q-1 */ ["false", "!this.charged(1) && !this.charged(2)", "this.charged(1) && !this.charged(2)", "!this.charged(1) && this.charged(2)", "false", "false", "false", "this.charged(1) && this.charged(2)", "false", "false", "false"],
                /* q0 */  ["true", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false"],
                /* q1 */  ["true", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false"],
                /* q2 */  ["false", "false", "false", "false", "this.moveKills(2)", "!this.moveKills(2)", "false", "false", "false", "false", "false"],
                /* q3 */  ["true", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false"],
                /* q4 */  ["false", "this.defendingPokemon.data.shields != 0", "false", "false", "false", "false", "this.defendingPokemon.data.shields == 0", "false", "false", "false", "false"],
                /* q5 */  ["false", "this.c1IsReachable(0)", "false", "false", "!this.c1IsReachable(0)", "false", "false", "false", "false", "false", "false"],
                /* q6 */  ["false", "false", "this.defendingPokemon.data.shields == 0", "false", "false", "false", "false", "false", "this.defendingPokemon.data.shields == 2", "this.defendingPokemon.data.shields == 1", "false"],
                /* q7 */  ["false", "false", "this.attackingPokemon.getLowerEnergyMove() == 1", "false", "this.attackingPokemon.getLowerEnergyMove() == 2", "false", "false", "false", "false", "false", "false"],
                /* q8 */  ["false", "false", "false", "false", "this.moveKills(2)", "false", "false", "false", "false", "false", "!this.moveKills(2)"],
                /* q9 */  ["false", "false", "this.c1IsReachable(-this.attackingPokemon.data.currentChargedMoves[1].energy)", "false", "!this.c1IsReachable(-this.attackingPokemon.data.currentChargedMoves[1].energy)", "false", "false", "false", "false", "false", "false"]
    
            ];

            this.setInitialState([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

        } else if(attackStrategy === "fast only"){
            this.moveMatrix = [[1, 0, 0, 0, 0]];

            this.transitionMatrix = [["true"]];

            this.setInitialState([1]);

        } else if(attackStrategy === "spam charged"){
            this.moveMatrix = [
                [1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0],
                [0, 0, 1, 0, 0]
            ];
            
            this.transitionMatrix = [
                ["!this.charged(1) && !this.charged(2)", "this.charged(1)", "!this.charged(1) && this.charged(2)"],
                ["true", "false", "false"],
                ["true", "false", "false"]
            ];

            this.setInitialState([1, 0, 0]);
        } else if(attackStrategy === "C1 only") {
            this.moveMatrix = [
                [1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0]
            ]

            this.transitionMatrix = [
                ["!this.charged(1)", "this.charged(1)"],
                ["true", "false"]
            ]

            this.setInitialState([1, 0]);
        } else if(attackStrategy === "C2 only") {
            this.moveMatrix = [
                [1, 0, 0, 0, 0],
                [0, 0, 1, 0, 0]
            ]

            this.transitionMatrix = [
                ["!this.charged(2)", "this.charged(2)"],
                ["true", "false"]
            ]

            this.setInitialState([1, 0]);
        } else if(attackStrategy === "mostly optimal") {
            this.moveMatrix = [
                [0.05, 0, 0, 0.05, 0.9], //q-1
                [0.95, 0, 0, 0.05, 0], //q0
                [0.05, 0.9, 0, 0.05, 0], //q1
                [0.05, 0, 0.05, 0.05, 0.85], //q2
                [0.05, 0, 0.9, 0.05, 0], //q3
                [0.05, 0, 0.05, 0.05, 0.85], //q4
                [0.05, 0, 0.05, 0.05, 0.85], //q5
                [0.05, 0.05, 0.05, 0.05, 0.8], //q6
                [0.05, 0.05, 0.05, 0.05, 0.8], //q7
                [0.05, 0.05, 0.05, 0.05, 0.8], //q8
                [0.05, 0.05, 0.05, 0.05, 0.8], //q9
            ];

            this.transitionMatrix = [
                          //  q-1     q0      q1      q2      q3      q4      q5      q6      q7      q8      q9
                /* q-1 */ ["false", "!this.charged(1) && !this.charged(2)", "this.charged(1) && !this.charged(2)", "!this.charged(1) && this.charged(2)", "false", "false", "false", "this.charged(1) && this.charged(2)", "false", "false", "false"],
                /* q0 */  ["true", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false"],
                /* q1 */  ["true", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false"],
                /* q2 */  ["false", "false", "false", "false", "this.moveKills(2)", "!this.moveKills(2)", "false", "false", "false", "false", "false"],
                /* q3 */  ["true", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false"],
                /* q4 */  ["false", "this.defendingPokemon.data.shields != 0", "false", "false", "false", "false", "this.defendingPokemon.data.shields == 0", "false", "false", "false", "false"],
                /* q5 */  ["false", "this.c1IsReachable(0)", "false", "false", "!this.c1IsReachable(0)", "false", "false", "false", "false", "false", "false"],
                /* q6 */  ["false", "false", "this.defendingPokemon.data.shields == 0", "false", "false", "false", "false", "false", "this.defendingPokemon.data.shields == 2", "this.defendingPokemon.data.shields == 1", "false"],
                /* q7 */  ["false", "false", "this.attackingPokemon.getLowerEnergyMove() == 1", "false", "this.attackingPokemon.getLowerEnergyMove() == 2", "false", "false", "false", "false", "false", "false"],
                /* q8 */  ["false", "false", "false", "false", "this.moveKills(2)", "false", "false", "false", "false", "false", "!this.moveKills(2)"],
                /* q9 */  ["false", "false", "this.c1IsReachable(-this.attackingPokemon.data.currentChargedMoves[1].energy)", "false", "!this.c1IsReachable(-this.attackingPokemon.data.currentChargedMoves[1].energy)", "false", "false", "false", "false", "false", "false"]
    
            ];

            this.setInitialState([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        }


        if(defenseStrategy == "always"){
            this.shieldVector = ["true", "true"];
        } else if(defenseStrategy == "never"){
            this.shieldVector = ["false", "false"];
        } else if(defenseStrategy == "random"){
            this.shieldVector = ["Math.random() > 0.5", "Math.random() > 0.5"];
        }
    }

    setInitialState(vector: number[]): void {
        let ac = 0;
        const rand = 1 - Math.random();
        for(var i = 0; i < vector.length; i++){
            ac += vector[i];
            if(ac > rand){
                this.currentState = i;
                break;
            }
        }
    }

}