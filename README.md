# Studio UI

![Coverage](https://img.shields.io/badge/coverage-79.58%25-red.svg)

This repository includes the source code for the Studio UI application, which will be used by CHILI GraFx end users.
This application is intended to be used with CHILI GraFx (My) Projects, which uses a subset of features from the [studio-sdk](https://github.com/chili-publish/studio-sdk).

This repository can be used as an example of integrating the studio-sdk within your own project, or the application itself can also be integrated within your own projects.

> For the time being, we don't have a framework for external contributions on this repository yet. We made our source available but it's not the intent to accept external pull requests or issues yet. If you found a bug, please contact your CS representative using the known canals.

## Integration guide

### Info to start with

The Studio UI (end user view) will work similar to the GraFx Studio template designer workspace, you simply provide it with
the id of a `<div>` element within your application and it will construct Studio UI into that div.

If you need help generating a token or would like code samples, please see our [Integration Guide](https://docs.chiligrafx.com/CHILI-GraFx/concepts/integrations/)

> Important to note that projects are context based, if you look at the projects on the GraFx platform you are quite literally looking at _YOUR USER_ or \_YOUR USER_APPLICATION projects. That mean that another context doesn't have access to the projects. This means that the integration context doesn't have access to the projects you create on your account in GraFx Platform.

### Perquisites

- A working (preferably new) project
- Some way to serve an html file (webserver like nginx, mamp, apache, ...)
- A little bit of html and javascript knowledge will come in handy

### Basic, all in one example

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <!-- ... insert your own stuff here ... -->
        <!-- link to the studio ui css, to inject the styling -->
        <link rel="stylesheet" href="https://studio-cdn.chiligrafx.com/studio-ui/latest/main.css" />
    </head>
    <body>
        <!-- div where studio ui will be constructed in -->
        <div id="studio-ui-container"></div>

        <!-- 1. ES5 approach script to inject latest studio ui -->
        <script src="https://studio-cdn.chiligrafx.com/studio-ui/latest/bundle.js"></script>

        <!-- OR -->

        <!-- 2. ES Modules approach (recommended one) script to inject latest studio ui -->
        <script type="module">
            import('https://studio-cdn.chiligrafx.com/studio-ui/latest/es-module/bundle.js').then((module) => {
                window.StudioUI = module.default;
            });
        </script>

        <!-- custom logic -->
        <script>
            /* your access token, should be gathered on the fly, is just here for demo purposes. */
            const token = `<YOUR INTEGRATION ACCESS TOKEN>`;
            /* The HTML div for the editor. */
            const studioUIContainer = 'studio-ui-container';
            /* The environment API base url for the environment that you're using in your integration. */
            const environmentBaseURL =
                'https://training-create-us23.chili-publish.online/grafx/api/v1/environment/training-create-us23';
            /* ID of the project you want to load, this is optional and will enable auto-save when used. */
            const projectID = '859dd405-bfed-467f-b833-510afef5fda4';
            /* Name of the project, but can be whatever you want, is only a static indication that is displayed in the UI. */
            const projectName = 'End User view';
            /* Function that refreshes your access token, not providing a proper function can lead to data loss when your token is expired. */
            const refreshTokenAction = () => Promise.resolve(token);

            window.StudioUI.studioUILoaderConfig({
                // Div id to inject studio-ui in
                selector: studioUIContainer,
                // downloadUrl used to fetch the document
                projectDownloadUrl: `${environmentBaseURL}/projects/${projectID}/document`,
                // uploadUrl used to save the changes you did to the document (autosave)
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                // project Id to enable autosave
                projectId: projectID,
                /* environment base URL ex: https://cp-abc-123.chili-publish.online/grafx/api/v1/cp-abc-123 */
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                /* Integration access token */
                authToken: token,
                /* refreshTokenAction, being a function that will return a promise () => Promise<string | Error> */
                refreshTokenAction: refreshTokenAction,
                /* projectName: string, name of the project. Shown in the UI (does not have to be match the real name) */
                projectName: projectName,
                userInterfaceID: userInterfaceID,
            });
        </script>
    </body>
</html>
```

for a more advanced example, and extra information about building an integration go to our [advanced-integration guide](documentation/advanced-integration.md).

## Repository development prerequisites

### Tools setup

- [Node LTS version](https://nodejs.org/en) is installed
    > node -v # to check existing node version
- [Yarn v1.22.19](https://classic.yarnpkg.com/lang/en/docs/install/) or newer is installed (yarn `major version 1` though)
    > yarn -v # to check existing yarn version

### Configure .npmrc to access private npm repositories

This step is only applicable if you have access to the CHILI publish organisation.

- Setup access to `@chili-publish` registry

    - Generate `GH_ACCESS_TOKEN`: https://github.com/settings/tokens. Ensure that you selected only necessary scopes (`read:packages`) and expiration time recommendation is `90 days`.

    - Login to the repository

    ```bash
    npm login --scope=@chili-publish --registry=https://npm.pkg.github.com
    ```

    > you need to login with your github credentials, when asked for a password, use the previously generated `GH_ACCESS_TOKEN`

Example of the .npmrc (npmrc file for windows, ~/.npmrc for mac / linux) file:

```
//npm.pkg.github.com/:_authToken=${GH_ACCESS_TOKEN}
@chili-publish:registry=https://npm.pkg.github.com/
```

## Getting started with development

To execute studio ui with empty content

```bash
yarn install
yarn dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.

> To see actual template you have create an `.env` file with corresponding keys

```bash
# Project configuration
VITE_ENVIRONMENT_NAME=environmentName
VITE_PROJECT_ID=templateId

# Authentication configuraiton
VITE_AUTH0_DOMAIN=https://login.chiligrafx-dev.com
VITE_AUTH0_CLIENT_ID=clientId
VITE_AUTH_AUTH0_SCOPE=scope
VITE_AUTH_AUTH0_AUDIENCE=audience
```

## Scripts

### Start the dev application

`yarn dev`

### Make production build

`yarn build`

### Run linter

`yarn lint`

## Local development

### Link local instance of components repository

To work on the [grafx-shared-components library](https://github.com/chili-publish/grafx-shared-components) or the [studio-sdk library](https://github.com/chili-publish/studio-sdk), you will need to link your local instance to the package.json of this repository.
To simply do this, we use the `yarn link` functionality. To make it even more easier, it is advised to make an alias in your .bashrc file.
If a new package will be installed,please check the package license information.

#### Manual

- run `yarn build && yarn link` inside grafx-shared-components repo
- run `yarn link @chili-publish/grafx-shared-components` inside studio-ui (this) repo

#### Alias in .bashrc

`alias linkcomponents='cd ~/path/to/grafx-shared-components && yarn build && yarn link && cd ~/path/to/studio-ui && yarn link @chili-publish/grafx-shared-components'`
`alias linksdk='cd ~/path/to/studio-sdk && yarn build && yarn link && cd ~/path/to/studio-ui && yarn link @chili-publish/studio-sdk'`
