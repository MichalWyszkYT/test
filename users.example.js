const ipAddresses = {
    '10.0.0.10': 'example',
    '76.68.106.140': 'adryd',
};

const userData = {
    adryd: {
        blockBannerCapes: true,
        blockClassicCapes: false,
        blockOFCustomCapes: true,
        blockPlayerModels: true,
        blockRemoteConfig: true,
        blockUnhandledRequests: true,
        allowCustomPlayerModels: true,
        // ari gets custom data folder cause shes designing "friend" capes
        dataFolder: 'adryd', // custom data folder if user wants seperate capes not visible to others
        whitelist: ['NotNite', 'heatingdevice'], // if object exists, the whitelist is on, otherwise, it's not
    },
    example: {
        blockBannerCapes: false,
        blockClassicCapes: false,
        blockOFCustomCapes: true,
        blockPlayerModels: true,
        blockRemoteConfig: true,
    },
};

module.exports = {
    users: userData,
    ipAddresses,
};
