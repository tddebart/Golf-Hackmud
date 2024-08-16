let preBits: (number|null)[] = [];
let readBits: number[] = [];
let deleafedBytes: number[] = [];
let patternIndex;
let errorCorrectionLevel;
let rowLength = 49;
let groups: number[][] = [];
let totalDataCodewords: number = 0;

let ignoreMask: boolean[][] = [];

export default (context: Context, args?: any): any => {
    let qrCode = `
█▀▀▀▀▀█ ▄▀█▀▄▄ ▀ ▀▀█▄ ▀▄▄▀▄▄▄█  █ ██▄▀▄▄█ █▀▀▀▀▀█
█ ███ █ █▄▀▀▄█    ▀▀▄▀▄▀ █▄▀ █ ▀██ ▄ █ █▀ █ ███ █
█ ▀▀▀ █ █  █▄▄▄▄▄ ▀████▀▀▀█▄ █ ▄▀ █▀  ▄   █ ▀▀▀ █
▀▀▀▀▀▀▀ ▀ █▄█▄█▄█ ▀ █ █ ▀ █ █▄▀▄█ █ ▀ █ ▀ ▀▀▀▀▀▀▀
 ▄█▄▄▀▀▀▀▀███▄▄█ ▄▀▀▀▀▀█▀██ ▀▀  █▄▀ ▄▀ ▀ █ █▀▀▀▀▄
▄  ▄  ▀▀█▄█▀▀ █▀▀█ ▄▀ █▀ ▀▄▀▀▀▀█▄▄ ▄▄▀ ▀    █   █
█▀██▄▄▀▀▀█▄   ▄ ▄ ▀▀▄ ▀█▀ ▀▀█▀█  █▀ █ ▀▀ █ ▀█▀▄ ▄
  ▄▀▀▀▀▄▀▄  ▀ ▀█▄▀█ ▀ █▄▀█ ▄    ▀  ▀█▀ ▀▄█▄██ ▀▄█
██ ▀ █▀██▄ ██▀▀ █▀ ▀ █ █▄█▀ ▄██▀▄ ▀ ▀ ▀███▄▄▀▀▄▀█
█▄▀█▀▀▀▄▄▀ █▄ ▀█▀▀█▀█▄   ▄ ██▀ ▀█▄▀▀█ ▀█▄█▀ █  ▀█
 ▄█▀ ▄▀▀▀▀▄███▀▀▄▀▄    ▀▀▀ ▄ █▄▀▀█ ▄█▀ ▄ ▀▀▄▀█▄██
▀▀ ▀█▀▀▀█  ▀▀▀ █▄█▀██▀█▀▀▀█▀ █▄▀▀█▄▀▄  ▀█▀▀▀█▀▀▄▀
▄ ▄ █ ▀ █ ▄▄██▄▀█▀█▀▀██ ▀ █ ▄▀  ▄▄  █▀ ██ ▀ ██ █▄
▀ █▀█▀▀█▀▀▄ ██  █▄█▄▄▀█▀█▀█▄▀█▀ ▄▄▄██  ▄▀▀█▀█▄▀ █
▄ ▄ █▀▀█ ▄█ █▄▀▀██ ▀        ▀█▄▄██  █▄▀█▀██▀▀█▄▄▄
▄▄ ▀█ ▀ █▀ █▄█▄  █▄▀▄▄▄▄▀▀█▄ █▄▄ █ █▀▀ █▄ █▄█▄ ▄▀
▀▀██▄ ▀▄▄▄▄▀▄▀▄▄▀▄▄ ▀▀▀▀ ▄▄ █  █▀█▀█▀▀ █▀  ▀    ▄
▄█ █▀ ▀▀▄▄▄▄▄█▀▀▄ ▄█▄▀█▀█▀▀▄▀▄▀▀██ ▀█  █▄▀███▀ ▄█
█▄██▀▄▀█▀▄█▄█▀▀█▀▄ ▀   █▄█▄▀▀   ▀█▀▀█▀ ▀▄███ ▀ ▄▄
 █▄▄ ▀▀▄▄▀ ▄▄█▄▀▀▄████▀█▀█▀▄▀▀▄ ▄█▄▀▄▄▄█ ▀██▀█ ▄▀
▀▀▀   ▀ █ ▀▄▄█   █  ▄▄█▀▀▀██▄▀▄▄▀█▄███▄▀█▀▀▀█   █
█▀▀▀▀▀█ ██▀█ ▀▄ ▀█ ▀ ▄█ ▀ ██▀▀ ▄▀▀▀▀█▀▀ █ ▀ ██ ██
█ ███ █   ▀▀▀▀█▄▄  ▀▀▀██▀▀▀▀▀ ▀▄██ ▄██▀█▀█▀▀█▀  ▀
█ ▀▀▀ █ ▀▀▄ ▄█ █  ▀▄█ ▄▀▄ ▄██ ▄▄█▄ ▀█▀▄█▀▀▀▀▀█  ▀
▀▀▀▀▀▀▀     ▀  ▀▀ ▀▀ ▀▀▀▀▀▀▀  ▀ ▀▀▀▀▀▀ ▀▀   ▀   ▀`;

    // Initialize empty array
    for (let i = 0; i < qrCode.length*2; i++) {
        preBits.push(null);
    };

    fillIgnoreMask();

    // Fill array
    let rows = qrCode.slice(1).split("\n");

    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        for (let j = 0; j < rowLength; j++) {
            let index = i*2*rowLength + j;
            switch (row[j]) {
                case "█":
                    preBits[index] = 1;
                    preBits[index+rowLength] = 1;
                    break;
                case "▀":
                    preBits[index] = 1;
                    preBits[index+rowLength] = 0;
                    break;
                case "▄":
                    preBits[index] = 0;
                    preBits[index+rowLength] = 1;
                    break;
                case " ":
                    preBits[index] = 0;
                    preBits[index+rowLength] = 0;
                    break;
            }
        }
    }
    // Remove last row cause it doesn't exist
    preBits.splice(-rowLength, rowLength);

    visualizeBytes(preBits)

    patternIndex = getPatternIndex();
    errorCorrectionLevel = getErrorCorrectionLevel();
    initGroups();

    readAllBytes();

    deinterleaveBytes();

    validateEncoding();

    let length = getLength();

    let output = "";

    for (let i = 0; i < length; i++) {
        output += String.fromCharCode(readBitNumber(12+i*8, 8));
    }

    return output;
}

