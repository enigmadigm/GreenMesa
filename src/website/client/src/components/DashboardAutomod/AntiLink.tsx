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

    const handleNestedToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state = e.target.checked;
        const m = Object.assign({}, mod);
        m.notNested = state;
        setMod(m);
    }

    return (
        <div>
            <hr style={{ marginTop: 15, marginBottom: 15 }} />
            <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor={`amalstrict`} mb="0">
                    Strict mode
                </FormLabel>
                <Switch id={`amalstrict`} onChange={handleStrictToggle} defaultChecked={mod.strict} checked={mod.strict} style={{ marginRight: 10 }} />
                <span style={{ fontWeight: 700, paddingBottom: 5 }}>{mod.strict ? "on" : "off"}</span>
            </FormControl>
            <p style={{marginBottom: "1rem"}}>Enabling strict mode will add additional checks (some experimental) for links. One of these checks strips all whitespace from message content and rescans for links; therefore, it may result in false positives on longer sentenced messages.</p>
            <hr style={{ marginTop: 15, marginBottom: 15 }} />
            <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor={`amalnest`} mb="0">
                    Nested links
                </FormLabel>
                <Switch id={`amalnest`} onChange={handleNestedToggle} defaultChecked={mod.notNested} checked={mod.notNested} style={{ marginRight: 10 }} />
                <span style={{ fontWeight: 700, paddingBottom: 5 }}>{mod.notNested ? "off" : "on"}</span>
            </FormControl>
            <p style={{ marginBottom: "1rem" }}>The module will check for nested links by default. Nested means within text (e.g. innocenttextgoogle.cominnocenttext). Check this option to disable the nested links checking.</p>
        </div>
    )
}