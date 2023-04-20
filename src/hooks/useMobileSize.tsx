// import { BreakPoints } from '@chili-publish/grafx-shared-components';
import { useLayoutEffect, useState } from 'react';

const BreakPoints = {
    mobileSize: '768px',
};

function useMobileSize() {
    const [isMobileSize, setIsMobileSize] = useState<boolean>();

    useLayoutEffect(() => {
        function checkMobileSize() {
            setIsMobileSize(window.innerWidth <= parseInt(BreakPoints.mobileSize, 10));
        }
        window.addEventListener('resize', checkMobileSize);
        checkMobileSize();
        return () => window.removeEventListener('resize', checkMobileSize);
    }, []);

    return isMobileSize;
}

export default useMobileSize;
