function announce(message) {
    alert(message);
}

function log(message) {
    console.log(message);
}

module.exports = {
    announce: announce,
    log: log
}