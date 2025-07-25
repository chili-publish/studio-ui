# Studio UI Advanced integration

## Concepts

### UI options

> Alpha

The UI is configurable by some UI options explained in the concepts below.

#### Widgets

Studio UI is built with a couple of widgets, that are configurable. The list below contains all widgets available in the latest build. Widgets can be viewed as a component or a group of components working together.
Configurable widgets are able to be hidden, or in some cases you can add events to the widget, which will do something.

#### Theming

Add your own theming to the Studio UI, to give the UI a little touch of your own, to seamlessly blend in with your own application

### outputSettings

- **Deprecated**: Yes

> Alpha

This setting allows you to fine grain which output types are possible within the integration. At the time of writing we are working on simplifying this drastically, but this isn't implemented yet.

## Perquisites

Before we start, make sure the following bulletpoints are checked off:

- [ ] Local webserver that can serve html
- [ ] Little bit of JS knowledge, but don't let it scare you

## Advanced example using GraFx API for document retrieval

### HTML

Create a new html file, you can call it whatever you want, but in our case we call it `index.html`.

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

        <!-- custom logic in seperate js file -->
        <script srs="./integration.js"></script>
    </body>
</html>
```

### JavaScript

For this example we separate the javascript from the html to have a clearer separation of concerns. The javascript will handle the "logic" to inject Studio UI.

You can choose whichever filename you want, but for simplicity we called it `integration.js`.

```js
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
/* Function that refreshes your access token, not providing a proper function can lead to data loss when your token is expired. Preferably you retrieve a token here silently. */
const refreshTokenAction = () => Promise.resolve(token);

/* this example will allow only animated output within your user interface */
const outputSettings = {
    mp4: true,
    gif: true,
};
/* The ID of the user interface, used to fetch output settings, if passed it will override the default output settings set above */
const userInterfaceID = '859dd405-bfed-467f-b833-510afef5fda4';

