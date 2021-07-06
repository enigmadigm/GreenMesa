import { Command } from "src/gm";

export const command: Command = {
    name: "quadratic",
    description: {
        short: "find the 0s of a quadratic",
        long: "Use to find the 0s of a quadratic. This command properly solves the quadratic equation the standard way, which means that it uses the quadratic formula. If you don't know what that is: 𝑦 = 𝑎𝑥² + 𝑎𝑥 + 𝑐. You provide a, b, and 𝑐.",
    },
    usage: "<a> <b> <c>",
    examples: [
        "1 2 3",
    ],
    args: 3,
    async execute(client, message, args) {
        try {
            if (!(await client.specials.argsMustBeNum(message.channel, args))) return false;
    
            /* Thanks, this saved me time
             * https://www.programiz.com/javascript/examples/quadratic-roots
             */

            const a = parseInt(args[0], 10);
            const b = parseInt(args[1], 10);
            const c = parseInt(args[2], 10);
            // calculate discriminant
            const discriminant = b * b - 4 * a * c;
            let root1, root2;

            // condition for real and different roots
            if (discriminant > 0) {
                root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    
                // result
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("darkgreen_embed_color"),
                        title: "Quadratic Solution: Two Real Roots",
                        description: `The roots of quadratic equation are \`${root1}\` and \`${root2}\``,
                    }],
                });
            }
    
            // condition for real and equal roots
            else if (discriminant == 0) {
                root1 = root2 = -b / (2 * a);
    
                // result
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("darkgreen_embed_color"),
                        title: "Quadratic Solution: Double Root",
                        description: `The roots of quadratic equation are \`${root1}\` and \`${root2}\``,
                    }],
                });
            }
    
            // if roots are not real
            else {
                const realPart = (-b / (2 * a)).toFixed(2);
                const imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(2);

                // result
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("darkgreen_embed_color"),
                        title: "Quadratic Solution: Imaginary Roots",
                        description: `The roots of quadratic equation are \`${realPart} + ${imagPart}i\` and \`${realPart} - ${imagPart}i\``,
                    }],
                });
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
