import { Command } from "src/gm";
import xlg from "../xlogger";
//import { getGlobalSetting } from "../dbmanager";

// https://www.w3resource.com/javascript-exercises/javascript-object-exercise-5.php
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Cylinder {
	cyl_height: number;
	cyl_diameter: number;
	constructor(cyl_height: number, cyl_diameter: number) {
		this.cyl_height = cyl_height;
		this.cyl_diameter = cyl_diameter;
	}
	Volume() {
		const radius = this.cyl_diameter / 2;
		return this.cyl_height * Math.PI * radius * radius;
	}
}

export const command: Command = {
  name: "cylinder",
  description: "find the area/surface of a cylinder",
  usage: "<height> <diameter>",
  args: true,
  async execute(client, message, args) {
    try {
      if (!(await client.specials?.argsNumRequire(message.channel, args, 2))) return false;
      if (!(await client.specials?.argsMustBeNum(message.channel, args))) return false;
      
			const cyl = new Cylinder(parseInt(args[0], 10), parseInt(args[1], 10));
      
      message.channel.send({
        embed: {
					color: await client.database.getColor("darkgreen_embed_color"),
          title: "Area of Cylinder: Answer",
          description: `The total area is \`${cyl.Volume().toFixed(4)}\``
        }
      })
    } catch (error) {
      xlg.error(error);
      await client.specials?.sendError(message.channel);
      return false;
    }
  }
}
