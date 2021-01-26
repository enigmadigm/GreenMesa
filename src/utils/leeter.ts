"use strict";

export default class Leeter {
	private textin!: string;
	private transtype!: number;
	private advmode!: boolean;

    contructor(tt?: number, advanced?: boolean): void {
        this.textin = "";
        this.transtype = tt || 1;
        this.advmode = advanced || false;
    }

    changewords(): void {
        this.cchange("pwn", "own");
        this.cchange(" ownzor", " own");
        this.achange(" is good ", " owns ");
        this.achange(" are good ", " own ");
        this.achange(" am good ", " own ");
        this.cchange("good you", "better than you");
        this.cchange("good me", "better than me");
        this.cchange("good them", "better than them");
        this.cchange("good him", "better than him");
        this.cchange("good her", "better than her");
        this.cchange("good it", "better than it");
        this.cchange("good us", "better than us");
        this.cchange("good that", "better than that");
        this.cchange("good all", "better than all");
        this.achange(" defeated ", " owned ");
        this.cchange("my are good", "my own");
        this.cchange("your are good", "your own");
        this.cchange("their are good", "their own");
        this.cchange("our are good", "our own");
        this.cchange("her are good", "her own");
        this.cchange("his are good", "his own");
        this.achange(" are ", " r ");
        this.achange(" am ", " m ");
        this.achange("unhack", "uhaxor");
        this.achange("hacker", "haxor");
        this.cchange("hackerer", "hacker");
        this.achange("excellent", "xellent");
        this.achange(" are you ", " ru ");
        this.achange("hack", "haxor");
        this.achange("penis", "penor");
        this.cchange(" pwn ", " own ");
        this.achange(" yay ", " woot ");
        this.achange(" you", " joo");
        this.cchange(" yor ", " your ");
        this.achange("speak", "speek");
        this.achange("leet", "1337");
        this.achange("internet", "big lan");
        this.achange(" picture", " pixor");
        this.achange("n   [^]   t ", "   [^]   nt ");
        this.achange(" kill", " frag");
        this.achange(" lamer ", " llama ");
        this.achange(" newbie ", " noob ");
        this.achange(" sex ", " sexor ");
        this.achange(" technique ", " tekniq ");
        this.achange("quake", "quaek");
        this.achange(" rock ", " roxor ");
        this.achange(" rocks ", " roxorez ");
        this.achange("cool", "kewl");
        this.achange(" the ", " teh ");
        this.achange("ass", "azz");
        this.achange("cum", "spooge");
        this.achange("ejaculate", "spooge");
        this.achange("fuck", "fuxor");
        this.achange("phuck", "phuxor");
        this.achange("porn", "pron");
        this.achange("dude", "dood");
        this.achange(" me ", " meh ");
        this.achange(" with ", " wit ");
        this.achange(" oh my god ", " omg ");
        this.cchange(" omfg ", " oh my f*cking god ");
        this.achange(" oh my fucking god ", " omfg ");
        this.achange(" oh my phoxoring god ", " omfg ");
        this.cchange("wtf", "what the f*ck");
        this.achange(" what the fuck ", " wtf ");
        this.cchange(" roflmao ", " rolling on the floor laughing my ass off ");
        this.cchange(" rofl ", " rolling on the floor laughing ");
        this.achange(" laugh my ass off ", " lmao ");
        this.achange(" okay ", " kk ");
        this.achange(" thanks ", " thx ");
        this.achange("rude", "rood");
        this.achange("ness ", "nees ");
        this.achange("please", "pleez");
        this.achange("money", "lewt");
        this.cchange("loot", "money");
        this.achange("qu", "kw");
        this.achange("fear", "fjeer");
        this.achange(" because ", " cuz ");
        this.achange("more elite", "eliteer");
        this.achange(" an a", " a a");
        this.achange(" an e", " a e");
        this.achange(" an i", " a i");
        this.achange(" an o", " a o");
        this.achange(" an u", " a u");
        this.achange("bitch", "bizotch");
        this.achange("suck", "suxor");
        this.achange("at ", "@ ");
        this.achange(" e@ ", " eat ");
        if (this.transtype == 1) this.achange("e@", "eat");
        this.achange("elite", "leet");
        this.achange(" computers ", " boxen ");
        this.achange(" computer ", " boxor ");
        this.achange(" you ", " u ");
        this.achange(" your", " ur");
        this.achange(" loot ", " lewt ");
        this.achange(" stuff ", " lewt ");
        this.achange(" fool ", " foo ");
        this.achange(" yo ", " jo ");
        this.achange("ks ", "x ");
        this.achange("se ", "ze ");
        this.achange("nigga", "nigzor");
        this.achange("nigger", "nigzor");
        this.achange("negro", "nigzor");
        this.cchange("ah ", "er ");
        this.cchange("yeer", "yeah");
        this.achange("ing ", "in   [^]    ");
        this.achange("very gay", "gheyzor");
        this.achange(" f", " ph");
        this.achange("ash ", "# ");
        this.achange(" cu", " ku");
        this.achange(" ca", " ka");
        this.achange(" cat", " kat");
        this.achange(" co", " ko");
        this.achange("s ", "z ");
        this.achange("sz ", "ss ");
        this.cchange(" ph", " f");
        this.cchange(" ghey ", " gay ");
        this.cchange("badways", "horribly");
        this.cchange(" ownzor", " own");
        this.cchange("kthxbye", "okay. thanks. bye.");
        if (this.transtype == 1) this.achange("kk thx bye", "kthxbye");
        this.cchange(" k ", " okay ");
        this.cchange(" thx ", " thanks ");
        this.cchange(" i are ", " i am ");
        this.cchange(" hacker it ", " hack it ");
        this.cchange(" hacker them ", " hack them ");
        this.cchange(" hacker her ", " hack her ");
        this.cchange(" hacker him ", " hack him ");
        this.cchange(" hacker a ", " hack a ");
        this.cchange(" hacker his ", " hack his ");
        this.cchange(" hacker their ", " hack their ");
        this.cchange(" hacker that ", " hack that ");
        this.cchange("hackered", "hacked");
        this.cchange(" qea ", " Quake 3 Arena ");
        this.cchange(" qe ", " Quake 3 ");
        this.cchange(" l ", " 1 ");
        this.cchange(" z ", " 2 ");
        this.cchange(" e ", " 3 ");
        this.cchange(" s ", " 5 ");
        this.cchange(" g ", " 6 ");
        this.cchange(" l ", " 7 ");
        this.cchange(" b ", " 8 ");
        this.cchange(" y ", " 9 ");
        this.cchange(" o ", " 0 ");
        this.cchange(" L ", " 1 ");
        this.cchange("   [^]   5", "   [^]   s");
        this.cchange("siow", "slow");
        this.cchange("ciear", "clear");
        this.cchange("titie", "title");
        this.cchange(" da ", " the ");
        this.cchange(" dah ", " the ");
        this.cchange("aiso", "also");
        this.cchange("eii", "ell");
        this.cchange("ii", "ll");
        this.cchange("!i ", "!! ");
        this.cchange(" ! ", " i ");
        this.cchange("eip", "elp");
        this.cchange("sz ", "ss ");
        this.cchange("uks ", "ucks ");
        this.cchange("eer", "ear");
        this.cchange("!!s", "lis");
        this.cchange("o/o", "");
        this.cchange("eie", "ele");
        this.cchange("zor", "er");
        this.cchange("!!ing", "lling");
        this.cchange("w!!!", "will");
        this.cchange("wh!!e", "while");
        this.cchange("piay", "play");
        this.cchange("auit", "ault");
        this.cchange("ibie", "ible");
        this.cchange("tah", "ter");
        this.cchange("fah", "fer");
        this.cchange("ouid", "ould");
        this.cchange("a!!y", "ally");
        this.cchange(" cus ", " cuz ");
        this.cchange("iot", "lot");
        this.cchange("oia", "ola");
        this.cchange("zn", "sn");
        this.cchange("siat", "slat");
        this.cchange(" fone", " phone");
        this.cchange(" fase", " phase");
        this.cchange(" farmac", " pharmac");
        this.cchange(" fenom", " phenom");
        this.cchange(" fobia", " phobia");
        this.cchange(" foto", " photo");
        this.cchange(" fk", " fuck");
        this.cchange("elitear", "more elite");
        this.cchange("worid", "world");
        this.cchange("dewd", "dude");
        this.cchange("eleet", "elite");
        this.cchange("iam", "lam");
        this.cchange("@ ", "at ");
        this.cchange("@", "a");
        this.cchange("i{", "k");
        this.cchange("#", "h");
        this.cchange("iis", "r");
        if (this.transtype == 2) {
            this.textin = this.textin.replace(/(can|should|would|could|have|did) (?:are|is|am) good/g, "$1 defeat");
            this.textin = this.textin.replace(/(can|should|would|could|have|did|do|will|shall) (?:are|is|am) (good|better than)/g, "$1 defeat");
            this.textin = this.textin.replace(/(?:are|is|am) good (me|you|him|her|them|y'all|my|your|his|her|their|our)/g, "defeat $1");
        }
    }

    changeletters(): void {
        this.achange("a", "4");
        this.achange("b", "8");
        this.achange("e", "3");
        this.achange("g", "9");
        this.achange("i", "1");
        this.achange("o", "0");
        this.achange("s", "5");
        this.achange("t", "7");
        this.achange("z", "2");
        if (this.transtype == 1 && this.advmode) return;
        this.achange("d", "|)");
        this.achange("f", "|=");
        this.achange("h", "|-|");
        this.achange("ll", "|_|_");
        this.achange("u", "|_|");
        this.achange("l", "|_");
        this.achange("j", "_|");
        this.achange("k", "|<");
        this.achange("m", "|\\/|");
        this.achange("n", "|\\|");
        this.achange("v", "\\/");
        this.achange("w", "\\|/");
        this.achange("x", "><");
        this.achange("y", "`/");
        this.cchange("'/", "y");
        this.cchange("/v\\", "m");
        this.achange("p", "|>");
        this.achange("q", "().");
        this.achange("r", ".-");
        this.achange("c", "(");
        this.cchange("o|o", "do");
        this.cchange("|o", "b");
        this.cchange("o|", "d");
        this.achange("t", "+");
        this.achange("g", "6");
        this.achange("w", "\\/\\/");
        this.achange("w", "vv");
        this.achange("k", "/<");
        this.achange("s", "$");
        if (this.transtype == 2) this.achange("i", "!");
        this.achange("m", "|v|");
        this.achange("mc", "|vk");
        this.achange("w", "\\^/");
        this.achange("c", "<");
        this.achange("i", "|");
        this.achange("y", "\\-/");
        this.achange("h", "}{");
        if (this.transtype == 1) return;
        this.achange("t", "â€ ");
        this.achange("u", "Âµ");
        this.achange("c", "Â©");
        this.achange("c", "Â¢");
        this.achange("b", "ÃŸ");
        this.achange("r", "Â®");
        this.achange("f", "Æ’");
        this.achange("x", "><");
        this.achange("e", "3");
        this.achange("d", "Ã");
        this.achange("d", "Ã°");
        this.achange("v", "v");
        this.achange("t", "â€¡");
        this.achange("l", "Â£");
        this.achange("z", "Å¾");
        this.achange("y", "Â¥");
        this.achange("n", "Ã±");
        this.achange("x", "Ã—");
        this.achange("?", "Â¿");
        this.cchange("Â¡", "i");
        if (this.transtype == 2) {
            this.textin = this.textin.replace(/(?!e)@(\B)/g, "at$1");
            this.cchange("@", "a");
            this.textin = this.textin.replace(/iz(?!e)(\w)/g, "r$1");
            this.textin = this.textin.replace(/iy/g, "ly");
            this.textin = this.textin.replace(/(\s|.|,|\?|!)uk/g, "$1" + "lik");
            this.cchange("i-i", "h");
            this.textin = this.textin.replace(/i(a|@)te/g, "late"); // unnecessary escape character \ before the @
            this.cchange("eei", "eel");
            this.cchange("iee", "lee");
            this.cchange("eio", "elo");
            this.cchange("wlli", "will");
            this.cchange("ioo", "loo");
            this.cchange("d\\ll", "oni");
            this.cchange("d\\ii", "oni");
            this.cchange("i-b", "ho");
            this.cchange("lld", "ild");
            this.cchange(" unk", " link");
            this.cchange("llim", "lum");
            this.cchange("/v", "n");
            this.cchange("milumeter", "millimeter");
            this.cchange("skllis", "skills");
            this.cchange("u>", "lp");
            this.textin = this.textin.replace(/dj(\w)/g, "ou$1");
            this.textin = this.textin.replace(/(\w)dj/g, "$1ou");
            this.textin = this.textin.replace(/dc(\w)/g, "ok$1");
            this.textin = this.textin.replace(/(\w)dc/g, "$1ok");
            this.cchange("d_", "ol");
            this.cchange("i\\b", "no");
        }
    }

    punct(): void {
        this.change(".", "   [%]   ");
        this.change(",", "   [@]   ");
        this.change("?", "   [Â©]   ");
        this.change("!", "   [$]   ");
        this.change('"', "   [&]   ");
        this.change("'", "   [^]   ");
        this.change(")", "   [~]   ");
        this.change("\n", "   [*]   ");
        this.change("\r", "");
    }

    randomcase(what: string): string {
        let tr = "";
        for (let i = 0; i < what.length; i++) {
            if (Math.random() > 0.5) tr += what.substr(i, 1).toLowerCase();
            else tr += what.substr(i, 1).toUpperCase();
        }
        return tr;
    }

    stripspaces(what: string): string {
        what = what.replace(/^ */, "");
        what = what.replace(/ *$/, "");
        return what;
    }

    unpunct(): void {
        this.change("   [%]   ", ".");
        this.change("   [@]   ", ",");
        this.change("   [a]   ", ",");
        this.change("   [Â©]   ", "?");
        this.change("   [$]   ", "!");
        this.change("   [&]   ", '"');
        this.change("   [^]   ", "'");
        this.change("   [~]   ", ")");
        this.change("   [*]   ", "\n");
    }

    change(t1: string, t2: string): string | undefined {
        let tr = this.textin;
        let lp = 0;
        while (tr.indexOf(t1) > -1) {
            if (++lp > 200) {
                return tr;
            }
            const occ = tr.indexOf(t1);
            tr = tr.substr(0, occ) + t2 + tr.substr(occ + t1.length);
        }
        this.textin = tr;
    }
    
    achange(t1: string, t2: string): void {
        if (this.transtype == 1) {
            if (Math.random() <= 0.8) this.change(t1, t2);
        }
        if (this.transtype == 2) this.change(t2, t1);
    }
    
    cchange(t1: string, t2: string): void {
        if (this.transtype == 2) this.change(t1, t2);
    }
    checkadv(): string | undefined {
        if (this.textin.length < 15) return;
        let spccount = 0; // space count
        for (let i = 0; i < this.textin.length; i++) {
            if (this.textin.substr(i, 1) == " ") spccount++;
        }
        if (spccount / this.textin.length >= 0.5) {
            this.change("  ", "##");
            this.change(" ", "");
            this.change("##", " ");
            let lgsword = 0;
            let cword = 0;
            for (let i = 0; i < this.textin.length; i++) {
                if (this.textin.substr(i, 1) == " ") {
                    if (cword > lgsword) lgsword = cword;
                    cword = 0;
                } else cword++;
            }
            if (lgsword > 10) {
                return 'bad text';
            }
        }
    }
    
    tol33t(text: string): string {
        this.transtype = 1;
        this.textin = " " + text + " ";
        this.textin = this.textin.toLowerCase();
        this.punct();
        this.changewords();
        this.changeletters();
        this.unpunct();
        return this.stripspaces(this.randomcase(this.textin));
    }
    
    tolame(text: string): string {
        this.transtype = 2;
        this.textin = " " + text + " ";
        this.textin = this.textin.toLowerCase();
        this.textin = this.textin.replace(/(\s)!(\s)/g, "$1i$2");
        const rxp = /!+\W/g;
        this.textin = this.textin.replace(rxp, ".");
        this.changeletters();
        const caRes = this.checkadv();
        if (caRes === 'bad text') return 'bad text';
        this.punct();
        // if (!document.getElementById("lit").checked) changewords();
        // else {
        // 	this.cchange("#", "h");
        // }
        this.changewords();
        this.unpunct();
        return this.stripspaces(this.textin);
    }
    
    /*function lamechanged(text) {
        tol33t(text);
    }
    
    function l33tchanged(text) {
        tolame(text);
    }*?
    
    /*function retrans() {
        if (transtype == 1) tol33t();
        else tolame();
    }*/
    //exports.lamechanged = lamechanged;
    //exports.l33tchanged = l33tchanged;
}

/*
     FILE ARCHIVED ON 21:28:41 Jun 03, 2017 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 00:06:17 Oct 11, 2017.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
