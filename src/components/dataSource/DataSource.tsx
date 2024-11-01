import { AvailableIcons, Icon, Input, Label, useTheme } from '@chili-publish/grafx-shared-components';
import { useCallback, useEffect, useState } from 'react';
import { ConnectorInstance, ConnectorType } from '@chili-publish/studio-sdk';
import { PanelTitle } from '../shared/Panel.styles';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';

function DataSource() {
    const { panel } = useTheme();
    const [dataConnector, setDataConnector] = useState<ConnectorInstance | null>();
    const [firstRowInfo, setFirstRowInfo] = useState('');

    const getDataConnectorFirstRow = useCallback(async () => {
        if (!dataConnector) return;
        try {
            const pageInfoResponse = await window.StudioUISDK.dataConnector.getPage(dataConnector.id, { limit: 1 });

            const firstRowData = pageInfoResponse.parsedData?.data?.[0];
            setFirstRowInfo(firstRowData ? Object.values(firstRowData).join('|') : '');
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            // show err message
        }
    }, [dataConnector]);

    useEffect(() => {
        const getDataConnector = async () => {
            const dataConnectorsResponse = await window.StudioUISDK.connector.getAllByType(ConnectorType.data);
            const defaultDataConnector = dataConnectorsResponse.parsedData?.[0] || null;
            setDataConnector(defaultDataConnector);
        };
        getDataConnector();
    }, []);

    useEffect(() => {
        if (dataConnector) getDataConnectorFirstRow();
    }, [dataConnector, getDataConnectorFirstRow]);

    return dataConnector ? (
        <>
            <PanelTitle panelTheme={panel}>Data source</PanelTitle>
            <Input
                type="text"
                readOnly
                dataId={getDataIdForSUI(`data-source-input`)}
                dataTestId={getDataTestIdForSUI(`data-source-input`)}
                dataIntercomId="data-source-input"
                name="data-source-input"
                value={firstRowInfo}
                placeholder="Select data row"
                label={<Label translationKey="dataRow" value="Data row" />}
                onClick={getDataConnectorFirstRow}
                rightIcon={{
                    label: '',
                    icon: (
                        <Icon
                            dataId={getDataIdForSUI('data-source-input-icon')}
                            dataTestId={getDataTestIdForSUI('data-source-input-icon')}
                            icon={AvailableIcons.faTable}
                        />
                    ),
                    onClick: () => null,
                }}
            />
        </>
    ) : null;
}

export default DataSource;
