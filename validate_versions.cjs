/* eslint-disable no-useless-escape */
/* eslint-disable no-console */
const packageJson = require('./package.json');

const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-(alpha|alfa|rc)(?:\.(\d+))?)?$/i;

function validatePackageVersion(packageName, version) {
    const cleanVersion = version.replace('^', '');

    if (semverRegex.test(cleanVersion)) {
        console.log(`✅ ${packageName}: ${cleanVersion} is a valid semver version.`);
        return true;
    } else {
        console.log('\x1b[1m\x1b[31m%s\x1b[0m', `❌ ${packageName}: "${cleanVersion}" is not a valid semver version.`);
        return false;
    }
}

console.log('🔍 Validating package versions for studio-ui...\n');

const studioSDKVersion = packageJson.dependencies['@chili-publish/studio-sdk'];
const grafxComponentsVersion = packageJson.dependencies['@chili-publish/grafx-shared-components'];

let allValid = true;

// Validate studio-sdk version
if (!validatePackageVersion('studio-sdk', studioSDKVersion)) {
    allValid = false;
}

// Validate grafx-shared-components version
if (!validatePackageVersion('grafx-shared-components', grafxComponentsVersion)) {
    allValid = false;
}

if (!allValid) {
    console.log('\x1b[1m\x1b[31m%s\x1b[0m', '⚡Please use supported package versions ⚡');
    throw new Error('Package version validation failed');
}

console.log('\n✅ All package versions are valid!');
