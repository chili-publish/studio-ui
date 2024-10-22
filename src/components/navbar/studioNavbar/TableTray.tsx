import { Tray, Table } from '@chili-publish/grafx-shared-components';
import { LARGE_DATASET } from './data';
import { css } from 'styled-components';

interface TableTrayProps {
    onClose: () => void;
}
const TableTray = ({ onClose }: TableTrayProps) => {
    return (
        <Tray
            isOpen
            close={onClose}
            title={'Data source'}
            styles={css`
                padding: 0;
                overflow: auto;
                flexwrap: wrap;
            `}
        >
            <div style={{ height: '100%' }}>
                <div style={{ paddingTop: '1.5rem' }}>
                    <Table rows={LARGE_DATASET} />
                </div>
            </div>
        </Tray>
    );
};

export default TableTray;
