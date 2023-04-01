# studio-end-user-workspace

This repository includes the end-user-workspace, which will be used by CHILI GraFx end users

## Deployment

Live demo's on different environments:

-   Staging (latest development): TBD
-   Stable (latest master branch): TBD

## Dependencies

-   yarn ^1.22.10
-   node ^18

## Install other dependencies

be sure to add your Github Personal Access token to your local(_per-user config_) .npmrc file (npmrc file for windows, ~/.npmrc for mac / linux)

example .npmrc file:

```
//npm.pkg.github.com/:_authToken=${YOUR_GH_PAT}
@chili-publish:registry=https://npm.pkg.github.com/
@fortawesome:registry=https://npm.fontawesome.com/
//npm.fontawesome.com/:_authToken=${YOUR_FA_AUTHTOKEN}
```

-   YOUR_GH_PAT can be created in [the developer settings of your github account](https://github.com/settings/tokens)
-   The fontawesome token can be provided by one of the devs.

`npm login --scope=@chili-publish --registry=https://npm.pkg.github.com`

!! you need to login with your github credentials, when asked for a password, fill-in the PAT you used in the local .npmrc file

## Local development

### Link local instance of components repository

To work on the [grafx-shared-components library](https://github.com/chili-publish/grafx-shared-components) or the [editor-sdk library](https://github.com/chili-publish/editor-sdk), you will need to link your local instance to the package.json of this repository.
To simply do this, we use the `yarn link` functionality. To make it even more easier, it is adviced to make an alias in your .bashrc file.
If a new package will be installed,please check the package license information.

#### Manual

-   run `yarn build && yarn link` inside grafx-shared-components repo
-   run `yarn link @chili-publish/grafx-shared-components` inside studio-end-user-workspace (this) repo

#### Alias in .bashrc

`alias linkcomponents='cd ~/path/to/grafx-shared-components && yarn build && yarn link && cd ~/path/to/studio-end-user-workspace && yarn link @chili-publish/grafx-shared-components'`
`alias linksdk='cd ~/path/to/editor-sdk && yarn build && yarn link && cd ~/path/to/studio-end-user-workspace && yarn link @chili-publish/editor-sdk'`
## Scripts

### Start the dev application

`yarn start`

### Make production build

`yarn build`
