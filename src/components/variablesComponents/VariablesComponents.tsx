import { useCallback } from 'react';
// import { DropDown } from '@chili-publish/grafx-shared-components';
import {
    DateVariable as DateVariableType,
    ImageVariable as ImageVariableType,
    NumberVariable as NumberVariableType,
    Variable,
    VariableType,
} from '@chili-publish/studio-sdk';
import { ListVariable as ListVariableType } from '@chili-publish/studio-sdk/lib/src/next';
import { useSelector } from 'react-redux';
import { useAppContext } from '../../contexts/AppProvider';
import BooleanVariable from './BooleanVariable';
import MultiLineTextVariable from './MultiLineTextVariable';
import NumberVariable from './NumberVariable';
import TextVariable from './TextVariable';
import { isDateVariable, isNumberVariable, isTextVariable, TextVariable as TextVariableType } from './Variable';
import { IVariablesComponents } from './VariablesComponents.types';
import DateVariable from './dateVariable/DateVariable';
import ImageVariable from './imageVariable/ImageVariable';
import ListVariable from './listVariable/ListVariable';
import { useVariableComponents } from './useVariablesComponents';
import { useAppDispatch } from '../../store';
import { selectVariablesValidation, validateVariable } from '../../store/reducers/variableReducer';

function VariablesComponents(props: IVariablesComponents) {
    const { type, variable, onCalendarOpen } = props;
    const { handleValueChange, handleImageRemove, handleImageChange } = useVariableComponents(variable.id);
    const { isDocumentLoaded } = useAppContext();
    const dispatch = useAppDispatch();
    const variablesValidation = useSelector(selectVariablesValidation);

    const errMsg = variablesValidation?.[variable.id]?.errorMsg;

    const onValidate = useCallback(
        (val: string | null | undefined) => {
            dispatch(validateVariable({ ...variable, value: val } as Variable));
        },
        [dispatch, variable],
    );

    const onVariableValueChange = useCallback(
        (val: string | number, { changed }: { changed: boolean }) => {
            if (isTextVariable(variable) || isNumberVariable(variable) || isDateVariable(variable)) {
                dispatch(
                    validateVariable({ ...variable, value: val } as
                        | TextVariableType
                        | NumberVariableType
                        | DateVariableType),
                );
                if (changed) return handleValueChange(val);
            }
            return null;
        },
        [handleValueChange, variable, dispatch],
    );

    const onImageVariableRemove = useCallback(async () => {
        await handleImageRemove();
        dispatch(validateVariable({ ...variable, value: { assetId: '', resolved: undefined } } as ImageVariableType));
    }, [handleImageRemove, variable, dispatch]);

    return (
        <div style={{ width: '100%' }}>
            {type === VariableType.longText && (
                <MultiLineTextVariable
                    variable={variable}
                    validationError={errMsg}
                    onValueChange={onVariableValueChange}
                />
            )}
            {type === VariableType.shortText && (
                <TextVariable variable={variable} validationError={errMsg} onValueChange={onVariableValueChange} />
            )}
            {type === VariableType.image && isDocumentLoaded && (
                <ImageVariable
                    variable={variable as ImageVariableType}
                    validationError={errMsg}
                    handleImageRemove={onImageVariableRemove}
                    handleImageChange={handleImageChange}
                />
            )}

            {type === VariableType.boolean && (
                <BooleanVariable variable={variable} handleValueChange={handleValueChange} />
            )}
            {type === VariableType.number && variable.isVisible && (
                <NumberVariable
                    variable={variable as NumberVariableType}
                    validationError={errMsg}
                    onValueChange={onVariableValueChange}
                />
            )}
            {type === VariableType.date && variable.isVisible && (
                <DateVariable
                    variable={variable as DateVariableType}
                    validationError={errMsg}
                    onValueChange={onVariableValueChange}
                    onBlur={onValidate}
                    onCalendarOpen={onCalendarOpen}
                    isOpenOnMobile={false}
                />
            )}
            {type === VariableType.list && (
                <ListVariable
                    variable={variable as ListVariableType}
                    validationError={errMsg}
                    onChange={(val) => dispatch(validateVariable(val))}
                />
            )}
        </div>
    );
}

export default VariablesComponents;
