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
    const { assets, handleAssetClick, breadCrumbs, navigationStack, setNavigationStack } = useImagePanel();

    const handleBackButtonPressed = () => {
        if (!navigationStack.length) {
            showVariablesPanel();
        } else {
            const navigationStackCopy = [...navigationStack];
            navigationStackCopy.pop();
            setNavigationStack(navigationStackCopy);
        }
    };

    return (
        <>
            <LeftPanelHeader>
                <FirstRow>
                    <Button
                        buttonType={ButtonTypes.tertiary}
                        onClick={handleBackButtonPressed}
                        type="button"
                        icon={<Icon icon={AvailableIcons.faArrowLeft} />}
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
