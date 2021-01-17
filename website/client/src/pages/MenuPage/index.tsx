import React from 'react';
//import { RouteComponentProps } from 'react-router-dom';
import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types';
import { host } from '../../index';
import { DashHeader, GuildMenuWrapper } from '../../components';
import { Spinner, Center } from '@chakra-ui/react';
import LoadingBar from 'react-top-loading-bar';

interface IUser {
    guilds: RESTAPIPartialCurrentUserGuild[];
    avatar: string;
    tag: string;
    id: string
}

export function MenuPage(/*props: RouteComponentProps*/) {
    
    const [, setUser] = React.useState<IUser | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [guilds, setGuilds] = React.useState<IUser["guilds"]>([]);
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
        fetch("/api/auth")
            .then(x => x.json())
            .then(d => {
                setUser(d);
                setProgress(50);
                return fetch("/api/discord/guilds");
            })
            .then(x => x.json())
            .then(d => {
                setGuilds(d);
                setLoading(false);
                setProgress(100);
            })
            .catch((e) => {
                //props.history.push("/api/auth/discord");
                window.location.href = `${host}/api/auth/discord`;
                setLoading(false);
            })
    }, [])

    return (
        <div>
            <LoadingBar
                color='#f11946'
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            {!loading ?
            <div>
                <DashHeader />
                <GuildMenuWrapper guilds={guilds} />
            </div>
             : 
            <Center className="lspinner">
                <Spinner color="red.500" size="xl" css="margin:auto" />
            </Center>
            }
        </div>
    )
}