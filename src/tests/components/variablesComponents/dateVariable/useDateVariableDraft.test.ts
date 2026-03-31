import { DateVariable } from '@chili-publish/studio-sdk';
import { act, renderHook } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import { useDateVariableDraft } from '../../../../components/variablesComponents/dateVariable/useDateVariableDraft';

const baseDate = variables.find((v) => v.id === 'date-variable') as DateVariable;

const makeDateVariable = (value: string | undefined): DateVariable => ({
    ...baseDate,
    id: 'date-draft-hook-test',
    value,
});

describe('useDateVariableDraft', () => {
    it('calls onCommitValue once when the ISO string differs from the store', async () => {
        const variable = makeDateVariable('2024-01-01');
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockResolvedValue({ success: true, data: null });

        const { result } = renderHook(() => useDateVariableDraft(variable, onValidateValue, onCommitValue));

        await act(async () => {
            await result.current.commitIfChanged('2024-06-15');
        });

        expect(onCommitValue).toHaveBeenCalledTimes(1);
        expect(onCommitValue).toHaveBeenCalledWith('2024-06-15');
    });

    it('does not call onCommitValue when the string already matches the store', async () => {
        const variable = makeDateVariable('2024-01-01');
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockResolvedValue({ success: true, data: null });

        const { result } = renderHook(() => useDateVariableDraft(variable, onValidateValue, onCommitValue));

        await act(async () => {
            await result.current.commitIfChanged('2024-01-01');
        });

        expect(onCommitValue).not.toHaveBeenCalled();
        expect(onValidateValue).toHaveBeenCalledWith('2024-01-01');
    });

    it('skips a second onCommitValue with the same ISO while the store value is still stale (pending dedupe)', async () => {
        const variable = makeDateVariable(undefined);
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockResolvedValue({ success: true, data: null });

        const { result, rerender } = renderHook(() => useDateVariableDraft(variable, onValidateValue, onCommitValue));

        await act(async () => {
            await result.current.commitIfChanged('2024-03-20');
        });
        expect(onCommitValue).toHaveBeenCalledTimes(1);

        await act(async () => {
            await result.current.commitIfChanged('2024-03-20');
        });
        expect(onCommitValue).toHaveBeenCalledTimes(1);
        rerender();
    });

    it('allows a new commit after the store value catches up', async () => {
        const variable = makeDateVariable('2024-01-01');
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockResolvedValue({ success: true, data: null });

        const { result, rerender } = renderHook(({ v }) => useDateVariableDraft(v, onValidateValue, onCommitValue), {
            initialProps: { v: variable },
        });

        await act(async () => {
            await result.current.commitIfChanged('2024-02-01');
        });
        expect(onCommitValue).toHaveBeenCalledTimes(1);

        rerender({ v: makeDateVariable('2024-02-01') });

        await act(async () => {
            await result.current.commitIfChanged('2024-12-31');
        });
        expect(onCommitValue).toHaveBeenCalledTimes(2);
        expect(onCommitValue).toHaveBeenLastCalledWith('2024-12-31');
    });

    it('resets pending and draft when onCommitValue resolves with success false', async () => {
        const variable = makeDateVariable('2024-01-01');
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockResolvedValue({ success: false, data: null });

        const { result } = renderHook(() => useDateVariableDraft(variable, onValidateValue, onCommitValue));

        await act(async () => {
            await result.current.commitIfChanged('2024-06-01');
        });

        expect(onCommitValue).toHaveBeenCalledTimes(1);
        expect(result.current.draft).toBe('2024-01-01');
    });

    it('resets pending and draft when onCommitValue rejects', async () => {
        const variable = makeDateVariable('2024-01-01');
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockRejectedValue(new Error('fail'));

        const { result } = renderHook(() => useDateVariableDraft(variable, onValidateValue, onCommitValue));

        await act(async () => {
            await result.current.commitIfChanged('2024-06-01');
        });

        expect(onCommitValue).toHaveBeenCalledTimes(1);
        expect(result.current.draft).toBe('2024-01-01');
    });

    it('does not change draft or call onCommitValue when onCommitValue is omitted', async () => {
        const variable = makeDateVariable('2024-01-01');
        const onValidateValue = jest.fn();

        const { result } = renderHook(() => useDateVariableDraft(variable, onValidateValue, undefined));

        await act(async () => {
            await result.current.commitIfChanged('2099-12-31');
        });

        expect(result.current.draft).toBe('2024-01-01');
    });
});
