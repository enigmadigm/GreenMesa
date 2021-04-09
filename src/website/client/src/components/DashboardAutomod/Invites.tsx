import React from 'react';
import { AMCustomOptionsProps } from './AutomoduleCard';
import { FormControl, FormLabel, Switch } from '@chakra-ui/react';

export function Invites(props: AMCustomOptionsProps) {
    const { mod, setMod } = props;

    const handleNestedToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state = e.target.checked;
        const m = Object.assign({}, mod);
        m.option1 = state;
        setMod(m);
    }

    return (
        <div>
            <hr style={{ marginTop: 15, marginBottom: 15 }} />
            <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor={`amainest`} mb="0">
                    Nested
                </FormLabel>
                <Switch id={`amainest`} onChange={handleNestedToggle} defaultChecked={mod.option1} checked={mod.option1} style={{ marginRight: 10 }} />
                <span style={{ fontWeight: 700, paddingBottom: 5 }}>{mod.option1 ? "off" : "on"}</span>
            </FormControl>
            <p style={{ marginBottom: "1rem" }}>Choose whether to check for invites that are nested in other text.</p>
        </div>
    )
}