/* this example of uiOptions will show everything and will use a console log when pressing the back button inside the UI. */
const uiOptions = {
    theme: {
        fontFamily: 'inherit',
        colors: {
            brandBackgroundColor: '#F40009', // Used for primary buttons, checkboxes, toggles, radio buttons, animation timeline, etc.
            primaryButtonTextColor: '#ffffff', // Used for primary button text, checkboxes, toggles, radio buttons.
            primaryButtonHoverColor: '#CB0007', // Used for primary button hover background.
            panelBackgroundColor: '#252525', // Used for panel and modal backgrounds.
            dropdownMenuBackgroundColor: '#2F2F2F', // Used for dropdown menu backgrounds.
            inputBackgroundColor: '#323232', // Used for input fields background.
            inputBorderColor: '#F5F5F5', // Used for the border color of input fields.
            inputFocusBorderColor: '#ffffff', // Used for the border color of input fields when focused.
            canvasBackgroundColor: '#161616', // Used for canvas background.
            highlightedElementsColor: '#3E3E3E', // Used for highlighted elements.
            disabledElementsColor: '#6E6E6E', // Used for disabled text and buttons.
            placeholderTextColor: '#909090', // Used for text placeholders.
            primaryTextColor: '#ffffff', // Used for primary text.
            secondaryTextColor: '#B9B9B9', // Used for secondary text.
        },
    },
    uiDirection: 'ltr', // Sets the text direction of the UI. Accepts 'ltr' (left-to-right) or 'rtl' (right-to-left). Default is 'ltr'.
    widgets: {
        downloadButton: {
            visible: true,
        },
        backButton: {
            visible: true,
            event: () => console.log('back button pressed'),
        },
    },
};

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

    /* outputTypes: object of all available output types (optional) that have a boolean value */
    outputSettings: outputSettings,

    /* uiOptions: object to play around with parts of the UI and the theming.*/
    uiOptions: uiOptions,

    /* userInterfaceID: string, The id of the user interface used to fetch output settings,
    if passed it will override the default output settings */
    userInterfaceID: userInterfaceID,

    /* Callback function that fetches UI configuration details based on the provided userInterfaceId */
    onFetchUserInterfaceDetails,
});
```

To see if your code works, serve your html file and use a known project ID, you'll need to have a working access token to be able to fetch the document though.

### Settings deep dive

#### uiOptions, widgets

For now there are 2 components (widgets) that are able to retrieve some settings.

The downloadButton can be hidden to f.e. disable output in your integration.

The backButton can be hidden, and is actually hidden by default, but you can also explicitly show it and change what the behaviour will be when pressing it. This can be done by passing a function to `event`.

#### uiOptions, theme

The theme field within uiOptions is used to customize various UI elements, specifically focusing on colors and font styles. The configuration object defined above includes all available options for UI customization.

    ** fontFamily: Optional. If the value 'inherit' is provided, the font family of the UI elements will be inherited. Otherwise, 'Roboto' is used as default.
    ** colors: Optional. The object can be provided partially. The defined fields will be used to customize the UI components.

#### uiOptions, uiDirection

The `uiDirection` field within `uiOptions` allows you to control the text and layout direction of the Studio UI. This is especially useful for supporting right-to-left (RTL) languages such as Arabic or Hebrew, or for enforcing a left-to-right (LTR) layout regardless of the user's browser or system settings.

- **uiDirection**: Optional. Accepts either `'ltr'` (left-to-right) or `'rtl'` (right-to-left). If not provided, the default is `'ltr'`.
    - `'ltr'`: The UI and text will be displayed from left to right (default).
    - `'rtl'`: The UI and text will be displayed from right to left.

Example usage:

```js
const uiOptions = {
    // ... other options ...
    uiDirection: 'rtl', // Forces the UI to use right-to-left layout
};
```

#### outputSettings

- **Deprecated**: Yes

The outputSettings option, is quite a flexible way to set the available output types for your integrations, this option will be overridden when `userInterfaceID` is provided.

It's an optional parameter, that will show every output setting that is available when not provided, but it allows some fine-grained management of the output types available.

Setting one outputSetting to true, will explicitly set all other outputSettings to false. So if you want to add other settings, you'll need to be specific which ones you want.

Setting one ouptutSetting to false, will do the opposite and will not allow that specific output setting, but will allow all the others. Beneath some examples:

Let's start with the example which is used above in the code example. This setting will only allow mp4 and gif output types.

```js
const outputSettings = {
    mp4: true,
    gif: true,
};
```

The following example, will have the exact same effect, although in reverse logic.

```js
const outputSettings = {
    png: false,
    jpg: false,
};
```

The last example, will only show png, jpg is explicitly set to false, and the others are as well implied to be false.

```js
const outputSettings = {
    png: true,
    jpg: false,
};
```

#### userInterfaceID

The `userInterfaceID` option is an optional parameter, setting it to valid interface id, means the output settings will be fetched from the API and `outputSettings` will be overridden if set.

When a valid interface id is provided and output settings are returned, every output setting with the same selected layout intent will be available,
and if no output setting is available for the selected layout intent, the download button will be disabled.

#### onFetchUserInterfaceDetails

A callback function that retrieves details about a user interface configuration based on its ID.
Promise that resolves to a UserInterface object with the following structure:

```typescript
enum LayoutIntent {
    print = 'print',
    digitalStatic = 'digitalStatic',
    digitalAnimated = 'digitalAnimated',
}
type OutputSettingsType = {
    [outputSettingsId: string]: { layoutIntents: LayoutIntent[] };
};

interface UserInterface {
    id: string; // Unique identifier of the user interface
    name: string; // Display name of the user interface
    outputSettings: OutputSettingsType; // Output settings
    formBuilder: FormBuilderSection[]; // Array of UI section configurations
    default: boolean; // default user interface
}

interface FormBuilderSection {
    type: 'layouts' | 'datasource' | 'variables'; // Type of the section
    active: boolean; // Controls visibility of the section
    header: string; // Title/header text for the section
    helpText: string; // Helper text providing additional context

