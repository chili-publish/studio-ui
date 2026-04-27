import {
    Button,
    ButtonVariant,
    InfiniteScrollingComponent,
    useBidirectionalInfiniteScrolling,
} from '@chili-publish/grafx-shared-components';
import { useDispatch } from 'react-redux';
import StudioMobileDropdownOptions from 'src/components/shared/StudioMobileDropdown/StudioMobileDropdownOptions';
import { showVariablesPanel } from 'src/store/reducers/panelReducer';
import { ListWrapper } from './MobileDataSourceVariable.styles';

interface MobileDataSourceListModeOptionsProps {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    previousPageLoading: boolean;
    nextPageLoading: boolean;
    onPreviousPageRequested: () => void;
    onNextPageRequested: () => void;

    options: { value: string; label: string }[];
    selectedValue: { value: string; label: string } | null;
    onChange: (value: string) => void;
}
const MobileDataSourceListModeOptions = ({
    options,
    selectedValue,
    onChange,
    hasPreviousPage,
    hasNextPage,
    previousPageLoading,
    nextPageLoading,
    onPreviousPageRequested,
    onNextPageRequested,
}: MobileDataSourceListModeOptionsProps) => {
    const dispatch = useDispatch();
    const { wrapperRef, hasLoadMoreButton, onLoadMoreButtonClick, onNextPageScroll, onPreviousPageScroll } =
        useBidirectionalInfiniteScrolling(options, onNextPageRequested, onPreviousPageRequested);

    return (
        <ListWrapper ref={wrapperRef}>
            {hasPreviousPage &&
                (hasLoadMoreButton ? (
                    <Button
                        variant={ButtonVariant.tertiary}
                        label={'Load previous page'}
                        onClick={onLoadMoreButtonClick}
                        disabled={previousPageLoading}
                        loading={previousPageLoading}
                    />
                ) : (
                    <InfiniteScrollingComponent
                        id="previous-page-infinite-scrolling"
                        hasPage={hasPreviousPage}
                        pageLoading={previousPageLoading}
                        onPageRequested={onPreviousPageScroll}
                    />
                ))}
            <StudioMobileDropdownOptions
                options={options}
                selectedValue={selectedValue}
                onChange={onChange}
                onClose={() => dispatch(showVariablesPanel())}
            />
            {hasNextPage ? (
                <InfiniteScrollingComponent
                    id="next-page-infinite-scrolling"
                    hasPage={hasNextPage}
                    pageLoading={nextPageLoading}
                    onPageRequested={onNextPageScroll}
                />
            ) : null}
        </ListWrapper>
    );
};

export default MobileDataSourceListModeOptions;
