import React, { Dispatch, SetStateAction } from 'react';
//import { RouteComponentProps } from 'react-router-dom';
import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types';
import { host } from '../../index';
import { DashboardCommands, DashboardHome, DashboardLeveling, DashHeader } from '../../components';
import { Spinner, Center } from '@chakra-ui/react';
import { Switch, Route, BrowserRouter as Router, RouteComponentProps, Link } from 'react-router-dom';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { faHomeLgAlt, faLayerPlus, faLevelUpAlt } from '@fortawesome/pro-solid-svg-icons';

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
    moderation?: boolean;
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
    ico: FontAwesomeIconProps;
}

function CustomNavItem(props: CNIProps) {
    return (
        <Link className="lanav-link" to={props.to} style={props.active ? { backgroundColor: "#343B41", color: "#00a2f8" } : {}} onClick={() => { props.oc(props.to) }} >
            <div className="lanav-icon">
                <FontAwesomeIcon {...props.ico} />
            </div>
            {props.text}
        </Link>
    )
}

export function DashboardPage({ match }: RouteComponentProps<MatchParams>) {
    const guildID = match.params.id;

    const [user, setUser] = React.useState<IUser>({});
    const [loading, setLoading] = React.useState(true);
    const [page, setPage] = React.useState(match.params.page);
    //const [active, setActive] = React.useState("home");
    const [meta, setMeta] = React.useState <GMeta>({});

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
            <DashHeader user={user} guildsButton={true} guildName={meta.name} icon={meta.icon || ""} />
            <Router>
                <div className="controls-body">
                    <div className="x-sidebar">
                        <nav>
                            <ul className="lanav">
                                <li className="lanav-item">
                                    <CustomNavItem to="home" text="Home" active={ page === "home" } oc={setPage} ico={{ icon: faHomeLgAlt }} />
                                </li>
                                <li>
                                    <CustomNavItem to="leveling" text="Leveling" active={page === "leveling"} oc={setPage} ico={{ icon: faLevelUpAlt }} />
                                </li>
                                <li>
                                    <CustomNavItem to="commands" text="Commands" active={page === "commands"} oc={setPage} ico={{ icon: faLayerPlus }} />
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <div className="x-main">
                        <Switch>
                            <Route exact path="/dash/:id/home">
                                <DashboardHome user={user} meta={meta} />
                            </Route>
                            <Route exact path="/dash/:id/leveling" component={ DashboardLeveling } />
                            <Route exact path="/dash/:id/commands" component={ DashboardCommands } />
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