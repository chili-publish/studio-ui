import { act, renderHook, waitFor } from '@testing-library/react';
import useDataSource, { SELECTED_ROW_INDEX_KEY } from '../../../components/dataSource/useDataSource';
import { useSubscriberContext } from '../../../contexts/Subscriber';
import { Subscriber } from '../../../utils/subscriber';

jest.mock('../../../contexts/Subscriber', () => ({
    useSubscriberContext: jest.fn().mockReturnValue({
        subscriber: null,
    }),
}));

describe('"useDataSource" hook tests', () => {
    beforeEach(() => {
        window.StudioUISDK.dataConnector.getPage = jest.fn().mockResolvedValueOnce({
            parsedData: {
                data: [
                    { id: '1', name: 'Joe', age: 15 },
                    { id: '2', name: 'Finn', age: 35 },
                ],
            },
        });
        window.StudioUISDK.dataSource.getDataSource = jest.fn().mockResolvedValueOnce({
            parsedData: null,
        });

        window.StudioUISDK.dataSource.setDataRow = jest.fn();
        window.StudioUISDK.undoManager.addCustomData = jest.fn();
    });
    it('should keep current row, if undo does not have data', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        const { result } = await renderHook(() => useDataSource(true));

        act(() => {
            mockSubscriber.emit('onCustomUndoDataChanged', { arbitaryKey: '333' });
        });

        expect(result.current.currentRowIndex).toEqual(0);
    });
    it('should change selected row via "onCustomUndoDataChanged" subscription', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        const { result } = await renderHook(() => useDataSource(true));

        act(() => {
            mockSubscriber.emit('onCustomUndoDataChanged', { [SELECTED_ROW_INDEX_KEY]: '3' });
        });

        expect(result.current.currentRowIndex).toEqual(3);
    });

    it('should call "setDataRow" for same index update only', async () => {
        window.StudioUISDK.dataSource.getDataSource = jest.fn().mockResolvedValueOnce({
            parsedData: {
                id: '1',
                name: 'Connector name',
            },
        });

        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });
        const { result } = await renderHook(() => useDataSource(true));

        await waitFor(() => expect(result.current.currentInputRow).toEqual('1 | Joe | 15'));
        expect(window.StudioUISDK.dataSource.setDataRow).toHaveBeenCalledTimes(1);

        await act(() => {
            mockSubscriber.emit('onCustomUndoDataChanged', { [SELECTED_ROW_INDEX_KEY]: '1' });
        });

        await waitFor(() => expect(result.current.currentInputRow).toEqual('2 | Finn | 35'));
        expect(window.StudioUISDK.dataSource.setDataRow).toHaveBeenCalledTimes(1);
    });
});
