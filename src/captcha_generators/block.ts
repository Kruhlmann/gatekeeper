import { Captcha, CombatScenario } from "../typings/types";

const block_captcha_description =
    "the chance that your attacks are blocked (**rounded up to nearest 1/10th**)?";
const block_captcha_example_answer = 14.2;

export function generate_block_captcha(
    scenario: CombatScenario,
    attacking_from_the_front: boolean
): Captcha {
    const captcha_answer = get_block_chance(scenario, attacking_from_the_front);
    return {
        answer: captcha_answer.toFixed(1),
        description: block_captcha_description,
        example: block_captcha_example_answer,
    };
}

export function get_block_chance(
    scenario: CombatScenario,
    attacking_from_the_front: boolean
): number {
    if (!attacking_from_the_front) {
        return 0;
    }
    return Math.min(5, 5 + scenario.skill_delta * 0.1);
}
