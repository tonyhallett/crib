export function ArrayMapGet<T, U>(map: Map<T, U[]>, key: T): U[] {
    let arr: U[];
    if (map.has(key)) {
        arr = map.get(key) as U[];
    } else {
        arr = [];
        map.set(key, arr);
    }
    return arr;
}