function getLength(): number {
    return readBitNumber(4, 8);
}

function initGroups(): void {
    const codewordGroups = [
        // ...
        [ // 8
            [[2,97]],        // L
            [[2,38],[2,39]], // M
            [[4,18],[2,19]], // Q
            [[4,14],[2,15]], // H
        ],
        // ...
    ];

    // the ec levels are not in order for some reason
    const ecLevelToIndex = [1, 0, 3, 2]; // M, L, H, Q
    const ecIndex = ecLevelToIndex[errorCorrectionLevel];

    groups = codewordGroups[0][ecIndex];

    totalDataCodewords = groups.reduce(
        (sum, [blocks, codewords]) => sum + (blocks * codewords), 0
    );
}

function readAllBytes(): void {
    let readPosX = 48;
    let readPosY = 48;
    let upDir = true;

    for (let i = totalDataCodewords*8; i > 0; i--) {
        // console.log(`${readPosX},${readPosY}`);

        if (!ignoreMask[readPosY][readPosX]) {
            readBits.push(readBitAtPos(readPosX, readPosY));
        } else {
            i++
        }

        if (readPosX % 2 == 0) {
            // Go left
            readPosX--;
        } else {
            // Go up
            if (upDir) {
                readPosY--;
            } else {
                readPosY++;
            }
            // Go right
            readPosX++;
        }

        // If out of bounds
        if (readPosY < 0 || readPosY >= 49) {
            upDir = !upDir;
            // Go up
            if (upDir) {
                readPosY--;
            } else {
                readPosY++;
            }

            // Move two left
            readPosX -= 2;
        }
    }
}

