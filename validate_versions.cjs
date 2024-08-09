const packageJson = require('./package.json');

const SDKVersion = packageJson.dependencies['@chili-publish/studio-sdk'].replace('^', '');
const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([\da-z\-]+(?:\.[\da-z\-]+)*))?(?:\+([\da-z\-]+(?:\.[\da-z\-]+)*))?$/i;

if (semverRegex.test(SDKVersion)) {
    console.log(`${SDKVersion} is a valid semver version.`);
} else {
    console.log('\x1b[1m\x1b[31m%s\x1b[0m', `${SDKVersion} is not a valid semver version.`);
    console.log('\x1b[1m\x1b[31m%s\x1b[0m', '⚡Please use a supported studio-sdk version ⚡');

    throw new Error();
}
