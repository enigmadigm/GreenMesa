import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";

const actions = "bites,highs,burns,ruins,humids,leans,quiets,traffics,homes,crashes,trumps,backs,salts,xboxs,closes,records,stops,sevens,pollutes,kills,rents,cleans,extras,boggles,Taylor's,snaps,questions,coffee's,clicks,pops,ticks,maintains,stars,ties,nys,bills,defends,opens,airs,Americans,steals,drinks,yous,businesses,teleys,invents,thanks,students,computers,frees,weathers,vends,severs,allergies,silences,fires,ambers,pushes,screws,smokes,mrs,reds,consumes,let's,classes,makes,draws,lights,butters,celebrates,drives,pulls,toxics,finds,waters,pets,lags,types,environments,grows,builds,moos,tunas,confuses,classifies,births,fails,breaks,emotionals,booms,calls,taxes,burgers,4s,gases,potatoes,pre owns,sends,mows,tickles,lefts,Saharas,nals,unites,camps,roses,shuts down,macs,apples,cheeses,turns,flexes,moves,trucks,necks,swallows,Harry's,flushes,pays,eyes,cities,increases,trains,cooks,i's,cringes,unders,folds,enters,speeds,roads,spends,tacos,pumps,hearts,Willows,reads,suhs,dogs,rocks,cookies,grinds".split(",");
const accusative = "bites,voices,rubber,jokes,weather,dabs,time,jams,depots,parties,country,Clinton,fires,grasses,one,door,videos,signs,elevens,air,mood,movie,rooms,roads,brain cells,points,mind,Swifts,chats,vibe,motives,mugs,pens,buttons,sanity,tocks,office,scouts,shoes,keys,nyes,freedom,will to live,force,flags,Gatorade,sprite,tubes,service,phones,wheel,yous,services,labs,tuition,ford,machines,warnings,alert,phone,extinguishers,dexterious,driver,detector,jos,cross,M&Ms,goes,days,pictures,poles,biscuit,75 years,cars,levers,waters,ways out,burgers,dogs,minecraft,emojis,sciences,trees,legos,buildings,cows,fish,conversation,animals,certificates,science classes,hearts,issues,roasted,horns,friends,kings,Gs,birthdays,stations,chips,vehicles,texts,lawns,pickles,lanes,deserts,genes,rocks,states,outs,coffee,reds,computers,books,watches,milk,steaks,teens,wheels,muscles,homes,stops,self,tattoos,food,Potters,toilets,brows,limits,toasts,towers,volume,tracks,wears,bones,oragamies,zones,kills,money,bells,ups,radios,ways,Donald's,springs,elections,walls,corn,dudes,filters,rolls,tongues,gears".split(",");

export const command: Command = {
    name: "blankmybank",
    aliases: ["bmb"],
    description: {
        short: "get a blanks my blank",
        long: "Generate a random [blanks] my [blank] message."
    },
    args: false,
    permLevel: permLevels.member,
    async execute(client, message) {
        try {
            const sentence = `That really ${actions[Math.floor(Math.random() * actions.length)]} my ${accusative[Math.floor(Math.random() * accusative.length)]}`;
            await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("info"),
                    description: `${sentence}`,
                }],
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
