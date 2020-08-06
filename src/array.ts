export function get_random_item_in_array<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}
