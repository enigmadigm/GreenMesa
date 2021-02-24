import React from 'react';
import { AMCustomOptionsProps } from './AutomoduleCard';
import { FormControl, FormLabel, Switch } from '@chakra-ui/react';

export function Profanity(props: AMCustomOptionsProps) {
    const { mod, setMod } = props;

    const handleStrictToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state = e.target.checked;
        const m = Object.assign({}, mod);
        m.strict = state;
        setMod(m);
    }

    return (
        <div>
            <hr style={{ marginTop: 15, marginBottom: 15 }} />
            <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor={`amapstrict`} mb="0">
                    Catholic mode
                </FormLabel>
                <Switch id={`amapstrict`} onChange={handleStrictToggle} defaultChecked={mod.strict} checked={mod.strict} style={{ marginRight: 10 }} />
                <span style={{ fontWeight: 700, paddingBottom: 5 }}>{mod.strict ? "on" : "off"}</span>
            </FormControl>
            <p style={{ marginBottom: "1rem" }}>Catholic mode enhances this profanity detection module and activates more extreme detection features.</p>
            <p style={{ marginBottom: "1rem" }}>You can expect the lengths this bot goes to in order to detect profanity to improve in the future.</p>
        </div>
    )
}