const styled =
  (colour: string, skipInMinimal = false) =>
  (text: string) => {
    if (process.env.NO_COLOR) return text;
    if (skipInMinimal && process.env.WIO_MINIMAL_COLOR) return text;
    return `${colour}${text}\x1b[0m`;
  };

export const c = {
  red: styled("\x1b[31m"),
  green: styled("\x1b[32m"),
  blue: styled("\x1b[34m", true),
  dim: styled("\x1b[90m", true),
};

export const printError = (text: string) => console.error(c.red(text));
export const printSuccess = (text: string) => console.log(c.green(text));
export const printInfo = (text: string) => console.log(c.dim(text));
