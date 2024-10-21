import { render, fireEvent } from '@testing-library/react';
import EditorSDK from '@chili-publish/studio-sdk';
import { mock } from 'jest-mock-extended';
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import Zoom from '../components/zoom/Zoom';

beforeEach(() => {
    jest.mock('@chili-publish/studio-sdk');
    const mockSDK = mock<EditorSDK>();
    mockSDK.config.onZoomChanged = jest.fn().mockImplementation().mockReturnValue(Promise.resolve(400));

    mockSDK.canvas.setZoomPercentage = jest
        .fn()
        .mockImplementation()
        .mockReturnValue(
            Promise.resolve({
                parsedData: null,
                success: true,
            }),
        );

    window.StudioUISDK = mockSDK;
});
describe('Zoom', () => {
    it('should increment the zoom level on `faPlus` click', () => {
        let zoomValue = 100;
        const handleZoomIn = jest.fn(async () => {
            zoomValue *= 1.142;
        });
        const handleZoomOut = jest.fn(async () => {
            zoomValue *= 0.875;
        });
        const { getByTestId, rerender, getByLabelText } = render(
            <UiThemeProvider theme="platform">
                <Zoom zoom={zoomValue} zoomIn={handleZoomIn} zoomOut={handleZoomOut} />
            </UiThemeProvider>,
        );
        const zoomComponent = getByTestId('zoom');
        const zoomIn = zoomComponent.children[2];
        const zoomLevel = getByLabelText('zoom level');

        expect(zoomIn).toBeInTheDocument();

        fireEvent.click(zoomIn);
        expect(handleZoomIn).toBeCalled();
        rerender(
            <UiThemeProvider theme="platform">
                <Zoom zoom={zoomValue} zoomIn={handleZoomIn} zoomOut={handleZoomOut} />
            </UiThemeProvider>,
        );

        expect(zoomLevel).toHaveTextContent('114.19999999999999%');
    });
    it('should decrement the zoom level on `faMinus` click', () => {
        let zoomValue = 100;
        const handleZoomIn = jest.fn(async () => {
            zoomValue *= 1.142;
        });
        const handleZoomOut = jest.fn(async () => {
            zoomValue *= 0.875;
        });
        const { getByTestId, rerender, getByLabelText } = render(
            <UiThemeProvider theme="platform">
                <Zoom zoom={300} zoomIn={handleZoomIn} zoomOut={handleZoomOut} />
            </UiThemeProvider>,
        );
        const zoomComponent = getByTestId('zoom');
        const zoomIn = zoomComponent.children[0];
        const zoomLevel = getByLabelText('zoom level');

        expect(zoomIn).toBeInTheDocument();

        fireEvent.click(zoomIn);

        rerender(
            <UiThemeProvider theme="platform">
                <Zoom zoom={zoomValue} zoomIn={handleZoomIn} zoomOut={handleZoomOut} />
            </UiThemeProvider>,
        );

        expect(zoomLevel).toHaveTextContent('87.5%');
    });
});
