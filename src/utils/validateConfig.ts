import { FormKeys, IStudioUILoaderConfig, LayoutForm, VariablesForm } from '../types/types';

export function validateCoreConfig({
    selector,
    projectId,
    graFxStudioEnvironmentApiBaseUrl,
    authToken,
    projectName,
    sandboxMode,
    uiOptions,
}: IStudioUILoaderConfig): boolean {
    // validation pattern: https://<env-name>.<domain>/grafx/api/v1/environment/<env-name>
    const urlValidationRegex = /^https:\/\/([^./]+)\.[^/]+\/grafx\/api\/v1\/environment\/\1/i;
    const errorsObject: Record<string, string | Record<string, Record<string, string>>> = {};

    if (!selector || typeof selector !== 'string') {
        errorsObject.selector = 'Selector must be a non-empty string';
    }

    if (projectName !== undefined && typeof projectName !== 'string') {
        errorsObject.projectName = 'Project name must be a non-empty string';
    }

    if (
        !graFxStudioEnvironmentApiBaseUrl ||
        typeof graFxStudioEnvironmentApiBaseUrl !== 'string' ||
        !urlValidationRegex.test(graFxStudioEnvironmentApiBaseUrl)
    ) {
        errorsObject.graFxStudioEnvironmentApiBaseUrl = 'Invalid base environment API URL';
    }
    if (!authToken || typeof authToken !== 'string') {
        errorsObject.authToken = 'Auth token must be a non-empty string';
    }
    if (projectId !== undefined && typeof projectId !== 'string') {
        errorsObject.projectId = 'Project ID must be a non-empty string';
    }
    if (sandboxMode !== undefined && typeof sandboxMode !== 'boolean') {
        errorsObject.sandboxMode = 'Sandbox mode must be a boolean value';
    }
    if (uiOptions !== undefined) {
        if (typeof uiOptions !== 'object') {
            errorsObject.uiOptions = 'UI options must be an object';
        }
        if (
            uiOptions.uiDirection !== undefined &&
            (typeof uiOptions.uiDirection !== 'string' || !['ltr', 'rtl'].includes(uiOptions.uiDirection))
        ) {
            errorsObject.uiDirection = "UI direction must be either 'ltr' or 'rtl'";
        }

        if (
            uiOptions.uiTheme !== undefined &&
            (typeof uiOptions.uiTheme !== 'string' || !['light', 'dark', 'system'].includes(uiOptions.uiTheme))
        ) {
            errorsObject.uiTheme = "UI theme must be either 'light', 'dark' or 'system'";
        }

        if (uiOptions.theme !== undefined && typeof uiOptions.theme !== 'object') {
            errorsObject.theme = 'Theme must be an object';
        }

        if (uiOptions.widgets !== undefined) {
            if (typeof uiOptions.widgets !== 'object') {
                errorsObject.widgets = 'Widgets must be an object';
            } else {
                const hasInvalidWidget = Object.values(uiOptions.widgets).some(
                    (v) => typeof v !== 'object' || typeof v.visible !== 'boolean',
                );

                if (hasInvalidWidget) {
                    errorsObject.widgets = "Provided widgets must contain property 'visible' of type boolean";
                }
            }
        }
        if (uiOptions?.formBuilder !== undefined) {
            if (typeof uiOptions.formBuilder !== 'object') {
                errorsObject.formBuilder = 'Form builder must be an object';
            } else {
                const { formBuilder } = uiOptions;
                const requiredFormKeys: FormKeys[] = ['datasource', 'layouts', 'variables'];
                const formBuilderErrors: Record<string, Record<string, string>> = {
                    datasource: {},
                    layouts: {},
                    variables: {},
                };
                requiredFormKeys.forEach((key) => {
                    if (formBuilder[key] === undefined) {
                        errorsObject.formBuilder = `Form builder must have a ${key} object`;
                    } else {
                        const form = formBuilder[key];
                        // Validate base properties
                        if (form.id === undefined || typeof form.id !== 'string') {
                            formBuilderErrors[key].id = `id must be a string`;
                        }
                        if (form.type === undefined || typeof form.type !== 'string') {
                            formBuilderErrors[key].type = `type must be a string`;
                        } else if (form.type !== key) {
                            formBuilderErrors[key].type = `type must be "${key}"`;
                        }
                        if (form.active === undefined || typeof form.active !== 'boolean') {
                            formBuilderErrors[key].active = `active must be a boolean`;
                        }
                        if (form.header === undefined || typeof form.header !== 'string') {
                            formBuilderErrors[key].header = `header must be a string`;
                        }
                        if (form.helpText === undefined || typeof form.helpText !== 'string') {
                            formBuilderErrors[key].helpText = `helpText must be a string`;
                        }

                        // Validate specific properties for each form type
                        if (key === 'variables') {
                            const variablesForm = form as VariablesForm;
                            if (variablesForm.variableGroups !== undefined) {
                                if (typeof variablesForm.variableGroups !== 'object') {
                                    formBuilderErrors[key].variableGroups = `variableGroups must be an object`;
                                } else if (
                                    variablesForm.variableGroups.show === undefined ||
                                    typeof variablesForm.variableGroups.show !== 'boolean'
                                ) {
                                    formBuilderErrors[key].variableGroups = `variableGroups.show must be a boolean`;
                                }
                            }
                        }

                        if (key === 'layouts') {
                            const layoutForm = form as LayoutForm;
                            if (
                                layoutForm.layoutSelector === undefined ||
                                typeof layoutForm.layoutSelector !== 'boolean'
                            ) {
                                formBuilderErrors[key].layoutSelector = `layoutSelector must be a boolean`;
                            }
                            if (
                                layoutForm.showWidthHeightInputs === undefined ||
                                typeof layoutForm.showWidthHeightInputs !== 'boolean'
                            ) {
                                formBuilderErrors[key].showWidthHeightInputs =
                                    `showWidthHeightInputs must be a boolean`;
                            }
                        }
                    }
                });
                // Only set formBuilder errors if there are actual errors
                const hasFormBuilderErrors = Object.values(formBuilderErrors).some(
                    (errors) => Object.keys(errors).length > 0,
                );
                if (hasFormBuilderErrors) {
                    errorsObject.formBuilder = formBuilderErrors;
                }
            }
        }
    }

    if (Object.keys(errorsObject).length > 0) {
        // eslint-disable-next-line no-console
        console.error(`Incorrect arguments in StudioUI configuration:\n`, errorsObject);
        alert(`Incorrect arguments in StudioUI configuration. See console for details.`);
        return false;
    }
    return true;
}
