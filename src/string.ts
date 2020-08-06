export function capitalize_every_word(string_of_words: string): string {
    let split_string = string_of_words.toLowerCase().split(" ");
    for (let i = 0; i < split_string.length; i++) {
        const upper_case_first_char = split_string[i].charAt(0).toUpperCase();
        const rest_of_word = split_string[i].substring(1);
        split_string[i] = upper_case_first_char + rest_of_word;
    }
    return split_string.join(" ");
}
