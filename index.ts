import golf from "./src/golf";
import chalk from "chalk";
import {closeDb, startDb} from "./src/db-emu";

let argv = process.argv.slice(2);

let args = eval("(" + argv[0] + ")");
let context: CLIContext = {
    caller: "hacker",
    this_script: "golf",
    cols: 110,
    rows: 90,
    calling_script: null,
};

await startDb()

// @ts-ignore
global.$fs = {
    scripts: {
        lib: () => {
            return {
                caller_is_owner: () => true
            }
        }
    }
}

let output = golf(context, args);
if (typeof output !== "string") {
    output = output?.msg;
}
if (output === undefined) {
    console.error("No output");
}
output = hackmudColorToTerminal(output);

console.log(output);

await closeDb();

function hackmudColorToTerminal(input: string) {
    input = input.replace(/(\w+)\.(\w+)/g, "`C$1`.`L$2`")

    const colorMap = {
        "0": chalk.hex("#9B9B9B"),
        "1": chalk.hex("#FFFFFF"),
        "2": chalk.hex("#1EFF00"),
        "3": chalk.hex("#0070DD"),
        "4": chalk.hex("#B035EE"),
        "5": chalk.hex("#FF8000"),
        "6": chalk.hex("#FF8000"),
        "7": chalk.hex("#FF8000"),
        "8": chalk.hex("#FF8000"),
        "9": chalk.hex("#FF8000"),
        a: chalk.hex("#000000"),
        b: chalk.hex("#3F3F3F"),
        c: chalk.hex("#676767"),
        d: chalk.hex("#7D0000"),
        e: chalk.hex("#8E3434"),
        f: chalk.hex("#A34F00"),
        g: chalk.hex("#725437"),
        h: chalk.hex("#A88600"),
        i: chalk.hex("#B2934A"),
        j: chalk.hex("#939500"),
        k: chalk.hex("#495225"),
        l: chalk.hex("#299400"),
        m: chalk.hex("#23381B"),
        n: chalk.hex("#00535B"),
        o: chalk.hex("#324A4C"),
        p: chalk.hex("#0073A6"),
        q: chalk.hex("#385A6C"),
        r: chalk.hex("#010067"),
        s: chalk.hex("#507AA1"),
        t: chalk.hex("#601C81"),
        u: chalk.hex("#43314C"),
        v: chalk.hex("#8C0069"),
        w: chalk.hex("#973984"),
        x: chalk.hex("#880024"),
        y: chalk.hex("#762E4A"),
        z: chalk.hex("#101215"),
        A: chalk.hex("#FFFFFF"),
        B: chalk.hex("#CACACA"),
        C: chalk.hex("#9B9B9B"),
        D: chalk.hex("#FF0000"),
        E: chalk.hex("#FF8383"),
        F: chalk.hex("#FF8000"),
        G: chalk.hex("#F3AA6F"),
        H: chalk.hex("#FBC803"),
        I: chalk.hex("#FFD863"),
        J: chalk.hex("#FFF404"),
        K: chalk.hex("#F3F998"),
        L: chalk.hex("#1EFF00"),
        M: chalk.hex("#B3FF9B"),
        N: chalk.hex("#00FFFF"),
        O: chalk.hex("#8FE6FF"),
        P: chalk.hex("#0070DD"),
        Q: chalk.hex("#A4E3FF"),
        R: chalk.hex("#0000FF"),
        S: chalk.hex("#7AB2F4"),
        T: chalk.hex("#B035EE"),
        U: chalk.hex("#E6C4FF"),
        V: chalk.hex("#FF00EC"),
        W: chalk.hex("#FF96E0"),
        X: chalk.hex("#FF0070"),
        Y: chalk.hex("#FF6A98"),
        Z: chalk.hex("#0C112B"),
    };

    const regex = /\`([\w])[^`]*\`/g;
    let output = [];

    let match;
    let lastIndex = 0;
    while ((match = regex.exec(input))) {
        const color = colorMap[match[1]];
        output.push(colorMap["S"](input.slice(lastIndex, match.index)));
        output.push(color(match[0].slice(2, -1)));
        lastIndex = regex.lastIndex;
    }
    output.push(colorMap["S"](input.slice(lastIndex)));

    return output.join("");
}


