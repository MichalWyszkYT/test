const Polka = require('polka');
const send = require('@polka/send-type');
const sharp = require('sharp');
const fs = require('fs');
const http = require('http');

const config = require('./config.js');
const userData = require('./users.js');

const optifineHost = '107.182.233.85';
const OFCustomCapesUsers = [
    // 'sp614x', // sp doesn't have a custom cape at the moment
    'filefolder3',
    'EskiMojo14',
    'therealokin',
    'GibMinecon',
    'jckt',
    'J4K___', // jckt alternates his username a lot
];
const capeWidths = {
    classic: 46,
    banner: 2 * 46,
};
const png = { 'content-type': 'image/png' }; // just short form ig

const serve = (path, res) => {
    const file = fs.createReadStream(path);
    // No need to set content type because Optifine doesn't have checks for that
    send(res, 200, file, png);
};
const pass = (url, res) => {
    http.get(`http://${optifineHost}${url}`, (data) => {
        send(res, data.statusCode, data, data.headers);
    });
};
const notFound = (res) => {
    send(res, 404, 'Not found');
};

function getPrefs(ipAddress) {
    if (userData.ipAddresses[ipAddress]
        && userData.users[userData.ipAddresses[ipAddress]]) {
        const userPrefs = Object.assign(
            config.defaultPrefs,
            userData.users[userData.ipAddresses[ipAddress]],
        );
        return userPrefs;
    }
    return config.defaultPrefs;
}
function shouldServeCustom(user, prefs) {
    if (prefs.whitelist) {
        if (prefs.whitelist.includes(user)) {
            return true;
        }
        return false;
    }
    return true;
}

const polka = Polka();

polka.get('/capes/:user.png', (req, res) => {
    const prefs = getPrefs(req.headers['x-real-ip']);
    const path = `${__dirname}/${prefs.dataFolder}/capes/${req.params.user}.png`;
    if (fs.existsSync(path) && shouldServeCustom(req.params.user, prefs)) {
        serve(path, res);
    } else {
        if (prefs.blockOFCustomCapes
            && OFCustomCapesUsers.includes(req.params.user)) {
            notFound(res);
        }
        http.get(`http://${optifineHost}/capes/${req.params.user}.png`, (data) => {
            if (data.statusCode === 200) {
                const imageProcessor = sharp();
                data.pipe(imageProcessor);
                imageProcessor.metadata().then((metadata) => {
                    if (metadata.width === capeWidths.classic
                        && !prefs.blockClassicCapes) {
                        send(res, 200, imageProcessor.png(), png);
                    } else if (metadata.width === capeWidths.banner
                            && !prefs.blockBannerCapes) {
                        send(res, 200, imageProcessor.png(), png);
                    } else {
                        // something else
                        notFound(res);
                    }
                });
            } else {
                notFound(res);
            }
        });
    }
});

polka.get('/users/:user.cfg', (req, res) => {
    const prefs = getPrefs(req.headers['x-real-ip']);
    const path = `${__dirname}/${prefs.dataFolder}/configs/${req.params.user}.cfg`;
    if (fs.existsSync(path) && shouldServeCustom(req.params.user, prefs)) {
        serve(path, res);
    } else if (config.blockRemoteConfig) {
        notFound(res);
    } else {
        pass(req.path, res);
    }
});

polka.get('/items/:model/:modelName.cfg', (req, res) => {
    const prefs = getPrefs(req.headers['x-real-ip']);
    const path = `${__dirname}/${prefs.dataFolder}/items/${req.params.model}/${req.params.model}.cfg`;
    if (fs.existsSync(path)
        && shouldServeCustom(req.params.user, prefs)
        && prefs.allowCustomPlayerModels) {
        serve(path, res);
    } else if (prefs.blockPlayerModels) {
        notFound(res);
    } else {
        pass(req.path, res);
    }
});

polka.get('/items/:model/users/:user.png', (req, res) => {
    const prefs = getPrefs(req.headers['x-real-ip']);
    const path = `${__dirname}/${prefs.dataFolder}/items/${req.params.model}/users/${req.params.user}.png`;
    if (fs.existsSync(path)
        && shouldServeCustom(req.params.user, prefs)
        && prefs.allowCustomPlayerModels) {
        serve(path, res);
    } else if (prefs.blockPlayerModels) {
        notFound(res);
    } else {
        pass(req.path, res);
    }
});

polka.get('/ipAddress', (req, res) => {
    send(res, 200, req.headers['x-real-ip']);
});

polka.get('/myConfig', (req, res) => {
    const prefs = getPrefs(req.headers['x-real-ip']);
    send(res, 200, prefs, { 'content-type': 'application/json' });
});

polka.get('/*', (req, res) => {
    const prefs = getPrefs(req.headers['x-real-ip']);
    if (prefs.blockUnhandledRequests) {
        notFound(res);
    } else {
        pass(req.path, res);
    }
});

polka.listen(config.listenPort);
