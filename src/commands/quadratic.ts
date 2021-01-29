import { Command } from "src/gm";
import xlg from "../xlogger";
//import { getGlobalSetting } from "../dbmanager";

const command: Command = {
    name: "quadratic",
    description: "find the 0s of a quadratic",
    usage: "<a> <b> <c>",
    args: true,
    async execute(client, message, args) {
        try {
            if (!(await client.specials?.argsNumRequire(message.channel, args, 3))) return false;
            if (!(await client.specials?.argsMustBeNum(message.channel, args))) return false;
    
            /* Thanks, this saved me time
             * https://www.programiz.com/javascript/examples/quadratic-roots
             */

            const a = parseInt(args[0]);
            const b = parseInt(args[1]);
            const c = parseInt(args[2]);
            // calculate discriminant
            const discriminant = b * b - 4 * a * c;
            let root1, root2;
    
            // condition for real and different roots
            if (discriminant > 0) {
                root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    
                // result
                message.channel.send({
                    embed: {
                        color: await client.database?.getColor("darkgreen_embed_color"),
                        title: "Quadratic Solution: Two Real Roots",
                        description: `The roots of quadratic equation are \`${root1}\` and \`${root2}\``
                    }
                }).catch(xlg.error);
            }
    
            // condition for real and equal roots
            else if (discriminant == 0) {
                root1 = root2 = -b / (2 * a);
    
                // result
                message.channel.send({
                    embed: {
                        color: await client.database?.getColor("darkgreen_embed_color"),
                        title: "Quadratic Solution: Double Root",
                        description: `The roots of quadratic equation are \`${root1}\` and \`${root2}\``
                    }
                }).catch(xlg.error);
            }
    
            // if roots are not real
            else {
                const realPart = (-b / (2 * a)).toFixed(2);
                const imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(2);

                // result
                message.channel.send({
                    embed: {
                        color: await client.database?.getColor("darkgreen_embed_color"),
                        title: "Quadratic Solution: Imaginary Roots",
                        description: `The roots of quadratic equation are \`${realPart} + ${imagPart}i\` and \`${realPart} - ${imagPart}i\``
                    }
                }).catch(xlg.error);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;