import { Center, Heading, Text } from "@chakra-ui/react";

export function DashboardUnauthorized() {
    return (
        <Center w="100%" h="100%">
            <div>
                <Heading textAlign="center">Unauthorized</Heading>
                <Text fontSize="2xl">
                    You are not authorized to access the requested page.
                </Text>
            </div>
        </Center>
    )
}