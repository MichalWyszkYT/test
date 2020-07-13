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
const contentTypes = {
    png: { 'content-type': 'image/png' },
    json: { 'content-type': 'application/json'},
}
const serve = (path, res, contentType = {}) => {
    const file = fs.createReadStream(path);
    // No need to set content type because Optifine doesn't have checks for that
    send(res, 200, file, contentType);
};
const pass = (url, res) => {
    http.get(`http://${optifineHost}${url}`, (data) => {
        send(res, data.statusCode, data, data.headers);
    });
};
const notFound = (res) => {
    send(res, 404, 'Not found');
};

function getPrefs(req) {
    let ipAddress = '';
    if (req.headers['x-real-ip']) {
        ipAddress = req.headers['x-real-ip'];
    } else {
        ipAddress = req.connection.remoteAddress;
    }
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
async function fileExists(path) {
    try {
        await fs.promises.stat(path);
        return true;
    } catch(err) {
        return false;
    }
  }

const polka = Polka();

polka.get('/capes/:user.png', async (req, res) => {
    const prefs = getPrefs(req);
    const path = `${__dirname}/${prefs.dataFolder}/capes/${req.params.user}.png`;
    if (await fileExists(path) && shouldServeCustom(req.params.user, prefs)) {
        serve(path, res, contentTypes.png);
    } else {
        if (prefs.blockOFCustomCapes
            && OFCustomCapesUsers.includes(req.params.user)) {
            notFound(res);
        }
        http.get(`http://${optifineHost}/capes/${req.params.user}.png`, async (data) => {
            if (data.statusCode === 200) {
                const imageProcessor = sharp();
                data.pipe(imageProcessor);
                imageProcessor.metadata().then((metadata) => {
                    if (metadata.width === capeWidths.classic
                        && !prefs.blockClassicCapes) {
                        send(res, 200, imageProcessor.png(), contentTypes.png);
                    } else if (metadata.width === capeWidths.banner
                            && !prefs.blockBannerCapes) {
                        send(res, 200, imageProcessor.png(), contentTypes.png);
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

polka.get('/users/:user.cfg', async (req, res) => {
    const prefs = getPrefs(req);
    const path = `${__dirname}/${prefs.dataFolder}/users/${req.params.user}.cfg`;
    if (await fileExists(path) && shouldServeCustom(req.params.user, prefs)) {
        serve(path, res, contentTypes.json);
    } else if (config.blockRemoteConfig) {
        notFound(res);
    } else {
        pass(req.path, res);
    }
});

polka.get('/items/:model/model.cfg', async (req, res) => {
    const prefs = getPrefs(req);
    const path = `${__dirname}/${prefs.dataFolder}/items/${req.params.model}/model.cfg`;
    if (await fileExists(path)
        && shouldServeCustom(req.params.user, prefs)
        && prefs.allowCustomPlayerModels) {
        serve(path, res, contentTypes.json);
    } else if (prefs.blockPlayerModels) {
        notFound(res);
    } else {
        pass(req.path, res);
    }
});

polka.get('/items/:model/users/:user.png', async (req, res) => {
    const prefs = getPrefs(req);
    const path = `${__dirname}/${prefs.dataFolder}/items/${req.params.model}/users/${req.params.user}.png`;
    if (await fileExists(path)
        && shouldServeCustom(req.params.user, prefs)
        && prefs.allowCustomPlayerModels) {
        serve(path, res, contentTypes.png);
    } else if (prefs.blockPlayerModels) {
        notFound(res);
    } else {
        pass(req.path, res);
    }
});

polka.get('/ipAddress', async (req, res) => {
    send(res, 200, req.headers['x-real-ip']);
});

polka.get('/myConfig', async (req, res) => {
    const prefs = getPrefs(req);
    send(res, 200, prefs, { 'content-type': 'application/json' });
});

polka.get('/*', async (req, res) => {
    const prefs = getPrefs(req);
    if (prefs.blockUnhandledRequests) {
        notFound(res);
    } else {
        pass(req.path, res);
    }
});

polka.listen(config.listenPort);
