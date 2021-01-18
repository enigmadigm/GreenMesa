import React from 'react';
import { Box } from '@chakra-ui/react';
import { host } from '../../index';

interface IProps {
    guildsButton?: boolean;
    guildName?: string;
}

export function DashHeader(props: IProps) {
    return (
        <header className="top-header">
            <Box className="h-title" style={{ fontSize: "1.5rem", paddingLeft: 10, paddingBottom: 4 }}>
                Stratum Dashboard
            </Box>
            <Box className="rnav">
                <ul className="rnav-nav">
                    <li>
                        {props.guildName ? <span>{ props.guildName }</span> : ""}
                    </li>
                    <li>
                        {props.guildsButton ? <a href={`/menu`}>Guilds</a> : ""}
                    </li>
                    <li>
                        <a href={`https://stratum.hauge.rocks/invite`}>Invite</a>
                    </li>
                    <li>
                        <a href={`${host}/logout`}>Logout</a>
                    </li>
                </ul>
            </Box>
        </header>
    )
}
