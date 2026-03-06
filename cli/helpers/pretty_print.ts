export enum Colours {
  Red = "\x1b[31m",
  Blue = "\x1b[34m",
  Green = "\x1b[32m",
  Gray = "\x1b[90m",
}

export type WioPrint = {
  text: string;
  colour: Colours;
};

export function pp(print: WioPrint) {
  const reset = "\x1b[0m";
  console.log(`${print.colour}${print.text}${reset}`);
}
