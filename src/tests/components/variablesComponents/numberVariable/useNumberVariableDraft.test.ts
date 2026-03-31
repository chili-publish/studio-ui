import { NumberVariable } from '@chili-publish/studio-sdk';
import { act, renderHook } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import { useNumberVariableDraft } from '../../../../components/variablesComponents/numberVariable/useNumberVariableDraft';

const baseNumber = variables.find((v) => v.id === 'number-variable') as NumberVariable;

const makeNumberVariable = (value: number): NumberVariable => ({
    ...baseNumber,
    id: 'number-draft-hook-test',
    value,
});

describe('useNumberVariableDraft', () => {
    it('calls onCommitValue once when the value differs from the store', async () => {
        const variable = makeNumberVariable(10);
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockResolvedValue({ success: true, data: null });

        const { result } = renderHook(() => useNumberVariableDraft(variable, onValidateValue, onCommitValue));

        await act(async () => {
            await result.current.commitIfChanged('20');
        });

        expect(onCommitValue).toHaveBeenCalledTimes(1);
        expect(onCommitValue).toHaveBeenCalledWith(20);
    });

    it('does not call onCommitValue when the numeric value already matches the store', async () => {
        const variable = makeNumberVariable(10);
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockResolvedValue({ success: true, data: null });

        const { result } = renderHook(() => useNumberVariableDraft(variable, onValidateValue, onCommitValue));

        await act(async () => {
            await result.current.commitIfChanged('10');
        });

        expect(onCommitValue).not.toHaveBeenCalled();
        expect(onValidateValue).toHaveBeenCalledWith(10);
    });

    it('skips a second onCommitValue with the same number while the store value is still stale (pending dedupe)', async () => {
        const variable = makeNumberVariable(10);
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockResolvedValue({ success: true, data: null });

        const { result, rerender } = renderHook(() => useNumberVariableDraft(variable, onValidateValue, onCommitValue));

        await act(async () => {
            await result.current.commitIfChanged('49');
        });
        expect(onCommitValue).toHaveBeenCalledTimes(1);

        await act(async () => {
            await result.current.commitIfChanged('49.0');
        });
        expect(onCommitValue).toHaveBeenCalledTimes(1);
        rerender();
    });

    it('allows a new commit after the store value catches up', async () => {
        const variable = makeNumberVariable(10);
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockResolvedValue({ success: true, data: null });

        const { result, rerender } = renderHook(({ v }) => useNumberVariableDraft(v, onValidateValue, onCommitValue), {
            initialProps: { v: variable },
        });

        await act(async () => {
            await result.current.commitIfChanged('20');
        });
        expect(onCommitValue).toHaveBeenCalledTimes(1);

        rerender({ v: makeNumberVariable(20) });

        await act(async () => {
            await result.current.commitIfChanged('30');
        });
        expect(onCommitValue).toHaveBeenCalledTimes(2);
        expect(onCommitValue).toHaveBeenLastCalledWith(30);
    });

    it('resets pending and draft when onCommitValue resolves with success false', async () => {
        const variable = makeNumberVariable(10);
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockResolvedValue({ success: false, data: null });

        const { result } = renderHook(() => useNumberVariableDraft(variable, onValidateValue, onCommitValue));

        await act(async () => {
            await result.current.commitIfChanged('99');
        });

        expect(onCommitValue).toHaveBeenCalledTimes(1);
        expect(result.current.draft).toBe('10');
    });

    it('resets pending and draft when onCommitValue rejects', async () => {
        const variable = makeNumberVariable(10);
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn().mockRejectedValue(new Error('fail'));

        const { result } = renderHook(() => useNumberVariableDraft(variable, onValidateValue, onCommitValue));

        await act(async () => {
            await result.current.commitIfChanged('99');
        });

        expect(onCommitValue).toHaveBeenCalledTimes(1);
        expect(result.current.draft).toBe('10');
    });

    it('updateDraftWithoutCommit updates display and validates without committing', () => {
        const variable = makeNumberVariable(10);
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn();

        const { result } = renderHook(() => useNumberVariableDraft(variable, onValidateValue, onCommitValue));

        act(() => {
            result.current.updateDraftWithoutCommit('10.00', 10);
        });

        expect(result.current.draft).toBe('10.00');
        expect(onValidateValue).toHaveBeenCalledWith(10);
        expect(onCommitValue).not.toHaveBeenCalled();
    });

    it('calls onValidateValue with NaN for invalid raw input', async () => {
        const variable = makeNumberVariable(10);
        const onValidateValue = jest.fn();
        const onCommitValue = jest.fn();

        const { result } = renderHook(() => useNumberVariableDraft(variable, onValidateValue, onCommitValue));

        await act(async () => {
            await result.current.commitIfChanged('not-a-number');
        });

        expect(onValidateValue).toHaveBeenCalledWith(Number.NaN);
        expect(onCommitValue).not.toHaveBeenCalled();
    });
});
