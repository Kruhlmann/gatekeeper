import { CombatScenario, Captcha } from "./typings/types";
import { make_combat_scenario } from "./scenario_generator";
import { get_random_item_in_array } from "./array";
import { generate_block_captcha } from "./captcha_generators/block";
import { generate_dodge_captcha } from "./captcha_generators/dodge";
import { generate_glancing_blow_captcha } from "./captcha_generators/glancing_blow";
import {generate_hit_captcha} from "./captcha_generators/hit";

function calculate_mitigation(
    mitigation_type: string,
    attacking_from_the_front: boolean,
    scenario: CombatScenario,
    yellow_attacks_only: boolean
): Captcha {
    switch (mitigation_type) {
        case "block":
            return generate_block_captcha(
                scenario,
                attacking_from_the_front
            );
        case "dodge":
            return generate_dodge_captcha(scenario);
        case "glancing":
            return generate_glancing_blow_captcha(scenario);
        default:
            return generate_hit_captcha(scenario, yellow_attacks_only)l
    }
}

function generate_scenario_text(
    scenario: CombatScenario,
    front: boolean
): string {
    return `You (a level 60 **${
        scenario.sex_prefix !== "" ? `${scenario.sex_prefix} ` : ""
    }${scenario.sex} ${scenario.race}** DPS fury warrior in **<${
        scenario.guild_name
    }>**) are attacking a level **${scenario.target.level}** **${
        scenario.target.name
    }** from **${front ? "the front" : "behind"}** using your **${
        scenario.weapon.subtype
    } ${scenario.weapon.type}${
        scenario.weapon.subtype == "dual wielded" ? "s" : ""
    }**. You have max weapon skills and no other source of +weapon skill.`;
}

/**
 * Hit cap question generator.
 * What is the chance for a players attacks to be [missed/dodged/glanced, if from the front then also blocked]
 *   Miss
 *     If (MobLevel*5 - AttackerSkill) > 10 then MissChance = 5% + (MobLevel*5 - AttackerSkill) * 0.2%
 *     If (MobLevel*5 - AttackerSkill) <= 10 then MissChance = 5% + (MobLevel*5 - AttackerSkill) * 0.1%
 *     If dual-wielding then MissChance = NormalMissChance * 0.8 + 20%
 *   Dodge = 5% + (MobLevel*5 - AttackerSkill) * 0.1%
 *   Glance = 10% + (MobLevel*5 - MIN(AttackerLevel*5, AttackerSkill)) * 2%
 *   Block = MIN(5%, 5% + (MobLevel*5 - AttackerSkill) * 0.1%)
 *
 * @returns - Message content object.
 */
export function hit_cap_generator(
    _scenario?: CombatScenario,
    _mitigation_type?: string,
    _yellow_hits?: boolean,
    _front?: boolean
): Captcha {
    const scenario = _scenario ? _scenario : make_combat_scenario();
    const mitigation_type = _mitigation_type
        ? _mitigation_type
        : get_random_item_in_array(["none", "dodge", "block", "glancing"]);
    const yellow_hits =
        _yellow_hits !== undefined ? _yellow_hits : Math.random() < 0.5;
    const front =
        _front !== undefined
            ? _front || mitigation_type === "block"
            : Math.random() < 0.5 || mitigation_type === "block";
    const mitigation_calc = calculate_mitigation(
        mitigation_type,
        front,
        scenario,
        yellow_hits
    );

    // Message text.
    const scenario_txt = generate_scenario_text(scenario, front);
    const question = `Given these parameters what is ${mitigation_calc.query}\n\nAnswer example: \`${mitigation_calc.example}\``;

    return {
        answer: Math.max(0, mitigation_calc.answer).toFixed(1),
        description: `${scenario_txt}\n\n${question}`,
    };
}

function wrapper_parry_generator(_scenario?: CombatScenario) {
    return hit_cap_generator(_scenario, "parry");
}
function wrapper_block_generator(_scenario?: CombatScenario) {
    return hit_cap_generator(_scenario, "block");
}
function wrapper_dodge_generator(_scenario?: CombatScenario) {
    return hit_cap_generator(_scenario, "dodge");
}
function wrapper_glancing_generator(_scenario?: CombatScenario) {
    return hit_cap_generator(_scenario, "glancing");
}
function wrapper_hit_cap_generator(_scenario?: CombatScenario) {
    return hit_cap_generator(_scenario, "none");
}

// List of all generators.
export const generators: Function[] = [
    // TODO: Re-add this when we actually have a formula.
    // wrapper_parry_generator,
    wrapper_block_generator,
    wrapper_dodge_generator,
    wrapper_glancing_generator,
    wrapper_hit_cap_generator,
];

/**
 * Returns a random generator function.
 *
 * @returns - Generator function.
 */
export function generate(): Captcha {
    return get_random_item_in_array(generators)();
}
