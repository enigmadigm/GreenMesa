import React from "react";
import { Center, Heading, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export function ErrorPage() {
    const query = useQuery();
    const err = query.get("err")?.toLowerCase();
    const redirect = query.get("redirect");

    React.useEffect(() => {
        if (redirect) {
            setTimeout(() => {
                window.location.href = redirect;
            }, 2000)
        }
    }, [redirect]);

    const parseError = (err: string) => {
        if (err === "token") {
            err = "There was an issue with the token Discord gave.";
        } else if (err === "appealnoguild") {
            err = "Invalid appeal form. A server must be specified in the form URI.";
        }
        return err;
    }

    return (
        <Center w="100%" h="100%">
            <div>
                <Heading textAlign="center">Error</Heading>
                <Text fontSize="2xl">
                    {err ? <span>{parseError(err)}</span> : <span>An exceptional error occurred.</span>}
                    {redirect ? " Let's try that again, shall we?" : null}
                </Text>
            </div>
        </Center>
    )
}