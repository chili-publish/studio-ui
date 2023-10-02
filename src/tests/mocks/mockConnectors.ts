import { ConnectorRegistrationSource } from '@chili-publish/studio-sdk';

export const mockConnectors = {
    mediaConnectors: [
        {
            id: 'grafx-media',
            name: 'GraFx Media',
            iconUrl: '',
            source: { source: ConnectorRegistrationSource.grafx, url: '' },
        },
    ],
    fontsConnectors: [
        {
            id: 'grafx-font',
            name: 'GraFx Font',
            iconUrl: '',
            source: { source: ConnectorRegistrationSource.grafx, url: '' },
        },
    ],
};
