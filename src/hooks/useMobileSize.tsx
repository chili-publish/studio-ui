import { BreakPoints } from '@chili-publish/grafx-shared-components/lib/utils/enums';
import { useEffect, useState } from 'react';

function useMobileSize() {
    const [isMobileSize, setIsMobileSize] = useState<boolean>();

    useEffect(() => {
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
