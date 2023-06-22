import {
    GroupVariable,
    ImageVariable,
    LongTextVariable,
    ShortTextVariable,
    Variable,
    VariableType,
    ImageVariableSourceType,
} from '@chili-publish/studio-sdk';

export const variables: Variable[] = [
    <ImageVariable>{
        id: 'variable1',
        name: 'Variable1',
        label: 'First Variable',
        type: VariableType.image,
        occurrences: 2,
        isVisible: true,
        parentId: '2',
        src: {
            type: ImageVariableSourceType.mediaConnector,
            id: 'grafx-media',
            assetId: 'f7951442-822e-4a3e-9a9c-2fe56bae2241',
        },
    },
    <ImageVariable>{
        id: 'image12',
        name: 'Variable12',
        label: 'First Image',
        type: VariableType.image,
        occurrences: 2,
        isVisible: true,
    },
    <ShortTextVariable>{
        id: 'shortVariable 1',
        name: 'Short Variable 1',
        label: 'Short Variable1',
        type: VariableType.shortText,
        value: 'I am short text',
        occurrences: 22,
        parentId: '2',
        isVisible: true,
    },
    <LongTextVariable>{
        id: 'longVariable1',
        name: 'Long Variable 1',
        label: 'Long Variable 1',
        type: VariableType.longText,
        value: 'I am long text',
        occurrences: 52,
        isVisible: false,
    },
    <GroupVariable>{
        id: '2',
        name: 'Test Group',
        label: 'test Group',
        type: VariableType.group,
    },
];
