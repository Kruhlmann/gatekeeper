import { Captcha, CombatScenario } from "../typings/types";

const hit_captcha_example_answer = 13.1;

export function generate_hit_captcha(
    scenario: CombatScenario,
    yellow_attacks_only: boolean
): Captcha {
    const captcha_answer = get_miss_chance(scenario, yellow_attacks_only);
    const hit_captcha_description = generate_hit_captcha_desciption(
        yellow_attacks_only
    );
    return {
        answer: captcha_answer,
        description: hit_captcha_description,
        example: hit_captcha_example_answer,
    };
}

export function get_miss_chance(
    scenario: CombatScenario,
    yellow_attacks_only: boolean
): number {
    if (scenario.weapon.subtype === "dual wielded" && !yellow_attacks_only) {
        return get_dual_wield_miss_chance(scenario);
    }
    return get_base_miss_chance(scenario);
}

export function get_base_miss_chance(scenario: CombatScenario): number {
    const miss_modifier = get_miss_modifier(scenario);
    const miss_penalty = get_miss_penalty(scenario);
    const base_miss_chance = 5 + scenario.skill_delta * miss_modifier;
    return base_miss_chance + miss_penalty;
}

export function get_dual_wield_miss_chance(scenario: CombatScenario): number {
    const base_miss_chance = get_base_miss_chance(scenario);
    return base_miss_chance * 0.8 + 20;
}

export function get_miss_penalty(scenario: CombatScenario): number {
    if (scenario.skill_delta > 10) {
        return 1;
    }
    return 0;
}

export function get_miss_modifier(scenario: CombatScenario): number {
    if (scenario.skill_delta > 10) {
        return 0.2;
    }
    return 0.1;
}

export function generate_hit_captcha_desciption(
    yellow_attacks_only: boolean
): string {
    if (yellow_attacks_only) {
        return `the hit from gear required to reach your **yellow** hit cap (rounded up to nearest 1/10th)?`;
    }
    return `the hit from gear required to reach your **white** hit cap (rounded up to nearest 1/10th)?`;
}
