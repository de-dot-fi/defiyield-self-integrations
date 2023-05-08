export function join(...parts: string[]): string {
  return parts
    .join('/')
    .split('/')
    .filter(Boolean)
    .join('/')
    .replace(/(http(s?)):\//, '$1://');
}
