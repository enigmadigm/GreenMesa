import React from "react";
import { Center, Heading, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export function ErrorPage() {
    const query = useQuery();
    const err = query.get("err");
    const redirect = query.get("redirect");

    React.useEffect(() => {
        if (redirect) {
            setTimeout(() => {
                window.location.href = redirect;
            }, 2000)
        }
    }, [redirect]);

    return (
        <Center w="100%" h="100%">
            <div>
                <Heading textAlign="center">Error</Heading>
                <Text fontSize="2xl">
                    {err && err === "token" ? "There was an issue with the token Discord gave." : "An exceptional error occurred."}
                    {redirect ? " Let's try that again, shall we?" : null}
                </Text>
            </div>
        </Center>
    )
}