function deinterleaveBytes(): void {
    let groupData = Array.from({ length: groups.length }, () => []);
    for (let i = 0; i < groups.length; i++) {
        let [blocks, codewords] = groups[i];
        for (let j = 0; j < blocks; j++) {
            groupData[i].push([]);
        }
    }

    console.log(readBits.join(''));

    const readReadBitNumber = (index, length) => parseInt(readBits.slice(index, index+length).join(''), 2);

    let groupIndex = 0;
    let blockIndex = 0;

    for (let i = 0; i < totalDataCodewords; i++) {
        let [blocks, codewords] = groups[groupIndex];
        if (groupData[groupIndex][blockIndex].length < codewords) {
            groupData[groupIndex][blockIndex].push(readReadBitNumber(i*8, 8));
        } else {
            i--;
        }

        blockIndex++;
        if (blockIndex >= blocks) {
            blockIndex = 0;
            groupIndex++;
        }
        if (groupIndex >= groups.length) {
            groupIndex = 0;
            blockIndex = 0;
        }
    }

    console.log(groupData);

    deleafedBytes = groupData.flat(3).map((x: number) => x.toString(2).padStart(8, '0').split('')).flat().map(x => parseInt(x));
}

function validateEncoding(): void {
    let encoding = readBitNumber(0, 4);
    if (encoding != 0b0100) {
        throw new Error("Invalid encoding expected binary but got " + encoding.toString(2).padStart(4, '0'));
    }
}

function readBitAtPos(x: number, y: number): number {
    let value = preBits[y*rowLength+x];

    if (value === null) {
        throw new Error(`Null value at ${x}, ${y}`);
    }

    return doesHitPattern(x, y) ? value ^ 1 : value;
}

function readBitNumber(index: number, length: number): number {
    let value = deleafedBytes.slice(index, index+length).join('');
    return parseInt(value, 2);
};


function getPatternIndex(): number {
    let patternBit3 = preBits[46*rowLength+8] ^ 1;
    let patternBit2 = preBits[45*rowLength+8] ^ 0;
    let patternBit1 = preBits[44*rowLength+8] ^ 1;

    return parseInt(`${patternBit3}${patternBit2}${patternBit1}`, 2);
}

function getErrorCorrectionLevel(): number {
    let patternBit2 = preBits[48*rowLength+8] ^ 1;
    let patternBit1 = preBits[47*rowLength+8] ^ 0;

    return parseInt(`${patternBit2}${patternBit1}`, 2);
}

function doesHitPattern(x: number, y: number): boolean {
    switch (patternIndex) {
        case 0:
            return (x + y) % 2 == 0;
        case 1:
            return y % 2 == 0;
        case 2:
            return y % 3 == 0;
        case 3:
            return (x + y) % 3 == 0;
        case 4:
            return (y / 2 + x / 3) % 2 == 0;
        default:
            throw new Error("Invalid pattern index " + patternIndex);
    }
}

function visualizeBytes(bytes: (number|null)[]) {
    let output = "";
    for (let i = 0; i < bytes.length; i++) {
        if (i % 49 == 0) {
            output += "\n";
        }

        const debugVis = false;

        if (debugVis && ignoreMask[Math.floor(i / 49)][i % 49]) {
            output += "L";
        } else {
            output += bytes[i] ? "█" : " ";
        }
    }

    console.log(output);
}

function fillIgnoreMask() {
    const setRectangle = (startX, startY, endX, endY) => {
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                ignoreMask[y][x] = true;
            }
        }
    }

    ignoreMask = Array.from({length: rowLength}, () => Array(rowLength).fill(false));

    const end = rowLength-1;

    setRectangle(end-10, 0, end, 6);
    setRectangle(end-7, 6, end, 8);
    setRectangle(9, 6, end-10,6);

    const alignmentPositions = [
        [22, 4],
        [4, 22],
        [22, 22],
        [40, 22],
        [22, 40],
        [40, 40],
    ]

    for (const pos of alignmentPositions) {
        setRectangle(pos[0], pos[1], pos[0]+4, pos[1]+4);
    }
}