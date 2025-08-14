import { useCallback, useMemo } from 'react';
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

    const RenderComponents = useMemo(() => {
        switch (type) {
            case VariableType.longText: {
                return (
                    <MultiLineTextVariable
                        variable={variable}
                        validationError={errMsg}
                        onValueChange={onVariableValueChange}
                    />
                );
            }
            case VariableType.shortText: {
                return (
                    <TextVariable variable={variable} validationError={errMsg} onValueChange={onVariableValueChange} />
                );
            }

            case VariableType.image: {
                return isDocumentLoaded ? (
                    <ImageVariable
                        variable={variable as ImageVariableType}
                        validationError={errMsg}
                        handleImageRemove={onImageVariableRemove}
                        handleImageChange={handleImageChange}
                    />
                ) : null;
            }
            case VariableType.boolean: {
                return <BooleanVariable variable={variable} handleValueChange={handleValueChange} />;
            }
            case VariableType.number: {
                return (
                    variable.isVisible && (
                        <NumberVariable
                            variable={variable as NumberVariableType}
                            validationError={errMsg}
                            onValueChange={onVariableValueChange}
                        />
                    )
                );
            }

            case VariableType.date: {
                return (
                    variable.isVisible && (
                        <DateVariable
                            variable={variable as DateVariableType}
                            validationError={errMsg}
                            onValueChange={onVariableValueChange}
                            onBlur={onValidate}
                            onCalendarOpen={onCalendarOpen}
                            isOpenOnMobile={false}
                        />
                    )
                );
            }
            case VariableType.list: {
                return (
                    <ListVariable
                        variable={variable as ListVariableType}
                        validationError={errMsg}
                        onChange={(val) => dispatch(validateVariable(val))}
                    />
                );
            }
            default:
                return null;
        }
    }, [
        type,
        variable,
        isDocumentLoaded,
        onImageVariableRemove,
        onVariableValueChange,
        onValidate,
        onCalendarOpen,
        handleValueChange,
        handleImageChange,
        errMsg,
        dispatch,
    ]);

    return <div style={{ width: '100%' }}>{RenderComponents}</div>;
}

export default VariablesComponents;
