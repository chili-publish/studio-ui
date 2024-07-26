import { useEffect, useState } from 'react';
import { DateVariable as DateVariableType, Variable, VariableType } from '@chili-publish/studio-sdk';
import { Option, useMobileSize, Button, ButtonVariant } from '@chili-publish/grafx-shared-components';
import { GenieAssistant, Options, ToggleButton, defaultOptions } from '@chili-publish/grafx-genie-assistant-sdk';
import * as html2canvas from 'html2canvas';
import { css } from 'styled-components';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import {
    ComponentWrapper,
    DatePickerWrapper,
    VariablesListWrapper,
    VariablesPanelTitle,
} from './VariablesPanel.styles';
import StudioDropdown from '../shared/StudioDropdown';
import DateVariable from '../variablesComponents/DateVariable';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';

interface VariablesListProps {
    variables: Variable[];
    onMobileOptionListToggle?: (_: boolean) => void;
    isDocumentLoaded: boolean;
}

enum InputMode {
    Form = 'Form',
    Genie = 'Genie',
}

const isListVariable = (variable: Variable): variable is ListVariable => variable.type === VariableType.list;

function VariablesList({ variables, onMobileOptionListToggle, isDocumentLoaded }: VariablesListProps) {
    const { contentType, showVariablesPanel, showDatePicker, currentVariableId } = useVariablePanelContext();

    const isMobileSize = useMobileSize();
    const [listVariableOpen, setListVariableOpen] = useState<ListVariable | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>();
    const [templateContent, setTemplateContent] = useState<string | unknown>('');

    const updateVariableValue = async (variableId: string, value: string) => {
        await window.SDK.variable.setValue(variableId, value);
    };

    useEffect(() => {
        const getTemplateContent = () => {
            const run = async () => {
                try {
                    if (!isDocumentLoaded) return;
                    const template = await window.SDK.document.getCurrentState();
                    if (template.data) {
                        setTemplateContent(template.parsedData);
                    }
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('Error getting template content', error);
                    setTemplateContent('');
                }
            };

            run();
        };
        getTemplateContent();
    }, [isDocumentLoaded]);

    useEffect(() => {
        if (onMobileOptionListToggle) onMobileOptionListToggle(!!listVariableOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listVariableOpen]);

    const variableFormContent = (
        <>
            {!isMobileSize && <VariablesPanelTitle>Customize</VariablesPanelTitle>}
            {variables.length > 0 &&
                variables.map((variable: Variable) => {
                    if (!variable.isVisible) return null;

                    const isListVariabledDisplayed =
                        !listVariableOpen || (listVariableOpen && variable.id === listVariableOpen.id);
                    if (
                        isListVariable(variable) &&
                        isListVariabledDisplayed &&
                        contentType !== ContentType.DATE_VARIABLE_PICKER
                    ) {
                        const variableItem = listVariableOpen || variable;
                        const options = variableItem.items.map((item) => ({
                            label: item.displayValue || item.value,
                            value: item.value,
                        }));
                        const selectedValue = variableItem.selected
                            ? {
                                  label: variableItem.selected.displayValue || variableItem.selected.value,
                                  value: variableItem.selected.value,
                              }
                            : ('' as unknown as Option);
                        return (
                            <ComponentWrapper
                                key={`variable-component-${variable.id}`}
                                data-intercom-target={`dropdown-variable-${variable.name}`}
                            >
                                <StudioDropdown
                                    dataId={variable.id}
                                    label={variable.name}
                                    selectedValue={selectedValue || ''}
                                    options={options}
                                    onChange={(val) => updateVariableValue(variable.id, val)}
                                    onMenuOpen={() => setListVariableOpen(variable)}
                                    onMenuClose={() => setListVariableOpen(null)}
                                />
                            </ComponentWrapper>
                        );
                    }
                    const isDateVariableOpen =
                        variable.type === VariableType.date &&
                        contentType === ContentType.DATE_VARIABLE_PICKER &&
                        currentVariableId === variable.id;
                    if (isDateVariableOpen && !listVariableOpen && isMobileSize) {
                        return (
                            <>
                                <DatePickerWrapper>
                                    <DateVariable
                                        key={variable.id}
                                        variable={variable as DateVariableType}
                                        inline
                                        selected={selectedDate}
                                        setDate={(val) => {
                                            setSelectedDate(new Date(val));
                                        }}
                                    />
                                </DatePickerWrapper>
                                <Button
                                    dataId={getDataIdForSUI(`date-confirm-btn`)}
                                    dataTestId={getDataTestIdForSUI(`date-confirm-btn`)}
                                    onClick={() => {
                                        if (selectedDate) {
                                            updateVariableValue(variable.id, selectedDate?.toISOString().split('T')[0]);
                                            showVariablesPanel();
                                            setSelectedDate(null);
                                        }
                                    }}
                                    variant={ButtonVariant.primary}
                                    label="Confirm"
                                    styles={css`
                                        width: 100%;
                                    `}
                                />
                            </>
                        );
                    }
                    return !listVariableOpen && contentType !== ContentType.DATE_VARIABLE_PICKER ? (
                        <ComponentWrapper key={`variable-component-${variable.id}`}>
                            <VariablesComponents
                                type={variable.type}
                                variable={variable}
                                isDocumentLoaded={isDocumentLoaded}
                                onCalendarOpen={() => {
                                    if (variable.type === VariableType.date)
                                        showDatePicker(variable as DateVariableType);
                                }}
                            />
                        </ComponentWrapper>
                    ) : null;
                })}
        </>
    );

    const genieAssistant =
        // eslint-disable-next-line no-nested-ternary
        variables.length === 0 ? (
            <p>no vars!</p>
        ) : typeof jest !== 'undefined' ? (
            <GenieAssistant />
        ) : (
            <GenieAssistant
                onScreenshotRequested={async () => {
                    const toScreenshot = document.getElementById('chili-editor')?.getElementsByTagName('iframe')[0]
                        .contentDocument?.body;

                    if (!toScreenshot) {
                        return null;
                    }

                    return new Promise<Blob | null>((resolve) => {
                        html2canvas
                            .default(toScreenshot)
                            .then((canvas) => {
                                canvas.toBlob((blob) => {
                                    resolve(blob);
                                });
                            })
                            .catch(() => {
                                resolve(null);
                            });
                    });
                }}
                onMessage={(
                    message: string,
                    options: Options,
                    messageCount: number,
                    addFile: (name: string, content: Blob) => void,
                ) => {
                    try {
                        addFile(
                            'template.json',
                            new Blob([JSON.stringify(templateContent)], { type: 'application/json' }),
                        );
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error('Error sending template', error);
                    }
                }}
                options={{
                    ...defaultOptions,
                    baseURL: 'https://grafx-genie-hvbvf4abh9bffhd9.westeurope-01.azurewebsites.net',
                    bot: {
                        ...defaultOptions.bot,
                        chatLayout: 'ultracompact',
                        botId: 'studioBot',
                        welcomeMessage: `Hello! 🌟 I'm your GraFx Genie!\n🧞‍♂️ Ready to manage your template variables like images 🖼️, text 📝, boolean values 🔘, and lists 📋. \nTell me which variable to change, ask for a list of variables, or type 'help' for assistance. Let's get started! 😄🚀
                                \n Ask me about the following variables: \n  ${variables
                                    .filter((v) => v.isVisible)
                                    .map((variable: Variable) => `- ${variable.name}`)
                                    .join('\n')}
                                `,
                        systemPrompt: `This is the current list of variables, ${JSON.stringify(
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            variables.filter((v) => v.isVisible),
                        )}`,
                    },
                }}
            />
        );
    return (
        <VariablesListWrapper optionsListOpen={!!listVariableOpen}>
            <ToggleButton firstChild={variableFormContent} secondChild={genieAssistant} enum={InputMode} />
        </VariablesListWrapper>
    );
}

export default VariablesList;
