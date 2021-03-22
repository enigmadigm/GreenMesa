import React, { Dispatch, SetStateAction } from 'react';
//import { RouteComponentProps } from 'react-router-dom';
import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types';
import { host } from '../../index';
import { DashboardAutomod, DashboardAutorole, DashboardCommands, DashboardHome, DashboardLeveling, DashboardServerlog, DashboardTwitch, DashHeader } from '../../components';
import { Spinner, Center } from '@chakra-ui/react';
import { Switch, Route, BrowserRouter as Router, RouteComponentProps, Link } from 'react-router-dom';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { faHomeLgAlt, faLayerPlus, faLevelUpAlt, faPaintRoller } from '@fortawesome/pro-solid-svg-icons';
import { faBadgeSheriff, faThList } from '@fortawesome/pro-duotone-svg-icons';

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

export interface MatchParams {
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

export interface StatusInfo {
    msg: string;
    success: boolean;
    module?: string;
}

export interface HomeProps extends StatusProps {
    user: IUser;
    meta: GMeta;
}

export interface StatusProps {
    status: StatusInfo;
    setStatus: React.Dispatch<React.SetStateAction<StatusInfo>>;
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
    const [meta, setMeta] = React.useState<GMeta>({});
    const [status, setStatus] = React.useState<StatusInfo>({ module: "", msg: "", success: true });
    const [statusShow, setStatusShow] = React.useState<"field-alert-in" | "field-alert-out" | "">("");

    React.useEffect(() => {
        fetch("/api/auth")
            .then(x => {
                return x.json()
                    .catch((e) => {throw Error("login")})
            })
            .then(d => {
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
                // window.location.href = `${host}/api/auth/discord?redirect=${encodeURIComponent(window.location.href)}`;
                if (e.message === "login") {
                    window.location.href = `${host}/api/auth/discord?redirect=${encodeURIComponent(window.location.href)}`;
                } else {
                    window.location.href = `/dash/unauthorized`;
                }
                setLoading(true);
            })
    }, [guildID])

    React.useEffect(() => {
        if (!status.msg) {
            setStatusShow("field-alert-out");
        } else {
            if (!status.module) {
                setStatusShow("field-alert-in");
            }
            startStatusTimer();
        }
    }, [status])

    const startStatusTimer = () => {
        setTimeout(() => {
            setStatus({
                msg: "",
                success: true
            })
        }, 6000)
    }

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
                                <li className="lanav-item">
                                    <CustomNavItem to="automod" text="Automod" active={page === "automod"} oc={setPage} ico={{ icon: faBadgeSheriff }} />
                                </li>
                                <li>
                                    <CustomNavItem to="leveling" text="Leveling" active={page === "leveling"} oc={setPage} ico={{ icon: faLevelUpAlt }} />
                                </li>
                                <li>
                                    <CustomNavItem to="autorole" text="Autorole" active={page === "autorole"} oc={setPage} ico={{ icon: faPaintRoller }} />
                                </li>
                                <li>
                                    <CustomNavItem to="serverlog" text="Serverlog" active={page === "serverlog"} oc={setPage} ico={{ icon: faThList }} />
                                </li>
                                <li>
                                    <CustomNavItem to="commands" text="Commands" active={page === "commands"} oc={setPage} ico={{ icon: faLayerPlus }} />
                                </li>
                                <li>
                                    <CustomNavItem to="twitch" text="Twitch" active={page === "twitch"} oc={setPage} ico={{ icon: faLayerPlus }} />
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <div className="x-main">
                        <Switch>
                            <Route exact path="/dash/:id/home">
                                <DashboardHome user={user} meta={meta} status={status} setStatus={setStatus} />
                            </Route>
                            <Route exact path="/dash/:id/automod">
                                <DashboardAutomod user={user} meta={meta} status={status} setStatus={setStatus} />
                            </Route>
                            <Route exact path="/dash/:id/leveling" >
                                <DashboardLeveling user={user} meta={meta} status={status} setStatus={setStatus} />
                            </Route>
                            <Route exact path="/dash/:id/autorole" >
                                <DashboardAutorole user={user} meta={meta} status={status} setStatus={setStatus} />
                            </Route>
                            <Route exact path="/dash/:id/serverlog" >
                                <DashboardServerlog user={user} meta={meta} status={status} setStatus={setStatus} />
                            </Route>
                            <Route exact path="/dash/:id/commands" >
                                <DashboardCommands user={user} meta={meta} status={status} setStatus={setStatus} />
                            </Route>
                            <Route exact path="/dash/:id/twitch" >
                                <DashboardTwitch user={user} meta={meta} status={status} setStatus={setStatus} />
                            </Route>
                        </Switch>
                    </div>
                </div>
                <div className={`field-alert ${statusShow} ${status.success ? "field-success" : "field-error"}`}>
                    {status.msg}
                </div>
            </Router>
        </div>
    ) : (
        <Center className="lspinner">
            <Spinner color="red.500" size="xl" css="margin:auto" />
        </Center>
    )
}