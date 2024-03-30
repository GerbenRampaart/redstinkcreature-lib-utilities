const isTest = process.env.NODE_ENV === "test";
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";
const isRepl = process.env.NODE_ENV === "repl";
const isDebug = isTest || isDevelopment || isRepl;

export const NodeEnv = {
  isTest,
  isDevelopment,
  isProduction,
  isRepl,
  isDebug,
};
