/* eslint-disable no-console */
const packageJson = require('./package.json');

const wrsVersion = packageJson.version.split('.');
const SDKVersion = packageJson.dependencies['@chili-publish/studio-sdk'].replace('^', '').split('.');

if (wrsVersion[0] !== SDKVersion[0] || wrsVersion[1] !== SDKVersion[1]) {
    console.log('\x1b[36m%s\x1b[0m', `Studio UI version ==> ${wrsVersion.join('.')}`);
    console.log('\x1b[36m%s\x1b[0m', `Studio SDK version ==> ${SDKVersion.join('.')}`);
    console.log('\x1b[1m\x1b[31m%s\x1b[0m', '⚡Please align major and minor version of Studio UI with Studio SDK ⚡');

    throw new Error();
}
