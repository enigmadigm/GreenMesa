module.exports = {
    log: (e) => {
        if (e) {
            return console.log(new Date().toString(), e.stack || e);
        }
    }
}