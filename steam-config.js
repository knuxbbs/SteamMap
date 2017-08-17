var steam = require('steam-web');

var s = new steam({
    apiKey: 'E269D6F5FFA312DB61D4975057E2C191',
    format: 'json'
});

module.exports = s;