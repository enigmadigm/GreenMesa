import xlg from "../xlogger";
import { MessageService } from "../gm";
import { Bot } from "../bot";

export const service: MessageService = {
    text: undefined,
    async getInformation() {
        return "";
    },
    async execute(client, data) {
        try {
            //
        } catch (error) {
            xlg.error(error);
        }
    }
}