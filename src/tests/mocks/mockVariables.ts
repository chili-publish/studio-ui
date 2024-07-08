import {
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

export const variables: Variable[] = [
    <ImageVariable>(<unknown>{
        id: 'variable1',
        name: 'Variable1',
        label: 'First Variable',
        type: VariableType.image,
        occurrences: 2,
        isVisible: true,
        parentId: '2',
        value: {
            connectorId: 'grafx-media',
            assetId: 'f7951442-822e-4a3e-9a9c-2fe56bae2241',
        },
    }),
    <ImageVariable>{
        id: 'image12',
        name: 'Variable12',
        label: 'First Image',
        type: VariableType.image,
        occurrences: 2,
        isVisible: true,
        value: {
            connectorId: 'grafx-media',
            assetId: 'f7951442-822e-4a3e-9a9c-2fe56bae2241',
        },
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
    <NumberVariable>{
        id: 'number-variable',
        name: 'Number Variable 1',
        label: 'Number Variable 1',
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
        label: 'Date Variable 1',
        type: VariableType.date,
        occurrences: 0,
        isVisible: true,
        parentId: '2',
        value: '2024-07-30',
    },
    <ListVariable>{
        id: '10',
        name: 'List',
        label: 'Test List',
        type: VariableType.list,
        occurrences: 0,
        isVisible: true,
        parentId: '7',
        items: [{ value: 'val 1', displayValue: 'Val 1' }, { value: 'val 2' }],
        isReadonly: false,
        isRequired: false,
    },
];
