import { useEffect, useState } from 'react';
import { ListVariable, Variable, VariableType } from '@chili-publish/studio-sdk';
import { Option, useMobileSize } from '@chili-publish/grafx-shared-components';
import { GenieAssistant, Options, ToggleButton, defaultOptions } from '@chili-publish/grafx-genie-assistant-sdk';
import * as html2canvas from 'html2canvas';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { ComponentWrapper, VariablesListWrapper, VariablesPanelTitle } from './VariablesPanel.styles';
import StudioDropdown from '../shared/StudioDropdown';

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
    const isMobileSize = useMobileSize();
    const [listVariableOpen, setListVariableOpen] = useState<ListVariable | null>(null);
    const [templateContent, setTemplateContent] = useState<string | unknown>('');

    const updateListVariableValue = async (variableId: string, value: string) => {
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
                    if (isListVariable(variable) && isListVariabledDisplayed) {
                        const variableItem = listVariableOpen || variable;
                        const options = variableItem.items.map((item) => ({ label: item, value: item }));
                        const selectedValue = variableItem.selected
                            ? { label: variableItem.selected, value: variableItem.selected }
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
                                    onChange={(val) => updateListVariableValue(variable.id, val)}
                                    onMenuOpen={() => setListVariableOpen(variable)}
                                    onMenuClose={() => setListVariableOpen(null)}
                                />
                            </ComponentWrapper>
                        );
                    }
                    return !listVariableOpen ? (
                        <ComponentWrapper key={`variable-component-${variable.id}`}>
                            <VariablesComponents
                                type={variable.type}
                                variable={variable}
                                isDocumentLoaded={isDocumentLoaded}
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
                        const toScreenshot = document.getElementById('chili-editor')?.getElementsByTagName('iframe')[0]
                            .contentDocument?.body;

                        if (!toScreenshot) {
                            return;
                        }
                        html2canvas.default(toScreenshot).then((canvas) => {
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    addFile('template.png', blob);
                                }
                            });
                        });
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error('Error taking screenshot', error);
                    }
                }}
                options={{
                    ...defaultOptions,
                    baseURL: 'https://genie-assistant.azurewebsites.net',
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
