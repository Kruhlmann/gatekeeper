import { Captcha, CombatScenario } from "../typings/types";

const glancing_blow_captcha_description =
    "the chance that your auto attacks land a glancing blow (**rounded up to nearest 1/10th**)?";
const glancing_blow_captcha_example_answer = 5.2;

export function generate_glancing_blow_captcha(
    scenario: CombatScenario
): Captcha {
    const captcha_answer = get_glancing_blow_chance(scenario);
    return {
        answer: captcha_answer.toFixed(1),
        description: glancing_blow_captcha_description,
        example: glancing_blow_captcha_example_answer,
    };
}

export function get_glancing_blow_chance(scenario: CombatScenario): number {
    const glancing_blow_chance_base = 10;
    const weapon_skill = Math.min(300, scenario.weapon.skill);
    const skill_delta = scenario.target.defense - weapon_skill;
    const chance_modifier = skill_delta * 2;
    const glancing_blow_chance = glancing_blow_chance_base + chance_modifier;
    const rounded_answer = Math.ceil(glancing_blow_chance / 10) * 10;
    return rounded_answer;
}
