import Navbar from './components/navbar/Navbar';

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
            <h1>End User workspace</h1>
            <h3>editorLink : {editorLink}</h3>
            <h3>authtoken : {projectConfig?.authToken}</h3>
            <h3>templateDownloadUrl : {projectConfig?.templateDownloadUrl}</h3>
            <h3>templateUploadUrl : {projectConfig?.templateUploadUrl}</h3>
            <h3>templateId : {projectConfig?.templateId}</h3>
            <h3>graFxStudioEnvironmentApiBaseUrl : {projectConfig?.graFxStudioEnvironmentApiBaseUrl}</h3>
        </div>
    );
}

export default App;
