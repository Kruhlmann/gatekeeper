import * as adjectives from "./adjectives.json";
import * as nouns from "./nouns.json";

const sexes = ["non-binary", "male", "female"];
const races = ["orc", "human", "troll", "gnome"];
const weapon_types = ["sword", "mace", "axe", "dagger"];
const weapon_subtypes = ["dual wielded", "2 handed"];
const targets = ["Lucifron", "Magmadar", "Gehennas", "Garr", "Shazzrah", "Baron Geddon", "Golemagg the Incinerator", "Sulfuron Harbinger", "Majordomo Executus", "Ragnaros"];

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

function arr_random(arr: any[]): any {
    return arr[Math.floor(Math.random() * arr.length)];
}

function hit_cap_generator(): {answer: string, seed: string, text: string} {
    const sex = arr_random(sexes) as string;
    const race = arr_random(races) as string;
    const weapon_subtype = arr_random(weapon_subtypes) as string;
    let weapon_type = arr_random(weapon_types) as string;
    if (weapon_type === "dagger" && weapon_subtype =="2 handed") {
        weapon_type = "staff";
    }
    const target = arr_random(targets) as string;
    const orc_factor = race === "orc" && weapon_type === "axe" ? 5 : 0;
    const human_factor = race === "human" && (weapon_type === "mace" || weapon_type === "sword") ? 5 : 0;
    const weapon_skill = 300 + orc_factor + human_factor;
    const yellow_hits = Math.random() < 0.5;
    const front = Math.random() < 0.5;

    const guild_adjective = arr_random(adjectives.words);
    const guild_noun = arr_random(nouns.words);
    const guild_name = title_case(`${guild_adjective} ${guild_noun}`);
    const scenario = `You (a **${sex} ${race}** DPS fury warrior in **<${guild_name}>**) is attacking **${target}** from **${front ? "the front" : "behind"}** using your **${weapon_subtype} ${weapon_type}${weapon_subtype == "dual wielded" ? "s" : ""}**`;
    const question = `Given these parameters what is your **${yellow_hits ? "yellow" : "white"}** hit cap (rounded down)?\n\nAnswer example: \`13\``;

    let answer = weapon_skill === 300 ? 9 : 6;
    if (weapon_subtype == "dual wielded" && !yellow_hits) {
        answer = weapon_skill === 300 ? 27 : 24;
    }

    return {
        answer: `${answer}`,
        seed: (Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 32) + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 32)).toUpperCase(),
        text: `${scenario}\n\n${question}`,
    };
}

const generators: Function[] = [
    hit_cap_generator,
];

export function generate(): {answer: string, seed: string, text: string} {
    return arr_random(generators)()
}

