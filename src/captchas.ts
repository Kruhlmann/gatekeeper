import * as adjectives from "../res/adjectives.json";
import * as nouns from "../res/nouns.json";
import { Scenario, CombatScenario, Captcha } from "./typings/types";

const sexes = ["non-binary", "male", "female"];
const races = ["orc", "human", "troll", "gnome"];
const weapons = [
    ["sword", "dual wielded"],
    ["sword", "2 handed"],
    ["mace", "dual wielded"],
    ["mace", "2 handed"],
    ["axe", "dual wielded"],
    ["axe", "2 handed"],
    ["dagger", "dual wielded"],
    ["fist", "dual wielded"],
    ["staff", "2 handed"],
    ["polearm", "2 handed"],
];
const targets = [
    "Firelord",
    "Lava Reaver",
    "Lava Surger",
    "Firewalker",
    "Core Hound",
    "Lava Annihilator",
];
const min_lvl = 57;
const max_lvl = 63;

function title_case(str: string): string {
    let splitStr = str.toLowerCase().split(" ");
    for (let i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] =
            splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(" ");
}

/**
 * Returns a random element in an array.
 *
 * @param arr - Array of elements.
 * @returns - A random element in the array.
 */
function arr_random(arr: any[]): any {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates random data for a scenario.
 *
 * @returns - Scenario data.
 */
function make_scenario(): Scenario {
    const sex = arr_random(sexes) as string;
    const race = arr_random(races) as string;
    const sex_prefix = sex === "male" && race === "human" ? "bald" : "";
    const guild_adjective = arr_random(adjectives.words);
    const guild_noun = arr_random(nouns.words);
    const guild_name = title_case(`${guild_adjective} ${guild_noun}`);

    return { sex, race, sex_prefix, guild_name };
}

/**
 * Generates a random combat scenario.
 *
 * @returns - Scenario data.
 */
function make_combat_scenario(): CombatScenario {
    const scenario = make_scenario();
    const [weapon_type, weapon_subtype]: [string, string] = arr_random(weapons);
    const orc_factor = scenario.race === "orc" && weapon_type === "axe" ? 5 : 0;
    const human_factor =
        scenario.race === "human" &&
        (weapon_type === "mace" || weapon_type === "sword")
            ? 5
            : 0;
    const weapon_skill = 300 + orc_factor + human_factor;

    const target_name = arr_random(targets) as string;
    const target_lvl = Math.round(
        Math.random() * (max_lvl - min_lvl) + min_lvl
    );

    return {
        ...scenario,
        weapon: {
            type: weapon_type,
            subtype: weapon_subtype,
            skill: weapon_skill,
        },
        target: {
            name: target_name,
            level: target_lvl,
            defense: target_lvl * 5,
        },
        skill_delta: target_lvl * 5 - weapon_skill,
    };
}

function calc_mitigation(
    mitigation_type: string,
    front: boolean,
    scenario: CombatScenario,
    yellow_hits: boolean
): { answer: number; query: string; example: string } {
    const miss_modifier = scenario.skill_delta > 10 ? 0.2 : 0.1;
    const miss_penalty = scenario.skill_delta > 10 ? 1 : 0;
    let answer: number;
    let example: string;
    let query: string;

    if (mitigation_type !== "none") {
        // Mitigation type is either block, dodge, parry or glancing.
        switch (mitigation_type) {
            case "parry":
                // TODO: This has no formula yet.
                const parry_chance = 10;
                answer = Math.ceil(parry_chance / 10) * 10;
                query =
                    "the chance that your attacks are parried (**rounded up to nearest 1/10th**)?";
                example = "19.4";
                break;
            case "block":
                const block_chance = front
                    ? Math.min(5, 5 + scenario.skill_delta * 0.1)
                    : 0;
                answer = block_chance;
                query =
                    "the chance that your attacks are blocked (**rounded up to nearest 1/10th**)?";
                example = "14.2";
                break;
            case "dodge":
                const dodge_chance = 5 + scenario.skill_delta * 0.1;
                answer = dodge_chance;
                query =
                    "the chance that your attacks are dodged (**rounded up to nearest 1/10th**)?";
                example = "7.2";
                break;
            case "glancing":
                const glancing_chance =
                    10 +
                    (scenario.target.defense -
                        Math.min(300, scenario.weapon.skill)) *
                        2;
                answer = Math.ceil(glancing_chance / 10) * 10;
                query =
                    "the chance that your auto attacks land a glancing blow (**rounded up to nearest 1/10th**)?";
                example = "5.2";
                break;
            default:
                throw new Error(`Unknown mitigation type: ${mitigation_type}`);
        }
    } else {
        // No mitigation type means hit cap calculation.
        let miss_chance = 5 + scenario.skill_delta * miss_modifier;
        // DWMissChance = NormalMissChance * 0.8 + 20%.
        // This only applies to white hits.
        if (scenario.weapon.subtype === "dual wielded" && !yellow_hits) {
            miss_chance = miss_chance * 0.8 + 20;
        }
        answer = Math.ceil(miss_chance + miss_penalty);
        query = `your **${
            yellow_hits ? "yellow" : "white"
        }** hit cap (rounded up to nearest 1/10th)?`;
        example = "13.1";
    }

    return { answer, query, example };
}

function generate_scenario_text(
    scenario: CombatScenario,
    front: boolean
): string {
    return `You (a **${
        scenario.sex_prefix !== "" ? `${scenario.sex_prefix} ` : ""
    }${scenario.sex} ${scenario.race}** DPS fury warrior in **<${
        scenario.guild_name
    }>**) is attacking a level **${scenario.target.level}** **${
        scenario.target.name
    }** from **${front ? "the front" : "behind"}** using your **${
        scenario.weapon.subtype
    } ${scenario.weapon.type}${
        scenario.weapon.subtype == "dual wielded" ? "s" : ""
    }**`;
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
        : arr_random(["none", "dodge", "block", "glancing"]);
    const yellow_hits =
        _yellow_hits !== undefined ? _yellow_hits : Math.random() < 0.5;
    const front =
        _front !== undefined
            ? _front || mitigation_type === "block"
            : Math.random() < 0.5 || mitigation_type === "block";
    const mitigation_calc = calc_mitigation(
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
        text: `${scenario_txt}\n\n${question}`,
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
    return arr_random(generators)();
}
