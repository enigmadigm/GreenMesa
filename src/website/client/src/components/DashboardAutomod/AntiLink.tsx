import React from 'react';
import { AMCustomOptionsProps } from './AutomoduleCard';
import { FormControl, FormLabel, Switch } from '@chakra-ui/react';

export function AntiLink(props: AMCustomOptionsProps) {
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
            <p style={{marginBottom: "1rem"}}>Enabling strict mode will add additional checks (some experimental) for links. One of these checks strips all whitespace from message content and rescans for links; therefore, it may result in false positives on longer sentenced messages.</p>
            <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor={`amalstrict`} mb="0">
                    Strict mode?
                </FormLabel>
                <Switch id={`amalstrict`} onChange={handleStrictToggle} defaultChecked={mod.strict} checked={mod.strict} style={{ marginRight: 10 }} />
                <span style={{ fontWeight: 700, paddingBottom: 5 }}>{mod.strict ? "on" : "off"}</span>
            </FormControl>
        </div>
    )
}