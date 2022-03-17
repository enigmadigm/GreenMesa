import { MessageService } from "../gm";

export const service: MessageService = {
    events: [],
    async getInformation() {
        return "";
    },
    async execute(client, event, ...data) {
        try {
            //
        } catch (error) {
            xlg.error(error);
        }
    }
}
