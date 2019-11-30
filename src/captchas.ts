import * as adjectives from "../res/adjectives.json";
import * as nouns from "../res/nouns.json";

const sexes = ["non-binary", "male", "female"];
const races = ["orc", "human", "troll", "gnome"];
const weapon_types = ["sword", "mace", "axe", "dagger"];
const weapon_subtypes = ["dual wielded", "2 handed"];
const targets = ["Firelord", "Lava Reaver", "Lava Surger", "Firewalker", "Core Hound", "Lava Annihilator"];
const min_lvl = 57;
const max_lvl = 63;

function title_case(str: string): string {
   let splitStr = str.toLowerCase().split(' ');
   for (let i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length, as your for does that for you
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
   }
   // Directly return the joined string
   return splitStr.join(' ');
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
function make_scenario(): {
    sex: string,
    race: string,
    sex_prefix: string,
    guild_name: string,
} {
    const sex = arr_random(sexes) as string;
    const race = arr_random(races) as string;
    const sex_prefix = sex === "male" && race === "human" ? "bald" : "";
    const guild_adjective = arr_random(adjectives.words);
    const guild_noun = arr_random(nouns.words);
    const guild_name = title_case(`${guild_adjective} ${guild_noun}`);

    return { sex, race, sex_prefix, guild_name }
}

function make_combat_scenario() {
    const scenario = make_scenario();
    const weapon_subtype = arr_random(weapon_subtypes) as string;
    let weapon_type = arr_random(weapon_types) as string;
    // There are no 2 handed daggers so fall back to staff if the sub type is
    // 2 handed.
    if (weapon_type === "dagger" && weapon_subtype =="2 handed") {
        weapon_type = "staff";
    }
    const orc_factor = scenario.race === "orc" && weapon_type === "axe" ? 5 : 0;
    const human_factor = scenario.race === "human" && (weapon_type === "mace" || weapon_type === "sword") ? 5 : 0;
    const weapon_skill = 300 + orc_factor + human_factor;

    const target_name = arr_random(targets) as string;
    const target_lvl = Math.round(Math.random() * (max_lvl - min_lvl) + min_lvl);

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
        skill_delta: target_defense - weapon_skill,
    }
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
function hit_cap_generator(): {answer: string, seed: string, text: string} {
    const scenario = make_combat_scenario();

    const mitigation_type = arr_random([false, "parry", "dodge", "block", "glancing"]);
    const yellow_hits = Math.random() < 0.5;
    const front = Math.random() < 0.5 || mitigation_type === "block";
    const miss_modifier = (scenario.skill_delta > 10 ? 0.2 : 0.1);

    let answer: number;
    let answer_example: string;
    let attack_query: string;

    if (mitigation_type) {
        // Mitigation type is either block, dodge, parry or glancing.
        switch (mitigation_type) {
            case "parry":
                // TODO: Ask magey about this calculation, using 10 for now as
                // a replacement.
                const parry_chance = 10;
                answer = Math.ceil(parry_chance / 10) * 10;
                attack_query = "the chance that your attacks are parried (rounded up to nearest 1/10th)?";
                answer_example = "19.4";
                break;
            case "block":
                const block_chance = front ? Math.min(5, 5 + scenario.skill_delta * 0.1) : 0;
                answer = block_chance;
                attack_query = "the chance that your attacks are blocked (rounded up to nearest 1/10th)?";
                answer_example = "14.2";
                break;
            case "dodge":
                const dodge_chance = 5 + scenario.skill_delta * 0.1;
                answer = dodge_chance;
                attack_query = "the chance that your attacks are dodged (rounded up to nearest 1/10th)?";
                answer_example = "7.2";
                break;
            case "glancing":
                const glancing_chance = 10 + ((scenario.target.defense - Math.min(300, scenario.weapon.skill)) * 2);
                answer = Math.ceil(glancing_chance / 10) * 10;
                attack_query = "the chance that you land a glancing blow (rounded up to nearest 1/10th)?";
                answer_example = "5.2";
                break;
            default:
                throw new Error(`Unknown mitigation type: ${mitigation_type}`);
        }
    } else {
        // No mitigation type means hit cap calculation.
        const miss_chance = Math.ceil(5 + scenario.skill_delta * miss_modifier);
        answer = miss_chance;
        attack_query = "your hit cap (rounded up)?"
        answer_example = "13";
    }

    // Message text.
    const scenario_txt = `You (a **${scenario.sex_prefix !== "" ? `${scenario.sex_prefix} ` : ""}${scenario.sex} ${scenario.race}** DPS fury warrior in **<${scenario.guild_name}>**) is attacking a level **${scenario.target.level}** **${scenario.target.name}** from **${front ? "the front" : "behind"}** using your **${scenario.weapon.subtype} ${scenario.weapon.type}${scenario.weapon.subtype == "dual wielded" ? "s" : ""}**`;
    const question = `Given these parameters what is ${attack_query}\n\nAnswer example: \`${answer_example}\` (answer is ${answer} btw)`;
    //  **${yellow_hits ? "yellow" : "white"}**
    return {
        answer: `${answer}`,
        seed: (Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 32) + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 32)).toUpperCase(),
        text: `${scenario_txt}\n\n${question}`,
    };
}

// List of all generators.
export const generators: Function[] = [
    hit_cap_generator,
];

/**
 * Returns a random generator function.
 *
 * @returns - Generator function.
 */
export function generate(): {answer: string, seed: string, text: string} {
    return arr_random(generators)()
}

