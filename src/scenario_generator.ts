import * as adjectives from "../res/adjectives.json";
import * as nouns from "../res/nouns.json";
import { Scenario, Target, Weapon, CombatScenario } from "./typings/types";
import { get_random_item_in_array } from "./array";
import { capitalize_every_word } from "./string";

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

const min_target_level = 57;
const max_target_level = 63;
const default_weapon_skill = 300;

function get_sex_prefix(sex: string, race: string) {
    if (sex == "male" && race == "human") {
        return "bald";
    }
    return "";
}

function make_scenario(): Scenario {
    const sex = get_random_item_in_array(sexes);
    const race = get_random_item_in_array(races);
    const sex_prefix = get_sex_prefix(sex, race);
    const guild_adjective = get_random_item_in_array(adjectives.words);
    const guild_noun = get_random_item_in_array(nouns.words);
    const guild_name = capitalize_every_word(
        `${guild_adjective} ${guild_noun}`
    );

    return { sex, race, sex_prefix, guild_name };
}

function get_racial_bonus_weapon_skill(
    race: string,
    weapon_type: string
): number {
    const using_orc_weapon = weapon_type === "axe";
    const using_human_weapon =
        weapon_type === "sword" || weapon_type === "hammer";

    if (race === "orc" && using_orc_weapon) {
        return 5;
    }

    if (race === "human" && using_human_weapon) {
        return 5;
    }

    return 0;
}

function get_random_target_level(min_level: number, max_level: number): number {
    return Math.round(Math.random() * (max_level - min_level) + min_level);
}

function generate_random_target(): Target {
    const target_name = get_random_item_in_array(targets);
    const target_level = get_random_target_level(
        min_target_level,
        max_target_level
    );

    return {
        name: target_name,
        level: target_level,
        defense: target_level * 5,
    };
}

function generate_random_weapon(race: string): Weapon {
    const [weapon_type, weapon_subtype] = get_random_item_in_array(weapons);
    const bonus_skill = get_racial_bonus_weapon_skill(race, weapon_type);
    const weapon_skill = default_weapon_skill + bonus_skill;

    return {
        type: weapon_type,
        subtype: weapon_subtype,
        skill: weapon_skill,
    };
}

export function make_combat_scenario(): CombatScenario {
    const scenario = make_scenario();
    const weapon = generate_random_weapon(scenario.race);
    const target = generate_random_target();
    const skill_delta = target.defense - weapon.skill;

    return {
        ...scenario,
        weapon,
        target,
        skill_delta,
    };
}
