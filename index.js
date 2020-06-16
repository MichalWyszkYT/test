const Polka = require('polka');
const send = require('@polka/send-type');
const sharp = require('sharp');
const fs = require('fs');
const http = require('http');

const config = {
    blockBannerCapes: true,
    blockClassicCapes: false,
    blockOFCustomCapes: true,
    blockPlayerModels: true,
    blockRemoteConfig: true,
    blockUnhandledRequests: true,
};
const listenPort = '8080';
const optifineHost = '107.182.233.85';
const OFCustomCapesUsers = [
    'sp614x',
    'filefolder3',
    'EskiMojo14',
    'GibMinecon',
    'jckt',
    'J4K___', // jckt alternates his username a lot
];

const serve = (path, res) => {
    const file = fs.createReadStream(path);
    // No need to set content type because Optifine doesn't have checks for that
    send(res, 200, file);
};
const pass = (url, res) => {
    http.get(`http://${optifineHost}${url}`, (data) => {
        send(res, data.statusCode, data, data.headers);
    });
};
const notFound = (res) => {
    send(res, 404, 'Not found');
};

const polka = Polka();

polka.get('/capes/:user.png', (req, res) => {
    const path = `${__dirname}/capes/${req.params.user}.png`;
    if (fs.existsSync(path)) {
        serve(path, res);
    // If all three are blocked, why bother
    } else if (config.blockBannerCapes
        && config.blockClassicCapes
        && config.blockOFCustomCapes) {
        if (config.blockOFCustomCapes
            && OFCustomCapesUsers.includes(req.params.user)) {
            notFound(res);
        }
        http.get(`http://${optifineHost}/capes/${req.params.user}.png`, (data) => {
            if (data.statusCode === 200) {
                send(res, 200, data); // no processing yet
            } else {
                notFound(res);
            }
        });
    } else {
        notFound(res);
    }
});
polka.get('/users/:user.cfg', (req, res) => {
    const path = `${__dirname}/configs/${req.params.user}.cfg`;
    if (fs.existsSync(path)) {
        serve(path, res);
    } else if (config.blockRemoteConfig) {
        notFound(res);
    } else {
        pass(req.path, res);
    }
});

polka.get('/items/:model/users/:user.png', (req, res) => {
    const path = `${__dirname}/items/${req.params.model}/users/${req.params.user}.png`;
    if (fs.existsSync(path)) {
        serve(path, res);
    } else if (config.blockPlayerModels) {
        notFound(res);
    } else {
        pass(req.path, res);
    }
});

polka.get('/*', (req, res) => {
    if (config.blockUnhandledRequests) {
        notFound(req.path, res);
    } else {
        pass(res);
    }
});

polka.listen(listenPort);
