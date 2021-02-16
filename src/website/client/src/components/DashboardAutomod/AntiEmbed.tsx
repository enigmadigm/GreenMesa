import React from 'react';
import { AMCustomOptionsProps } from './AutomoduleCard';
import { FormControl, FormLabel, Switch } from '@chakra-ui/react';

export function AntiEmbed(props: AMCustomOptionsProps) {
    const { mod, setMod } = props;

    const handleIgnoreToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state = e.target.checked;
        const m = Object.assign({}, mod);
        m.ignoreBots = state;
        setMod(m);
    }

    return (
        <div>
            <hr style={{ marginTop: 15, marginBottom: 15 }} />
            <p style={{ marginBottom: "1rem" }}>Toggling the ignore bots option disables embed checking for messages sent from bots (this includes webhooks).</p>
            <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor={`amaeignore`} mb="0">
                    Ignore bots?
                </FormLabel>
                <Switch id={`amaeignore`} onChange={handleIgnoreToggle} defaultChecked={mod.ignoreBots} checked={mod.ignoreBots} style={{ marginRight: 10 }} />
                <span style={{ fontWeight: 700, paddingBottom: 5 }}>{mod.ignoreBots ? "on" : "off"}</span>
            </FormControl>
        </div>
    )
}