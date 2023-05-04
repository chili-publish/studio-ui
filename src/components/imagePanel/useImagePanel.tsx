import { useCallback, useEffect, useMemo, useState } from 'react';
import { toNavigationStack } from '../../utils/media-utils';
import { AssetType, AssetWithPreview } from '../../utils/ApiTypes';
import { level2assets, mockAssets } from './mockAssets';

function useImagePanel() {
    const [assets, setAssets] = useState<AssetWithPreview[]>(mockAssets);
    const [navigationStack, setNavigationStack] = useState<string[]>([]);
    // intermediate state of the navigation stack.
    // navigation stack is updated only if the request to see the content of a directory succeeds
    const [currentDirectory, setCurrentDirectory] = useState<string[] | null>(null);

    const goToParentDirectory = useCallback(() => {
        const navigationPath = navigationStack?.slice(0, -1);
        setCurrentDirectory(navigationPath);
    }, [navigationStack]);

    const updateCurrentDirectory = useCallback((path: string) => {
        const navigationPath = toNavigationStack(path);
        setCurrentDirectory(navigationPath);
    }, []);

    const updateNavigation = useCallback(() => {
        if (currentDirectory) setNavigationStack(currentDirectory);
    }, [currentDirectory]);

    const clearNavigation = useCallback(() => setNavigationStack([]), []);

    const handleAssetClick = useCallback(
        (asset: AssetWithPreview) => {
            if (asset.type === AssetType.FOLDER) {
                updateCurrentDirectory(asset.name);
            } else {
                // eslint-disable-next-line no-console
                console.log('updateCurrentDirectory', asset);
                // do something
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [assets],
    );

    useEffect(() => {
        if (navigationStack[navigationStack.length - 1] === 'test') {
            setAssets(level2assets);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigationStack]);

    const breadCrumbs = useMemo(() => {
        return navigationStack.join('/');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDirectory]);

    return {
        assets,
        navigationStack,
        goToParentDirectory,
        updateCurrentDirectory,
        updateNavigation,
        clearNavigation,
        handleAssetClick,
        breadCrumbs,
    };
}

export default useImagePanel;
