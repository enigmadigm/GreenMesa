import React from 'react';
import { AMCustomOptionsProps } from './AutomoduleCard';
import { FormControl, FormLabel, Switch } from '@chakra-ui/react';
import { CreatableInputOnly } from './CreatableInputOnly';

export function Profanity(props: AMCustomOptionsProps) {
    const { mod, setMod } = props;
    const [phrases, setPhrases] = React.useState<string[]>(mod.customList || []);

    /*React.useEffect(() => {
        const m = Object.assign({}, mod);
        m.customList = phrases;
        setMod(m);
    }, [phrases]);*/

    const handlePhrasesChange = (p: string[]) => {
        setPhrases(p);
        const m = Object.assign({}, mod);
        m.customList = p;
        setMod(m);
    }

    const handleStrictToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state = e.target.checked;
        const m = Object.assign({}, mod);
        m.strict = state;
        setMod(m);
    }

    const handleOpt1Toggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const state = e.target.checked;
        const m = Object.assign({}, mod);
        m.option1 = !state;
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
            <p style={{ marginBottom: "1rem", color: "rgba(228,231,234, 0.5)" }}><i>Detection will improve in the future.</i></p>
            <hr style={{ marginTop: 15, marginBottom: 15 }} />
            <FormControl alignItems="center">
                <FormLabel htmlFor={`amapdefwl`} mb="0">
                    Use Default Word List:
                </FormLabel>
                <Switch id={`amapdefwl`} onChange={handleOpt1Toggle} defaultChecked={!mod.option1} checked={!mod.option1} style={{ marginRight: 10 }} />
                <span style={{ fontWeight: 700, paddingBottom: 5 }}>{mod.option1 ? "no" : "yes"}</span>
            </FormControl>
            <p style={{ marginBottom: "0.5rem", marginTop: "0.5rem" }}>Toggle the use of the default banned word list.</p>
            <hr style={{ marginTop: 15, marginBottom: 15 }} />
            <h4 className="cardsubtitle">Choose Your Words</h4>
            <p style={{ marginBottom: "1rem" }}>Set custom words/phrases to check for and suppress. This is not case sensitive.</p>
            <CreatableInputOnly values={phrases} updateValues={handlePhrasesChange} />
            <textarea name="wordlist" id="amapwl" cols={45} rows={1} style={{ backgroundColor: "#2F353A", padding: "4px 8px", marginTop: 10}} placeholder="No words yet" value={mod.customList?.length ? `So, ${mod.customList[0]} a penguin is ok?` : ""} disabled></textarea>
        </div>
    )
}