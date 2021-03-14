import React from 'react';
import Select from 'react-select';
import { ServerlogData, ChannelData } from '../../../../../gm';
import { selectStylesMK1 } from '../DashboardAutomod/AutomoduleCard';

interface ChannelSelectProps {
    channels: ChannelData[];
    data: ServerlogData;
    add: any[];
    ch<T = []>(v: any, ...T: any[]): void;
}

export function ChannelSelect(props: ChannelSelectProps) {
    const { data, channels, ch, add } = props;
    return (
        <>
            <Select
                placeholder="None selected"
                options={[{ id: 'none', name: 'None' }, ...channels].map(c => {
                    return { value: c.id, label: `${c.id !== "none" ? `#${c.name}` : c.name}` };
                })}
                menuPlacement="auto"
                value={data.log_channel ? { value: data.log_channel, label: channels.find(c => c.id === data.log_channel) } : { label: "None selected" }}
                onChange={(e) => ch(e, ...add)}
                styles={selectStylesMK1}
            />
        </>
    )
}