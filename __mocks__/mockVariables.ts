import { ImageVariable, ShortTextVariable, Variable, VariableType } from '@chili-publish/studio-sdk';

export const mockVariables: Variable[] = [<ImageVariable>(<unknown>{
        id: '0',
        name: 'Variable1',
        label: 'Variable1',
        type: VariableType.image,
        occurrences: 2,
        isVisible: true,
        value: {
            connectorId: '123',
            assetId: 'assetId',
        },
    }), <ShortTextVariable>(<unknown>{
        id: '1',
        name: 'Group Variable 1',
        label: 'Group Variable1',
        type: VariableType.shortText,
        occurrences: 22,
        isVisible: true,
        value: '',
    }), <ImageVariable>(<unknown>{
        id: '12',
        name: 'Variable12',
        label: 'First Image',
        type: VariableType.image,
        occurrences: 2,
        isVisible: true,
    })];
