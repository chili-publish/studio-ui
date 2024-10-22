import { AvailableIcons, Icon, Modal, Table } from '@chili-publish/grafx-shared-components';
import { LARGE_DATASET } from './data';
import { useState } from 'react';

interface TableModalProps {
    onClose: () => void;
}
const TableModal = ({ onClose }: TableModalProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <Modal
            onClose={onClose}
            style={{
                borderRadius: '0.5rem',
                padding: '0',
                width: isExpanded ? '100Vw' : '40rem',
                height: isExpanded ? '100vh' : '40rem',
                overflow: 'auto',
                flexWrap: 'wrap',
            }}
            isVisible
            fullScreen={isExpanded}
        >
            <div style={{ height: '100%' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: '#fff',
                        padding: '2.5rem',
                        paddingBottom: '0',
                    }}
                >
                    <span>Data source</span>

                    <span style={{ display: 'flex', gap: '1rem' }}>
                        <span onClick={() => setIsExpanded((prev) => !prev)}>
                            <Icon
                                icon={
                                    isExpanded
                                        ? AvailableIcons.faArrowDownLeftAndArrowUpRightToCenter
                                        : AvailableIcons.faArrowUpRightAndArrowDownLeftFromCenter
                                }
                                key="close-actions-dialog-button"
                            />
                        </span>
                        <span onClick={onClose}>
                            <Icon icon={AvailableIcons.faXmark} />
                        </span>
                    </span>
                </div>

                <div style={{ padding: '2.5rem', paddingTop: '1.5rem' }}>
                    <Table rows={LARGE_DATASET} />
                </div>
            </div>
        </Modal>
    );
};

export default TableModal;
