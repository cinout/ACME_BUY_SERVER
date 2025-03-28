const info = (...params: unknown[]) => {
  console.log(...params);
};

const error = (...params: unknown[]) => {
  console.error(...params);
};

const logger = { info, error };

export default logger;
