/* eslint-disable @typescript-eslint/no-explicit-any */
import { validateCoreConfig } from '../../utils/validateConfig';
import { IStudioUILoaderConfig } from '../../types/types';

describe('validateCoreConfig', () => {
    const validBaseUrl = 'https://test-env.example.com/grafx/api/v1/environment/test-env';
    const validConfig: IStudioUILoaderConfig = {
        selector: '#app',
        graFxStudioEnvironmentApiBaseUrl: validBaseUrl,
        authToken: 'valid-token',
    };

    let consoleErrorSpy: jest.SpyInstance;
    let alertSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        alertSpy = jest.spyOn(window, 'alert').mockImplementation();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        alertSpy.mockRestore();
    });

    describe('valid configurations', () => {
        it('should return true for minimal valid config', () => {
            expect(validateCoreConfig(validConfig)).toBe(true);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
            expect(alertSpy).not.toHaveBeenCalled();
        });

        it('should return true for config with all optional fields', () => {
            const fullConfig: IStudioUILoaderConfig = {
                ...validConfig,
                projectId: 'project-123',
                projectName: 'Test Project',
                sandboxMode: true,
                uiOptions: {
                    uiTheme: 'dark',
                    uiDirection: 'rtl',
                    theme: {},
                    widgets: {
                        downloadButton: { visible: true },
                        backButton: { visible: false },
                    },
                    formBuilder: {
                        datasource: {
                            id: 'Datasource',
                            type: 'datasource',
                            active: true,
                            header: 'Data Source',
                            helpText: 'Help text',
                        },
                        layouts: {
                            id: 'Layouts',
                            type: 'layouts',
                            active: true,
                            header: 'Layouts',
                            helpText: 'Help text',
                            layoutSelector: true,
                            showWidthHeightInputs: true,
                        },
                        variables: {
                            id: 'Variables',
                            type: 'variables',
                            active: true,
                            header: 'Variables',
                            helpText: 'Help text',
                            variableGroups: {
                                show: true,
                            },
                        },
                    },
                },
            };

            expect(validateCoreConfig(fullConfig)).toBe(true);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
            expect(alertSpy).not.toHaveBeenCalled();
        });
    });

    describe('selector validation', () => {
        it('should return false when selector is missing', () => {
            const config = { ...validConfig, selector: '' };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(alertSpy).toHaveBeenCalled();
        });

        it('should return false when selector is not a string', () => {
            const config = { ...validConfig, selector: null as any };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should return false when selector is undefined', () => {
            const config = { ...validConfig, selector: undefined as any };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('projectName validation', () => {
        it('should return true when projectName is undefined', () => {
            const config = { ...validConfig, projectName: undefined };
            expect(validateCoreConfig(config)).toBe(true);
        });

        it('should return true when projectName is a valid string', () => {
            const config = { ...validConfig, projectName: 'My Project' };
            expect(validateCoreConfig(config)).toBe(true);
        });

        it('should return false when projectName is not a string', () => {
            const config = { ...validConfig, projectName: 123 as any };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should return false when projectName is null', () => {
            const config = { ...validConfig, projectName: null as any };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('graFxStudioEnvironmentApiBaseUrl validation', () => {
        it('should return false when baseUrl is missing', () => {
            const config = { ...validConfig, graFxStudioEnvironmentApiBaseUrl: '' };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should return false when baseUrl is not a string', () => {
            const config = { ...validConfig, graFxStudioEnvironmentApiBaseUrl: 123 as any };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should return false when baseUrl does not match the required pattern', () => {
            const config = { ...validConfig, graFxStudioEnvironmentApiBaseUrl: 'invalid-url' };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should return false when baseUrl has mismatched environment name', () => {
            const config = {
                ...validConfig,
                graFxStudioEnvironmentApiBaseUrl: 'https://test-env.example.com/grafx/api/v1/environment/different-env',
            };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should return true when baseUrl matches the pattern', () => {
            expect(validateCoreConfig(validConfig)).toBe(true);
        });
    });

    describe('authToken validation', () => {
        it('should return false when authToken is missing', () => {
            const config = { ...validConfig, authToken: '' };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should return false when authToken is not a string', () => {
            const config = { ...validConfig, authToken: 123 as any };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should return false when authToken is null', () => {
            const config = { ...validConfig, authToken: null as any };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('projectId validation', () => {
        it('should return true when projectId is undefined', () => {
            const config = { ...validConfig, projectId: undefined };
            expect(validateCoreConfig(config)).toBe(true);
        });

        it('should return true when projectId is a valid string', () => {
            const config = { ...validConfig, projectId: 'project-123' };
            expect(validateCoreConfig(config)).toBe(true);
        });

        it('should return false when projectId is not a string', () => {
            const config = { ...validConfig, projectId: 123 as any };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('sandboxMode validation', () => {
        it('should return true when sandboxMode is undefined', () => {
            const config = { ...validConfig, sandboxMode: undefined };
            expect(validateCoreConfig(config)).toBe(true);
        });

        it('should return true when sandboxMode is true', () => {
            const config = { ...validConfig, sandboxMode: true };
            expect(validateCoreConfig(config)).toBe(true);
        });

        it('should return true when sandboxMode is false', () => {
            const config = { ...validConfig, sandboxMode: false };
            expect(validateCoreConfig(config)).toBe(true);
        });

        it('should return false when sandboxMode is not a boolean', () => {
            const config = { ...validConfig, sandboxMode: 'true' as any };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('uiOptions validation', () => {
        it('should return true when uiOptions is undefined', () => {
            const config = { ...validConfig, uiOptions: undefined };
            expect(validateCoreConfig(config)).toBe(true);
        });

        it('should return false when uiOptions is not an object', () => {
            const config = { ...validConfig, uiOptions: 'invalid' as any };
            expect(validateCoreConfig(config)).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        describe('uiDirection validation', () => {
            it('should return true when uiDirection is undefined', () => {
                const config = { ...validConfig, uiOptions: {} };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return true when uiDirection is "ltr"', () => {
                const config = { ...validConfig, uiOptions: { uiDirection: 'ltr' as const } };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return true when uiDirection is "rtl"', () => {
                const config = { ...validConfig, uiOptions: { uiDirection: 'rtl' as const } };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return false when uiDirection is not "ltr" or "rtl"', () => {
                const config = { ...validConfig, uiOptions: { uiDirection: 'invalid' as any } };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });

            it('should return false when uiDirection is not a string', () => {
                const config = { ...validConfig, uiOptions: { uiDirection: 123 as any } };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });
        });

        describe('uiTheme validation', () => {
            it('should return true when uiTheme is undefined', () => {
                const config = { ...validConfig, uiOptions: {} };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return true when uiTheme is "light"', () => {
                const config = { ...validConfig, uiOptions: { uiTheme: 'light' as const } };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return true when uiTheme is "dark"', () => {
                const config = { ...validConfig, uiOptions: { uiTheme: 'dark' as const } };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return true when uiTheme is "system"', () => {
                const config = { ...validConfig, uiOptions: { uiTheme: 'system' as const } };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return false when uiTheme is not a valid value', () => {
                const config = { ...validConfig, uiOptions: { uiTheme: 'invalid' as any } };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });

            it('should return false when uiTheme is not a string', () => {
                const config = { ...validConfig, uiOptions: { uiTheme: 123 as any } };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });
        });

        describe('theme validation', () => {
            it('should return true when theme is undefined', () => {
                const config = { ...validConfig, uiOptions: {} };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return true when theme is an object', () => {
                const config = { ...validConfig, uiOptions: { theme: {} } };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return false when theme is not an object', () => {
                const config = { ...validConfig, uiOptions: { theme: 'invalid' as any } };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });
        });

        describe('widgets validation', () => {
            it('should return true when widgets is undefined', () => {
                const config = { ...validConfig, uiOptions: {} };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return true when widgets have valid visible properties', () => {
                const config = {
                    ...validConfig,
                    uiOptions: {
                        widgets: {
                            downloadButton: { visible: true },
                            backButton: { visible: false },
                        },
                    },
                };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return false when widgets is not an object', () => {
                const config = { ...validConfig, uiOptions: { widgets: 'invalid' as any } };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });

            it('should return false when widget does not have visible property', () => {
                const config = {
                    ...validConfig,
                    uiOptions: {
                        widgets: {
                            downloadButton: {} as any,
                        },
                    },
                };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });

            it('should return false when widget visible is not a boolean', () => {
                const config = {
                    ...validConfig,
                    uiOptions: {
                        widgets: {
                            downloadButton: { visible: 'true' as any },
                        },
                    },
                };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });
        });

        describe('formBuilder validation', () => {
            const validFormBuilder = {
                datasource: {
                    id: 'Datasource',
                    type: 'datasource' as const,
                    active: true,
                    header: 'Data Source',
                    helpText: 'Help text',
                },
                layouts: {
                    id: 'Layouts',
                    type: 'layouts' as const,
                    active: true,
                    header: 'Layouts',
                    helpText: 'Help text',
                    layoutSelector: true,
                    showWidthHeightInputs: true,
                },
                variables: {
                    id: 'Variables',
                    type: 'variables' as const,
                    active: true,
                    header: 'Variables',
                    helpText: 'Help text',
                },
            };

            it('should return true when formBuilder is undefined', () => {
                const config = { ...validConfig, uiOptions: {} };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return true when formBuilder is valid', () => {
                const config = { ...validConfig, uiOptions: { formBuilder: validFormBuilder } };
                expect(validateCoreConfig(config)).toBe(true);
            });

            it('should return false when formBuilder is not an object', () => {
                const config = { ...validConfig, uiOptions: { formBuilder: 'invalid' as any } };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });

            it('should return false when formBuilder is missing datasource', () => {
                const config = {
                    ...validConfig,
                    uiOptions: {
                        formBuilder: {
                            layouts: validFormBuilder.layouts,
                            variables: validFormBuilder.variables,
                        } as any,
                    },
                };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });

            it('should return false when formBuilder is missing layouts', () => {
                const config = {
                    ...validConfig,
                    uiOptions: {
                        formBuilder: {
                            datasource: validFormBuilder.datasource,
                            variables: validFormBuilder.variables,
                        } as any,
                    },
                };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });

            it('should return false when formBuilder is missing variables', () => {
                const config = {
                    ...validConfig,
                    uiOptions: {
                        formBuilder: {
                            datasource: validFormBuilder.datasource,
                            layouts: validFormBuilder.layouts,
                        } as any,
                    },
                };
                expect(validateCoreConfig(config)).toBe(false);
                expect(consoleErrorSpy).toHaveBeenCalled();
            });

            describe('form base properties validation', () => {
                it('should return false when form id is missing', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                datasource: { ...validFormBuilder.datasource, id: undefined as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when form id is not a string', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                datasource: { ...validFormBuilder.datasource, id: 123 as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when form type is missing', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                datasource: { ...validFormBuilder.datasource, type: undefined as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when form type does not match key', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                datasource: { ...validFormBuilder.datasource, type: 'wrong' as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when form active is missing', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                datasource: { ...validFormBuilder.datasource, active: undefined as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when form active is not a boolean', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                datasource: { ...validFormBuilder.datasource, active: 'true' as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when form header is missing', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                datasource: { ...validFormBuilder.datasource, header: undefined as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when form header is not a string', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                datasource: { ...validFormBuilder.datasource, header: 123 as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when form helpText is missing', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                datasource: { ...validFormBuilder.datasource, helpText: undefined as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when form helpText is not a string', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                datasource: { ...validFormBuilder.datasource, helpText: 123 as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });
            });

            describe('layouts form specific validation', () => {
                it('should return false when layoutSelector is missing', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                layouts: { ...validFormBuilder.layouts, layoutSelector: undefined as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when layoutSelector is not a boolean', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                layouts: { ...validFormBuilder.layouts, layoutSelector: 'true' as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when showWidthHeightInputs is missing', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                layouts: { ...validFormBuilder.layouts, showWidthHeightInputs: undefined as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when showWidthHeightInputs is not a boolean', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                layouts: { ...validFormBuilder.layouts, showWidthHeightInputs: 'true' as any },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });
            });

            describe('variables form specific validation', () => {
                it('should return true when variableGroups is undefined', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                variables: { ...validFormBuilder.variables, variableGroups: undefined },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(true);
                });

                it('should return true when variableGroups is valid', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                variables: {
                                    ...validFormBuilder.variables,
                                    variableGroups: { show: true },
                                },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(true);
                });

                it('should return false when variableGroups is not an object', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                variables: {
                                    ...validFormBuilder.variables,
                                    variableGroups: 'invalid' as any,
                                },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when variableGroups.show is missing', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                variables: {
                                    ...validFormBuilder.variables,
                                    variableGroups: {} as any,
                                },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });

                it('should return false when variableGroups.show is not a boolean', () => {
                    const config = {
                        ...validConfig,
                        uiOptions: {
                            formBuilder: {
                                ...validFormBuilder,
                                variables: {
                                    ...validFormBuilder.variables,
                                    variableGroups: { show: 'true' as any },
                                },
                            },
                        },
                    };
                    expect(validateCoreConfig(config)).toBe(false);
                    expect(consoleErrorSpy).toHaveBeenCalled();
                });
            });
        });
    });
});