    // Additional properties for 'layouts' type
    layoutSelector: boolean; // Controls visibility of layout selection dropdown
    showWidthHeightInputs: boolean; // Controls visibility of width/height input fields
}
```

##### Example Usage

```javascript
const onFetchUserInterfaceDetails = async (userInterfaceId) => {
    return {
        id: '1',
        name: 'Default Name',
        outputSettings: {
            1: {
                layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'],
            },
        },
        formBuilder: [
            {
                type: 'datasource',
                active: true,
                header: 'Data source',
                helpText: '',
            },
            {
                type: 'layouts',
                active: true,
                header: 'Available Layouts',
                helpText: 'Select a layout for your template',
                layoutSelector: true,
                showWidthHeightInputs: true,
            },
            {
                type: 'variables',
                active: true,
                header: 'Template Variables',
                helpText: 'Customize variable values',
            },
        ],
    };
};
```

> [!IMPORTANT]  
> All translatable interface properties below should be considered as experimental. We only recommend using them if you are pinned on a specific version.

#### Variable Translations

If you want to provide translations for your variables (such as labels, placeholders, or help texts), you can use the `variableTranslations` option when configuring the Studio UI Loader. This allows you to customize the display text for variables in the UI, making your integration more user-friendly and localized.

The `variableTranslations` object should map variable's label to translation objects. Each translation object can include:

- `label`: The display label for the variable
- `placeholder`: The placeholder text for the variable input
- `helpText`: Additional help text shown in the UI
- `listItems`: (List variable only): Translates list item display value

##### Example Usage

```js
const variableTranslations = {
    FirstNameVariableLabel: {
        label: 'First Name',
        placeholder: 'Enter your first name',
        helpText: 'This will appear on your badge.',
    },
    LastNameVariableLabel: {
        label: 'Last Name',
        placeholder: 'Enter your last name',
        helpText: 'This will appear on your badge.',
    },
    CompanyVariableLabel: {
        label: 'Company',
        placeholder: 'Enter your company name',
        helpText: 'Optional field.',
    },
    CountryListVariableLabel: {
        label: 'Contry',
        placeholder: 'Select country'
        helpText: 'Optional field'
        listItems: {
            CountryListVariableListItem1DisplayValue: 'Belgium',
            CountryListVariableListItem2DisplayValue: 'USA',
        }
    }
};

window.StudioUI.studioUILoaderConfig({
    // ... other config options ...
    variableTranslations: variableTranslations,
});
```

You can provide translations for as many or as few variables as you like. Any fields you omit will fall back to the default values from variable's configuration.

#### Layout Translations

If you want to provide translations for your layouts' display names, you can use the `layoutTranslations` option when configuring the Studio UI Loader. This allows you to customize the display text for layouts in the UI, making your integration more user-friendly and localized.

The `layoutTranslations` object should map either the layout's `displayName` or, if not present, the layout's `name` to a translation object. Each translation object can include:

- `displayName`: The translated display name for the layout

##### Example Usage

```js
const layoutTranslations = {
    // Case 1: layout displayName key found
    'L1 Display': {
        displayName: 'Translated Display Name for L1',
    },
    // Case 2: layout displayName key not found, fallback to layoutName
    L2: {
        displayName: 'Translated Display Name for L2',
    },
};

window.StudioUI.studioUILoaderConfig({
    // ... other config options ...
    layoutTranslations: layoutTranslations,
});
```

You can provide translations for as many or as few layouts as you like. If a translation is not found for a layout's `displayName`, the loader will attempt to use the layout's `name` as a fallback. If neither is found, the original value will be used.

#### UI Translations

You can provide translations for UI labels and help texts using the `uiTranslations` option. This allows you to localize section headers, help texts, toolbar labels, modal content, toast notifications, and panel labels.

The `uiTranslations` object supports dynamic replacements using `{{placeholder}}` syntax for values that need to be inserted at runtime.

Example:

```js
const uiTranslations = {
    formBuilder: {
        variables: {
            header: 'Variables',
            helpText: 'Variables are used to store values that can be used in the form.',
        },
        datasource: {
            header: 'Data Source',
            helpText: 'Data Source is a tool that allows you to connect to a data source and use it in the form.',
            row: 'Row',
            inputLabel: 'Data row',
        },
        layouts: {
            header: 'Layouts',
            helpText: 'Layouts are used to organize the form.',
            inputLabel: 'Select layout',
            width: 'Width',
            height: 'Height',
        },
    },
    toolBar: {
        downloadButton: { label: 'Download', outputSelector: { label: 'Output' } },
        undoBtn: { tooltip: 'Undo' },
        redoBtn: { tooltip: 'Redo' },
    },
    modals: {
        connectorAuthorization: {
            title: 'Authorize connector',
            description: "{{name}} needs to be authorized. Click 'Authorize' to redirect and grant permissions.",
            approveBtnLabel: 'Authorize',
            cancelBtnLabel: 'Cancel',
        },
        loadDocumentError: {
            versionMismatch: {
                title: 'Incompatible project',
                description: 'This project cannot be opened. Please contact your Admin.',
            },
            projectError: {
                title: 'Project error',
                description: 'A project error has occurred.',
            },
            parsingError: {
                description:
                    'It seems like this project is corrupt and cannot be loaded. For further assistance, please contact your Admin.',
            },
            formatError: {
                description:
                    'It seems like this project is corrupt and cannot be loaded. For further assistance, please contact your Admin.',
            },
            technicalError: {
                description:
                    'A technical error has occurred. Please try again later. For further assistance, please contact your Admin.',
            },
            btnLabel: 'Close',
        },
    },
    toast: {
        connectorAuthorization: {
            error: "Authorization failed for '{{connectorName}}' connector.",
            timeoutError: "Authorization failed (timeout) for '{{connectorName}}' connector.",
        },
    },
    panels: {
        media: {
            title: 'Select Image',
            searchPlaceholder: 'Search',
            noSearchResults: 'No search results found. Maybe try another keyword?',
            rootNavPathLabel: 'Home',
            folderAssetLabel: 'Folder',
        },
    },
};

