import {
    BooleanVariable,
    DateVariable,
    GroupVariable,
    ImageVariable,
    LongTextVariable,
    NumberVariable,
    ShortTextVariable,
    Variable,
    VariableType,
} from '@chili-publish/studio-sdk';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';

export const mockVariables: [ImageVariable, ...Variable[]] = [
    <ImageVariable>(<unknown>{
        id: 'variable1',
        name: 'Variable1',
        label: 'Variable1 Label',
        type: VariableType.image,
        occurrences: 2,
        isVisible: true,
        parentId: '2',
        value: {
            connectorId: 'grafx-media',
            assetId: 'f7951442-822e-4a3e-9a9c-2fe56bae2241',
        },
        allowQuery: true,
        allowUpload: false,
    }),
    <ImageVariable>{
        id: 'image12',
        name: 'Variable12',
        label: 'Variable12',
        type: VariableType.image,
        occurrences: 2,
        isVisible: true,
        value: {
            connectorId: 'grafx-media',
            assetId: 'f7951442-822e-4a3e-9a9c-2fe56bae2241',
        },
        allowQuery: true,
        allowUpload: false,
    },
    <ShortTextVariable>{
        id: 'shortVariable 1',
        name: 'Short Variable 1',
        label: 'Short Variable 1',
        type: VariableType.shortText,
        value: 'I am short text',
        occurrences: 22,
        parentId: '2',
        isVisible: true,
    },
    <LongTextVariable>{
        id: 'longVariable1',
        name: 'Long Variable 1',
        label: 'Long Variable 1 Label',
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
    <NumberVariable>{
        id: 'number-variable',
        name: 'Number Variable 1',
        label: 'Number Variable 1 Label',
        type: VariableType.number,
        value: 13.55,
        occurrences: 1,
        isVisible: true,
        numberOfDecimals: 2,
        decimalSeparator: '.',
        thousandsSeparator: '',
        showStepper: true,
        stepSize: 1,
        isReadonly: false,
        isRequired: false,
    },
    <DateVariable>{
        id: 'date-variable',
        name: 'Date Variable 1',
        label: 'Date Variable 1 Label',
        type: VariableType.date,
        occurrences: 0,
        isVisible: true,
        parentId: '2',
        value: '2024-07-30',
    },
    <ListVariable>{
        id: '10',
        name: 'List',
        label: 'List label',
        type: VariableType.list,
        occurrences: 0,
        isVisible: true,
        parentId: '7',
        items: [{ value: 'val 1', displayValue: 'Val 1' }, { value: 'val 2' }],
        isReadonly: false,
        isRequired: false,
    },

    <BooleanVariable>{
        id: 'boolean-var-id',
        name: 'boolean var',
        label: 'Test boolean',
        type: VariableType.boolean,
        value: true,
        occurrences: 0,
        isVisible: true,
        parentId: '7',
        isReadonly: false,
        isRequired: false,
    },
    <ShortTextVariable>{
        id: 'shortVariable-without-label',
        name: 'Short Var name',
        type: VariableType.shortText,
        value: 'I am short text',
        occurrences: 22,
        parentId: '2',
        isVisible: true,
    },
    <LongTextVariable>{
        id: 'multi-line-text-variable-1',
        name: 'Long text Var name',
        label: 'Long text Var label',
        type: VariableType.longText,
        value: 'I am long text\nSecond line',
        occurrences: 22,
        parentId: '2',
        isVisible: true,
    },
];
