export function createMap<T>(obj: { [key: string]: T }) {
  return new Map(Object.entries(obj));
}
