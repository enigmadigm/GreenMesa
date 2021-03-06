import React from 'react';
import { HomeProps } from '../../pages/DashboardPage';
import { Center, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Spinner } from '@chakra-ui/react';
import { WarnConf, WarnConfEndpointData } from '../../../../../gm';
import Select from "react-select";
import { selectStylesMK1 } from './AutomoduleCard';

export function WarnConfInterface(props: HomeProps) {
    const { setStatus } = props;
    const [loaded, setLoaded] = React.useState(false);
    const [warnConf, setWarnConf] = React.useState<WarnConf>({ punishment: "", threshold: 0, time: 0 });

    React.useEffect(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/warnconf`)
            .then(x => x.json())
            .then((d: WarnConfEndpointData) => {
                setWarnConf(d.conf);
                setLoaded(true);
            })
            .catch(e => {
                setStatus(e.message);
                setLoaded(true);
            })
    }, [props, setStatus]);

    const handleWarnConfSaveClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const hdrs = new Headers();
        hdrs.append("Content-Type", "application/x-www-form-urlencoded");
        const fd = new URLSearchParams();
        const stringConf = JSON.stringify(warnConf);
        fd.append("data", `${stringConf}`);
        const obj = {
            method: 'PUT',
            headers: hdrs,
            body: fd
        };
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/warnconf`, obj)
                .then(x => x.json())
                .then((d) => {
                    if (d.guild.data) {
                        setStatus({ msg: "Saved.", success: true });
                    } else {
                        setStatus({ msg: "Failed to save.", success: false });
                    }
                }).catch(e => {
                    console.error(e);
                    setStatus({ msg: "Error", success: false });
                });
        } catch (error) {
            console.error(error);
            setStatus({ msg: "Failed to save.", success: false });
        }
    };

    const handleWarnPunishmentChange = (v: any) => {
        const m = Object.assign({}, warnConf);
        m.punishment = v.value || undefined;
        setWarnConf(m);
    }

    const handleWarnTimeChange = (valueAsString: string, valueAsNumber: number) => {
        const m = Object.assign({}, warnConf);
        m.time = valueAsNumber;
        setWarnConf(m);
    }

    const handleWarnThresholdChange = (valueAsString: string, valueAsNumber: number) => {
        const m = Object.assign({}, warnConf);
        m.threshold = valueAsNumber;
        setWarnConf(m);
    }

    return loaded ? (
        <>
            <p style={{ fontWeight: 700 }}>Warn Threshold:</p>
            <NumberInput id="wc-threshold" min={-1} defaultValue={-1} value={warnConf.threshold} onChange={handleWarnThresholdChange}>
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
            <p style={{ marginBottom: "1rem", color: "rgba(228,231,234, 0.5)" }}><i>Set to -1 to disable.</i></p>
            <div style={{ height: 5 }} />
            <p style={{ fontWeight: 700 }}>Punishment:</p>
            <Select
                placeholder="Select punishment . . ."
                options={['tempmute', 'mute', 'kick', 'tempban', 'ban'].map(c => {
                    return { value: c, label: `${c}` };
                })}
                menuPlacement="auto"
                value={warnConf.punishment ? { value: warnConf.punishment, label: warnConf.punishment } : { label: "None" }}
                onChange={handleWarnPunishmentChange}
                styles={selectStylesMK1}
            />
            {warnConf.punishment && ["tempmute", "tempban"].includes(warnConf.punishment || "") ? (
                <>
                    <div style={{ height: 5 }} />
                    <p style={{ fontWeight: 700 }}>Punishment Length (sec):</p>
                    <NumberInput id="wc-punishtime" min={0} defaultValue={0} value={warnConf.time} onChange={handleWarnTimeChange}>
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </>
            ) : <></>}
            <div>
                <hr style={{ marginTop: 10, marginBottom: 5 }} />
                <button className="am-save-button" onClick={handleWarnConfSaveClick}>Save</button>
            </div>
        </>
    ) : (
        <Center>
            <Spinner color="red.500" size="lg" css="margin:auto" margin="30px" />
        </Center>
    )
}