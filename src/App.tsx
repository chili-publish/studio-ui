import { useState } from 'react';
import ImagePanel from './components/imagePanel/ImagePanel';
import LeftPanel from './components/layout-panels/leftPanel/LeftPanel';
import { LeftPanelContentType } from './components/layout-panels/leftPanel/LeftPanel.types';
import Navbar from './components/navbar/Navbar';
import VariablesPanel from './components/variables/VariablesPanel';

interface projectConfig {
    templateDownloadUrl: string;
    templateUploadUrl: string;
    templateId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken?: string;
}
function App({ projectConfig, editorLink }: { projectConfig?: projectConfig; editorLink: string }) {
    const [leftPanelContentType, setLeftPanelContentType] = useState(LeftPanelContentType.VARIABLES_PANEL);

    const showVariablesPanel = () => {
        setLeftPanelContentType(LeftPanelContentType.VARIABLES_PANEL);
    };

    return (
        <div>
            <Navbar />
            <LeftPanel>
                {leftPanelContentType === LeftPanelContentType.VARIABLES_PANEL ? (
                    <button
                        type="button"
                        onClick={() => {
                            setLeftPanelContentType(LeftPanelContentType.IMAGE_PANEL);
                        }}
                    >
                        Switch
                    </button>
                ) : (
                    <ImagePanel showVariablesPanel={showVariablesPanel} />
                )}
            </LeftPanel>
            <h1>End User workspace</h1>
            <h3>editorLink : {editorLink}</h3>
            <h3>authtoken : {projectConfig?.authToken}</h3>
            <h3>templateDownloadUrl : {projectConfig?.templateDownloadUrl}</h3>
            <h3>templateUploadUrl : {projectConfig?.templateUploadUrl}</h3>
            <h3>templateId : {projectConfig?.templateId}</h3>
            <h3>graFxStudioEnvironmentApiBaseUrl : {projectConfig?.graFxStudioEnvironmentApiBaseUrl}</h3>
            <VariablesPanel />
        </div>
    );
}

export default App;
