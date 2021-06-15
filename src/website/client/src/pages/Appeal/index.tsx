import React from "react";
import { Center, Heading, Text } from "@chakra-ui/react";
import { RouteComponentProps, useLocation } from "react-router-dom";
import "./Appeal.css";
import { MatchParams } from "../DashboardPage";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export function Appeal({ match }: RouteComponentProps<MatchParams>) {
    // const guildID = match.params.id;

    // const query = useQuery();
    // const guild = query.get("g");
    // const redirect = query.get("redirect");
    // const [msg, setMsg] = React.useState("");
    // const [g, setG] = React.useState();

    // React.useEffect(() => {
    //     if (!guild) {
    //         setMsg("No guild was specified");
    //     } else {

    //     }
    // }, [guild]);

    // const goRedirect = () => {
    //     if (redirect) {
    //         window.location.href = redirect;
    //     }
    // }

    return (
        <Center w="100%" h="100%">
            <div className="appeal">
                <Heading textAlign="center">Appeal</Heading>
                <Text fontSize="2xl">
                    Welcome to the appeals page. This section of the site has not been completed yet, please check back later.
                </Text>
            </div>
        </Center>
    )
}
