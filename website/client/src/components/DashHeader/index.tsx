import React from 'react';
import { Box, Image } from '@chakra-ui/react';
import { host } from '../../index';

interface IProps {
    guildsButton?: boolean;
    guildName?: string;
    icon?: string;
}

export function DashHeader(props: IProps) {
    return (
        <header className="top-header">
            <Box className="h-title" style={{ fontSize: "1.5rem", paddingLeft: 10, paddingBottom: 4 }}>
                Stratum Dashboard
            </Box>
            <Box className="rnav">
                <ul className="rnav-nav">
                    <li className="rnav-img">
                        {props.icon ? (
                            <Box>
                                <Image src={props.icon} alt="" objectFit="contain"></Image>
                                <br/>
                            </Box>
                        ) : ""}
                    </li>
                    <li>
                        {props.guildName ? <div className="rnav-guild">
                            {props.guildName}
                        </div> : ""}
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
