import React from 'react';
import { Box, Image } from '@chakra-ui/react';
import { host } from '../../index';
import { IUser } from '../../pages/DashboardPage';

interface DashProps {
    guildsButton?: boolean;
    guildName?: string;
    icon?: string;
    user?: IUser;
}

export function DashHeader(props: DashProps) {
    return (
        <header className="top-header">
            <Box className="h-title" style={{ fontSize: "1.5rem", paddingLeft: 10, paddingBottom: 4 }}>
                Stratum Dashboard
            </Box>
            <Box className="rnav">
                <div className="rnav-img">
                    {props.icon ? (
                        <>
                            <Image src={props.icon} alt="" objectFit="contain"></Image>
                            <br/>
                        </>
                    ) : ""}
                </div>
                <ul className="rnav-nav">
                    {props.guildName ? <li key="guild">
                        <div className="rnav-guild">
                            {props.guildName}
                        </div>
                    </li> : ""}
                    {props.guildName ? <li key="gdivider" className="rnav-guild-divider"></li> : ""}
                    <li key="guildmenu">
                        {props.guildsButton ? <a href={`/menu`}>Guilds</a> : ""}
                    </li>
                    <li key="invite">
                        <a href={`https://stratum.hauge.rocks/invite`}>Invite</a>
                    </li>
                    <li key="logout" className="rnav-logout">
                        <a href={`${host}/logout`}>Logout</a>
                    </li>
                </ul>
            </Box>
            {props.user ? (
                <div className="userbox">
                    <div className="userbox-ui">
                        {(props.user.avatar && props.user.id) ? (
                            <div className="userbox-av">
                                <img src={`https://cdn.discordapp.com/avatars/${props.user.id}/${props.user.avatar}.png?size=64`} alt="Avatar" />
                            </div>
                        ) : ""}
                        {props.user.tag ? (
                            <div className="userbox-uid">
                                {props.user.tag.split("#").map((x, i) => (
                                    <span className={i === 0 ? "userbox-uname" : "userbox-disc"} key={i === 0 ? `ub-uname-${x}` : `ub-disc-${x}`}>
                                        {i === 0 ? `${x}` : `#${x}`}
                                    </span>
                                ))}
                            </div>
                        ) : ""}
                    </div>
                </div>
            ) : ""}
        </header>
    )
}
