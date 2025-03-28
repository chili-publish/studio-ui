export const mockUserInterface = {
    id: '1234-1454124-sfdfsdg-123rnlakjsf',
    name: '[Default]',
    outputSettings: {
        '1': {
            layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'],
        },
        '2': {
            layoutIntents: ['digitalAnimated'],
        },
    },
    formBuilder: [
        {
            type: 'datasource' as const,
            active: true,
            header: 'Data source',
            helpText: 'Select a data source',
        },
        {
            type: 'layouts' as const,
            active: true,
            header: 'Layouts',
            helpText: 'Layouts help text',
            layoutSelector: true,
            multipleLayouts: true,
            allowNewProjectFromLayout: true,
            showWidthHeightInputs: true,
        },
        {
            type: 'variables' as const,
            active: true,
            header: 'Variables',
            helpText: 'Change the variables',
        },
    ],
    default: true,
};

export const mockUserInterface2 = {
    id: '1234-1454124-sfdfsdg-123rnlakjsf',
    name: 'UI test',
    outputSettings: {
        '1': {
            layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'],
        },
        '2': {
            layoutIntents: ['digitalAnimated'],
        },
    },
    formBuilder: [
        {
            type: 'datasource' as const,
            active: true,
            header: 'Data source',
            helpText: 'Select a data source',
        },
        {
            type: 'layouts' as const,
            active: false,
            header: 'Layouts',
            helpText: 'Layouts help text',
            layoutSelector: false,
            multipleLayouts: true,
            allowNewProjectFromLayout: true,
            showWidthHeightInputs: false,
        },
        {
            type: 'variables' as const,
            active: true,
            header: 'Variables',
            helpText: 'Change the variables',
        },
    ],
    default: false,
};
