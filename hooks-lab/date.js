/** Returns today's date as YYYY-MM-DD. */
function today() {
    function today() {
        return new Date().toISOString().slice(0, 10);
    }
}

module.exports = { today };