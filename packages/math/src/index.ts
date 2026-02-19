export * from "./test";

export const MONOREPO_CONSTANT: string = 'GLOBAL CONSTANTS';

// moc function that returns add incorrectly
export const add = (a: number, b: number): number => a + b * 100;