window.StudioUI.studioUILoaderConfig({
    // ...other config,
    uiTranslations,
});
```

##### Dynamic Replacements

For translations that contain dynamic parts like `{{name}}` or `{{connectorName}}`, the system will automatically replace these placeholders with the provided values when the translation is used. For example:

- `{{name}}` in modal descriptions will be replaced with the connector name
- `{{connectorName}}` in toast messages will be replaced with the actual connector name

All translations are optional. If a translation is not provided, the system will use sensible defaults.

## Advanced example using own documents

In some cases, integrations will need to have the flexibility to load in the document from another source than the GraFx environments, also here we got you covered.

### HTML

The HTML file will still be the same, no changes required

### JavaScript

Also here there aren't a ton of changes necessary but we'll highlight some of them below.

```js
// All above mentioned logic should be added here as well

// New things to add

/* 
A call to request the metadata of the project.
The return value below is what the application expects the format to be 
*/
const onProjectInfoRequested = async () => {
    return {
        id: 'id of the project',
        name: 'name of the project',
        template: {
            id: 'id of the template it is based on',
        },
    };
};

/* 
A call to fetch a template that is not inside GraFx (when you want to store it elsewhere f.e.).
Of course this call needs to be in a correct GraFx Studio Project or Template format, and the function expects it to be stringified.
*/
const onProjectDocumentRequested = async () => {
    return fetch(`${editorLink}/assets/assets/documents/demo.json`).then((res) => {
        return JSON.stringify(res.data);
    });
};

/*
Call to save the document, a good example can be found below.
*/
const onProjectSave = async (generateJson) => {
    return {
        id: 'id of the project',
        name: 'name of the project',
        template: {
            id: 'id of the template it is based on',
        },
    };
};
```

onProjectSave example implementation [can be found here](https://github.com/chili-publish/studio-ui/blob/b2f7e5307cc8dee41eb89a15c3647a8ce1d13768/src/StudioProjectLoader.tsx#L72).

### Is that all?

No it isn't, there are a bunch of loaders, the one more restricting than the other. But it is better to have a look yourself.

Following callbacks are also available (in other loaders):

- `onProjectLoaded`: callback that listens on when the project is completely loaded
- `onAuthenticationRequested`: Basically the same as auth token action, but instead of using a string directly, it's a callback
- `onAuthenticationExpired`: Basically the same as refreshTokenAction above
- `onLogInfoRequested`: A callback used to generate some loading information in the console.
- `onProjectGetDownloadLink`: A callback to get the output download link for the project.

### Enable/Disable Connector Query Call Caching

By default, connector query calls are cached. This behavior can be overridden using:

`await StudioUISDK.configuration.setValue('ENABLE_QUERY_CALL_CACHE', status)`

Here, status is a string — if sent as 'true', query calls will be cached; if 'false', they will not be cached.
