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
            <p style={{ marginBottom: "0.5rem", marginTop: "0.5rem" }}>Catholic mode enhances this profanity detection module and activates more extreme detection features.</p>
            <p style={{ marginBottom: "1rem" }}><i>Detection will improve in the future.</i></p>
            <hr style={{ marginTop: 15, marginBottom: 15 }} />
            <h4 className="cardsubtitle">Choose Your Words</h4>
            <p style={{ marginBottom: "1rem" }}>Set custom words/phrases to censor. Entering text here disables the expletive list this module uses by default. Separate with commas.</p>
            <textarea name="wordlist" id="amapwl" cols={45} rows={3} style={{ backgroundColor: "#2F353A", padding: "4px 8px"}} placeholder="word,this is a phrase,word" disabled></textarea>
        </div>
    )
}