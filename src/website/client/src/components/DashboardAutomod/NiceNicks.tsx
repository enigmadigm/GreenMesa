import React from 'react';
import { AMCustomOptionsProps } from './AutomoduleCard';
import { FormControl, FormLabel, Switch } from '@chakra-ui/react';

export function NiceNicks(props: AMCustomOptionsProps) {
    const { mod, setMod } = props;

    const handleDMToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state = e.target.checked;
        const m = Object.assign({}, mod);
        m.sendDM = state;
        setMod(m);
    }

    return (
        <div>
            <hr style={{ marginTop: 15, marginBottom: 15 }} />
            <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor={`amnndm`} mb="0">
                    Send DM
                </FormLabel>
                <Switch id={`amnndm`} onChange={handleDMToggle} defaultChecked={mod.sendDM} checked={mod.sendDM} style={{ marginRight: 10 }} />
                <span style={{ fontWeight: 700, paddingBottom: 5 }}>{mod.sendDM ? "on" : "off"}</span>
            </FormControl>
            <p style={{ marginBottom: "1rem" }}>Enabling the Send DM option will prompt the bot to send private messages to anybody with a bad nickname reminding them to change it from the placeholder.</p>
        </div>
    )
}