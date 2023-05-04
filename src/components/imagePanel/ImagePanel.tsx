import React from 'react';
import { AvailableIcons, Button, ButtonTypes, Icon } from '@chili-publish/grafx-shared-components';
import {
    FirstRow,
    HeaderText,
    LeftPanelContent,
    LeftPanelHeader,
    SecondRow,
} from '../layout-panels/leftPanel/LeftPanel.styles';
import ImageGrid from './ImageGrid';
import useImagePanel from './useImagePanel';

interface ImagePanelProps {
    showVariablesPanel: () => void;
}

function ImagePanel({ showVariablesPanel }: ImagePanelProps) {
    const { assets, handleAssetClick, breadCrumbs } = useImagePanel();
    return (
        <>
            <LeftPanelHeader>
                <FirstRow>
                    <Button
                        buttonType={ButtonTypes.tertiary}
                        onClick={showVariablesPanel}
                        type="button"
                        icon={<Icon icon={AvailableIcons.faArrowLeft} />}
                        width="2.5rem"
                        height="2.5rem"
                        noPadding
                    />
                    <HeaderText>Select image</HeaderText>
                </FirstRow>
                <SecondRow>{breadCrumbs}</SecondRow>
            </LeftPanelHeader>

            <LeftPanelContent>
                <ImageGrid assets={assets} handleAssetClick={handleAssetClick} />
            </LeftPanelContent>
        </>
    );
}

export default ImagePanel;
