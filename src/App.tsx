import './App.css';

interface projectConfig {
    templateDownloadUrl: string;
    templateUploadUrl: string;
    templateId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
}
function App({ projectConfig, editorLink }: { projectConfig?: projectConfig; editorLink: string }) {
    return (
        <div className="App">
            <h1>End User workspace</h1>
            <h3>editorLink : {editorLink}</h3>
            <h3>templateDownloadUrl : {projectConfig?.templateDownloadUrl}</h3>
            <h3>templateUploadUrl : {projectConfig?.templateUploadUrl}</h3>
            <h3>templateId : {projectConfig?.templateId}</h3>
            <h3>graFxStudioEnvironmentApiBaseUrl : {projectConfig?.graFxStudioEnvironmentApiBaseUrl}</h3>
        </div>
    );
}

export default App;
