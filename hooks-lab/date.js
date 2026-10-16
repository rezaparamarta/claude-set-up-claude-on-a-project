/**
 * Returns today's date in UTC as a YYYY-MM-DD string.
 * @returns {string} Today's date, e.g. "2026-10-15".
 */
function today() {
    return new Date().toISOString().slice(0, 10);
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns the English name of the weekday for a date, in local time.
 * @param {Date} date - The date to inspect.
 * @returns {string} The weekday name, e.g. "Thursday".
 */
function dayOfWeek(date) {
    return DAY_NAMES[date.getDay()];
}

module.exports = { today, dayOfWeek };
