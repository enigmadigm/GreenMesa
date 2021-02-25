import React from 'react';
import { OptionsType, OptionTypeBase } from 'react-select';

import CreatableSelect from 'react-select/creatable';
import { selectStylesMK1 } from './AutomoduleCard';

const components = {
    DropdownIndicator: null,
};

const createOption = (label: string) => ({
    label,
    value: label,
});

interface CIOProps {
    values: string[];
    updateValues(ta: string[]): unknown;
}

export function CreatableInputOnly(props: CIOProps) {
    const { values, updateValues } = props;

    const [inputValue, setInputValue] = React.useState('');

    const handleChange = (value: OptionsType<OptionTypeBase>) => {
        updateValues(value.map(x => x.value));
    };

    const handleInputChange = (inputValue: string) => {
        setInputValue(inputValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (!inputValue) return;
        switch (event.key) {
            case 'Enter':
            case 'Tab':
                setInputValue('');
                updateValues([...values, inputValue]);
                event.preventDefault();
        }
    };

    return (
        <CreatableSelect
            components={components}
            inputValue={inputValue}
            isClearable
            isMulti
            menuIsOpen={false}
            onChange={handleChange}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter text here . . ."
            value={values.map(x => createOption(x))}
            styles={selectStylesMK1}
        />
    );
}