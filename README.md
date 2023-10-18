# Studio UI

This repository includes the Studio UI, which will be used by CHILI GraFx end users

## Prerequisites

### Tools setup

-   [Node v18](https://nodejs.org/en) is installed
    > node -v # to check existing node version
-   [Yarn v1.22.19](https://classic.yarnpkg.com/lang/en/docs/install/) is installed
    > yarn -v # to check existing yarn version

### Configure .npmrc to access private npm repositories

-   Setup access to `@chili-publish` registry

    -   Generate `GH_ACCESS_TOKEN`: https://github.com/settings/tokens. Ensure that you selected only neccessary scopes (`read:packages`) and expiration time recommendataion is `90 days`.

    -   Login to the repository

    ```bash
    npm login --scope=@chili-publish --registry=https://npm.pkg.github.com
    ```

    > you need to login with your github credentials, when asked for a password, use the previously generated `GH_ACCESS_TOKEN`

Example of the .npmrc (npmrc file for windows, ~/.npmrc for mac / linux) file:

```
//npm.pkg.github.com/:_authToken=${GH_ACCESS_TOKEN}
@chili-publish:registry=https://npm.pkg.github.com/
```

## Getting started

To execute studio ui with empty content

```bash
yarn install
yarn dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.

> To see actual template you have to modife `index.html` file with corresponding configuration

## Deployment

Live demo's on different environments:

-   Staging (latest development): TBD
-   Stable (latest master branch): TBD

## Local development

### Link local instance of components repository

To work on the [grafx-shared-components library](https://github.com/chili-publish/grafx-shared-components) or the [studio-sdk library](https://github.com/chili-publish/studio-sdk), you will need to link your local instance to the package.json of this repository.
To simply do this, we use the `yarn link` functionality. To make it even more easier, it is adviced to make an alias in your .bashrc file.
If a new package will be installed,please check the package license information.

#### Manual

-   run `yarn build && yarn link` inside grafx-shared-components repo
-   run `yarn link @chili-publish/grafx-shared-components` inside studio-ui (this) repo

#### Alias in .bashrc

`alias linkcomponents='cd ~/path/to/grafx-shared-components && yarn build && yarn link && cd ~/path/to/studio-ui && yarn link @chili-publish/grafx-shared-components'`
`alias linksdk='cd ~/path/to/studio-sdk && yarn build && yarn link && cd ~/path/to/studio-ui && yarn link @chili-publish/studio-sdk'`

## Scripts

### Start the dev application

`yarn start`

### Make production build

`yarn build`

### Run linter

`yarn lint`
