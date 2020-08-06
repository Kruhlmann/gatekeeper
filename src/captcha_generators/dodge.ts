import { Captcha, CombatScenario } from "../typings/types";

const dodge_captcha_description =
    "the chance that your attacks are dodged (**rounded up to nearest 1/10th**)?";
const dodge_captcha_example_answer = 7.2;

export function generate_dodge_captcha(scenario: CombatScenario): Captcha {
    const captcha_answer = get_dodge_chance(scenario);
    return {
        answer: captcha_answer.toFixed(1),
        description: dodge_captcha_description,
        example: dodge_captcha_example_answer,
    };
}

export function get_dodge_chance(scenario: CombatScenario): number {
    const base_dodge_chance = 5;
    const delta_based_dodge_chance = scenario.skill_delta * 0.1;
    return base_dodge_chance + delta_based_dodge_chance;
}
