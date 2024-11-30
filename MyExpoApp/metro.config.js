const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
    const defaultConfig = await getDefaultConfig(__dirname);
    const { assetExts } = defaultConfig.resolver;
    return {
        ...defaultConfig,
        resolver: {
            ...defaultConfig.resolver,
            assetExts: [...assetExts, 'bin', 'json'],
        },
    };
})();