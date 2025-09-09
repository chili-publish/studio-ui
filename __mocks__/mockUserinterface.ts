import { LayoutIntent } from '@chili-publish/environment-client-api';

export const mockUserInterface = {
    id: '1234-1454124-sfdfsdg-123rnlakjsf',
    name: '[Default]',
    outputSettings: {
        '1': {
            layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] as unknown as LayoutIntent[],
        },
        '2': {
            layoutIntents: ['digitalAnimated'] as unknown as LayoutIntent[],
        },
    },
    formBuilder: [
        {
            id: 'Datasource',
            type: 'datasource' as const,
            active: true,
            header: 'Data source',
            helpText: 'Select a data source',
        },
        {
            id: 'Layouts',
            type: 'layouts' as const,
            active: true,
            header: 'Layouts',
            helpText: 'Layouts help text',
            layoutSelector: true,
            showWidthHeightInputs: true,
        },
        {
            id: 'Variables',
            type: 'variables' as const,
            active: true,
            header: 'Variables',
            helpText: 'Change the variables',
        },
    ],
    default: true,
};

export const mockApiUserInterface = {
    ...mockUserInterface,
    formBuilder: JSON.stringify(mockUserInterface.formBuilder),
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
            id: 'Datasource',
            type: 'datasource' as const,
            active: true,
            header: 'Data source',
            helpText: 'Select a data source',
        },
        {
            id: 'Layouts',
            type: 'layouts' as const,
            active: false,
            header: 'Layouts',
            helpText: 'Layouts help text',
            layoutSelector: false,
            showWidthHeightInputs: false,
        },
        {
            id: 'Variables',
            type: 'variables' as const,
            active: true,
            header: 'Variables',
            helpText: 'Change the variables',
        },
    ],
    default: false,
};
