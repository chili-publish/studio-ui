/* eslint-disable no-console */
const { exec } = require('child_process');
const fs = require('fs');

exec(
    'npm-license-scraper --export --exclude=@chili-publish/editor-components,@chili-publish/editor-sdk',
    (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        parseJsonLicenses();
    },
);

const validLicenses = ['MIT', 'BSD', 'APACHE-2.0'];
function parseJsonLicenses() {
    const licenses = JSON.parse(fs.readFileSync('./licenses.json', 'utf8'));
    fs.unlinkSync('./licenses.json');
    // iterate licenses and fail if exist one license differet of MIT
    licenses.forEach((license) => {
        if (license.license && !validLicenses.includes(license.license.toUpperCase()))
            throw new Error(`${license.package} has a not allowed license`);
    });
}
