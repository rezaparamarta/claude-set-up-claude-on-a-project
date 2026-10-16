/**
 * Converts a string to upper case.
 * @param {string} s - The input string.
 * @returns {string} The upper-cased string.
 */
function upper(s) {
    return s.toUpperCase();
}

/**
 * Reverses a string, keeping multi-code-unit characters (e.g. emoji) intact.
 * @param {string} s - The input string.
 * @returns {string} The reversed string.
 */
function reverse(s) {
    return Array.from(s).reverse().join('');
}

module.exports = { upper, reverse };
