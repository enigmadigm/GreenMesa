import React, { Dispatch, SetStateAction } from 'react';
//import { RouteComponentProps } from 'react-router-dom';
import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types';
import { host } from '../../index';
import { DashboardHome, DashboardLevelling, DashHeader } from '../../components';
import { Spinner, Center } from '@chakra-ui/react';
import { Switch, Route, BrowserRouter as Router, RouteComponentProps, Link } from 'react-router-dom';

export interface IUser {
    guilds?: RESTAPIPartialCurrentUserGuild[];
    avatar?: string;
    tag?: string;
    id?: string
}

export interface GMeta {
    id?: string;
    icon?: string;
    name?: string;
    prefix?: string;
    members?: number;
}

interface MatchParams {
    id: string;
    page: string;
}

//interface IMenuProps { }
interface CNIProps {
    to: string;
    text: string;
    active: boolean;
    oc: Dispatch<SetStateAction<string>>;
}

function CustomNavItem(props: CNIProps) {
    return (
        <Link className="lanav-link" to={props.to} style={props.active ? { backgroundColor: "#343B41", color: "#00a2f8"} : {} } onClick={() => {props.oc(props.to)}} >{props.text}</Link>
    )
}

export function DashboardPage({ match }: RouteComponentProps<MatchParams>) {
    const guildID = match.params.id;

    const [user, setUser] = React.useState<IUser | {}>({});
    const [loading, setLoading] = React.useState(true);
    const [page, setPage] = React.useState(match.params.page);
    //const [active, setActive] = React.useState("home");
    const [meta, setMeta] = React.useState <GMeta | {}>({});

    React.useEffect(() => {
        fetch("/api/auth")
            .then(x => x.json())
            .then(d => {
                //console.log(d)
                setUser(d);
                return fetch(`/api/discord/guilds/${guildID}/config`);
            })
            .then(x => x.json())
            .then(d => {
                //console.log(d);
                setMeta(d);
                setLoading(false);
            })
            .catch((e) => {
                //props.history.push("/api/auth/discord");
                window.location.href = `${host}/api/auth/discord`;
                setLoading(false);
            })
    }, [guildID])

    // <Link className="lanav-link" to="home">Home</Link>

    return !loading ? (
        <div className="app">
            <DashHeader guildsButton={true} />
            <Router>
                <div className="controls-body">
                    <div className="x-sidebar">
                        <nav>
                            <ul className="lanav">
                                <li className="lanav-item">
                                    <CustomNavItem to="home" text="Home" active={ page === "home" } oc={setPage} />
                                </li>
                                <li>
                                    <CustomNavItem to="levelling" text="Levelling" active={page === "levelling"} oc={setPage} />
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <div className="x-main">
                        <Switch>
                            <Route exact path="/dash/:id/home">
                                <DashboardHome user={user} meta={meta} />
                            </Route>
                            <Route exact path="/dash/:id/levelling" component={ DashboardLevelling } />
                        </Switch>
                    </div>
                </div>
            </Router>
        </div>
    ) : (
        <Center className="lspinner">
            <Spinner color="red.500" size="xl" css="margin:auto" />
        </Center>
    )
}