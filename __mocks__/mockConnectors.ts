import { ConnectorInstance, ConnectorRegistrationSource } from '@chili-publish/studio-sdk/lib/src/next';

export const mockConnectors = {
    mediaConnectors: [
        {
            id: 'grafx-media',
            name: 'GraFx Media',
            iconUrl: '',
            source: { source: ConnectorRegistrationSource.url, url: '' },
        },
    ] as ConnectorInstance[],
    fontsConnectors: [
        {
            id: 'grafx-font',
            name: 'GraFx Font',
            iconUrl: '',
            source: { source: ConnectorRegistrationSource.url, url: '' },
        },
    ] as ConnectorInstance[],
};
