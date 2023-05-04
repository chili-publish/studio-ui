import { ImagePicker } from '@chili-publish/grafx-shared-components';
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
    return (
        <div>
            <Navbar />
            <div style={{ width: '260px', padding: '1rem' }}>
                <ImagePicker name="Empty image" label={<span>Empty image</span>} />
            </div>
            <div style={{ width: '260px', padding: '1rem' }}>
                <ImagePicker
                    previewImage={{
                        url: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg',
                        name: 'Test image',
                        format: 'png',
                        id: '1',
                    }}
                    name="Test image"
                    label={<span>Test image</span>}
                />
            </div>
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
