export const noop = () => {
};

/**
 * Compress movie name (remove white spaces and toLower) to
 * enable case insensitive search by movie name
 * @param name
 */

export const compressMovieName = (name = ''): string => {
  return name.replace(/\s/g, '').toLowerCase();
};
