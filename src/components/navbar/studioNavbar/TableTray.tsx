import { Tray, Table } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { LARGE_DATASET } from './data';

interface TableTrayProps {
    onClose: () => void;
}

const trayStyles = css`
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
`;

function TableTray({ onClose }: TableTrayProps) {
    return (
        <Tray isOpen close={onClose} title="Data source" styles={trayStyles}>
            <div style={{ overflow: 'auto', marginTop: '1.5rem' }}>
                <Table rows={LARGE_DATASET} />
            </div>
        </Tray>
    );
}

export default TableTray;
