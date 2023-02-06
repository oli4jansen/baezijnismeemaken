import { red, yellow } from "../deps.ts";

/**
 * Tries to get a key from the environment, falls back to a default value with the option to save the
 * default value to the .env file.
 */
export const fromEnv = async (key: string, _default?: (() => Promise<string> | string) | string, askToSave = false) => {
  // Get the value from the .env file
  let value = Deno.env.get(key);

  // If the value is not undefined, return the value
  if (value !== undefined) {
    return value;
  }

  if (_default !== undefined) {
    // Otherwise, log that we're falling back to the default value.
    // To create a reproducable production environment, make sure to solve all these.
    console.log(yellow(`Unable to find ${key} in .env file. Falling back to the default value.`));

    // Get the default value
    value = await getDefault(_default);
  } else {
    throw new Error(`Fatal error: no ${key} in .env file.`);
  }

  // If askToSave is true, ask the user if the default value should be stored in the .env file
  // This way, these issues can automatically be resolved the first time the server starts.
  if (askToSave) {
    const save = prompt(yellow(`Do you want to store the default value for ${key} in your .env file [y/N]?`));
    if (save === 'y' || save === 'Y') {
      await Deno.writeTextFile('.env', `\n${key}=${value}`, { append: true });
    }
  }

  return value;
};

/**
 * Get a value from the .env file that will be parsed as a number.
 */
export const numberFromEnv = async (key: string, _default: (() => Promise<number> | number) | number, askToSave = false): Promise<number> => {
  try {
    const str = await fromEnv(key, async () => `${await getDefault(_default)}`, askToSave);
    return parseInt(str, 10);
  } catch (error) {
    console.log(red(`Fatal error: expected value for ${key} to be parsable as a number but it wasn't.`));
    throw error;
  }
};

/**
 * Get a value from the .env file that will be parsed as a boolean.
 */
export const booleanFromEnv = async (key: string, _default: (() => Promise<boolean> | boolean) | boolean, askToSave = false): Promise<boolean> => {
  try {
    const str = await fromEnv(key, async () => `${await getDefault(_default)}`, askToSave);
    return str === 'true' || str === 'TRUE';
  } catch (error) {
    console.log(red(`Fatal error: expected value for ${key} to be parsable as a number but it wasn't.`));
    throw error;
  }
};

/**
 * Overwrites an environment variable (but doesn't write this change to .env)
 */
export const toEnv = (key: string, value: string) => {
  Deno.env.set(key, value);
};

/**
 * Unwraps default values from possible async functions
 */
const getDefault = async <T extends number | string | boolean>(_default: (() => Promise<T> | T) | T): Promise<T> => {
  if (typeof _default === 'function') {
    return await _default();
  } else {
    return _default;
  }
};
