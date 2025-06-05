/**
 * Create an object composed of the picked object properties
 * @param {Object} object - The source object
 * @param {string[]} keys - The keys to pick from the source object
 * @returns {Object} - The new object with only the picked properties
 */
export const pick = <T, K extends keyof T>(
  object: T,
  keys: K[]
): Partial<T> => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // eslint-disable-next-line no-param-reassign
      ;(obj as T)[key] = object[key]
    }
    return obj
  }, {} as Partial<T>)
}
