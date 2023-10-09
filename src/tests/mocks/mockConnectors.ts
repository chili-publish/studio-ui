import { ConnectorRegistrationSource } from '@chili-publish/studio-sdk';

export const mockConnectors = {
    mediaConnectors: [
        {
            id: 'grafx-media',
            name: 'GraFx Media',
            iconUrl: '',
            source: { url: '', source: ConnectorRegistrationSource.grafx },
        },
    ],
    fontsConnectors: [
        {
            id: 'grafx-font',
            name: 'GraFx Font',
            iconUrl: '',
            source: { url: '', source: ConnectorRegistrationSource.grafx },
        },
    ],
};
