import { createContext } from 'react';
import { ConnectorInstance } from '@chili-publish/studio-sdk';

interface IConnectors {
    mediaConnectors: ConnectorInstance[];
    fontsConnectors: ConnectorInstance[];
}
const ConnectorsContextDefaultValues: IConnectors = {
    mediaConnectors: [],
    fontsConnectors: [],
};
export const connectorsContext = createContext(ConnectorsContextDefaultValues);
