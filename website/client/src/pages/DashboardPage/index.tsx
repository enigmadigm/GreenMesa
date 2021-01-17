import React from 'react';
//import { RouteComponentProps } from 'react-router-dom';
import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types';
import { host } from '../../index';
import { DashHeader } from '../../components';
import { Spinner, Center, Input, Button, Container, Divider } from '@chakra-ui/react';
import { Formik } from "formik";

interface IUser {
    guilds: RESTAPIPartialCurrentUserGuild[];
    avatar: string;
    tag: string;
    id: string
}

//interface IMenuProps { }

export function DashboardPage() {

    const [, setUser] = React.useState<IUser | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [prefix, setPrefix] = React.useState("?");

    React.useEffect(() => {
        fetch("/api/auth")
            .then(x => x.json())
            .then(d => {
                //console.log(d)
                setUser(d);
                setLoading(false);
            })
            .catch((e) => {
                //props.history.push("/api/auth/discord");
                window.location.href = `${host}/api/auth/discord`;
                setLoading(false);
            })
    }, [])

    return !loading ? (
        <div>
            <DashHeader guildsButton={true} />
            <Container>
                <Formik
                    initialValues={{ prefix }}
                    onSubmit={(values) => {
                        console.log(values);
                    }}
                >
                    {
                        (props) => (
                            <form onSubmit={props.handleSubmit}>
                                <Input type="text" name="prefix" onChange={props.handleChange} defaultValue={prefix} />
                                <Button type="submit" variantColors="orange" children="Update Prefix" />
                            </form>
                        )
                    }
                </Formik>
            </Container>
        </div>
    ) : (
        <Center className="lspinner">
            <Spinner color="red.500" size="xl" css="margin:auto" />
        </Center>
    )
}