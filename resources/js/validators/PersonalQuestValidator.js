import ScenarioRepository from "../repositories/ScenarioRepository";
import {ScenarioState} from "../models/ScenarioState";

export default class PersonalQuestValidator {
    validate(quest, sheet) {
        let allGoalsMet = quest.progress.every((progress) => {
            return this.validatePartialGoal(progress);
        });

        // When all goals are met, preform an action
        if (allGoalsMet) {
            // Unlock a character
            if (quest.character_unlock && sheet.characterUnlocks.hasOwnProperty(quest.character_unlock)) {
                sheet.characterUnlocks[quest.character_unlock] = true;
            }
        }

        return allGoalsMet;
    }

    validatePartialGoal(progress) {
        let goal = false;

        // Check if the goal was met
        if (progress.type === 'checkbox') {
            goal = progress.value.every((x) => !!x);
        } else if (progress.type === 'number') {
            goal = progress.value >= progress.target;
        }

        // When a partial goal is met, preform an action
        if (goal) {
            // Unlock a scenario
            if (progress.scenario_unlock) {
                const scenarioToUnlock = this.scenarioRepository.find(progress.scenario_unlock);
                if (scenarioToUnlock.isHidden()) {
                    this.scenarioRepository.changeState(scenarioToUnlock, ScenarioState.incomplete);
                }
            }
        }

        return goal;
    }

    get scenarioRepository() {
        return this._scenarioRepository || (this._scenarioRepository = new ScenarioRepository);
    }
}
