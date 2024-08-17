let preBits: (number | null)[] = [];
let deleafedBits: number[] = [];
let rowLength = 49;
let totalDataCodewords: number = 0;
let ignoreMask: boolean[][] = [];

export default (context: Context, args?: any): any => {
    let qrCode = `
█▀▀▀▀▀█    ▄▄▀ ▄ ▄▀▄▄▄▀▀▀▀▀ █▀▀▀▄▀█▀▄  █▄ █▄  █▀▀▀▀▀█
█ ███ █  ▀█▀▄▀▄▄▀█▀ ▄ ██   ▄█▀▄▀ ▀▀▄   ▄ ▄▄▀▄ █ ███ █
█ ▀▀▀ █ ▀▀  ▀▀█ ▄▀▀▀▀▀█▀█▀▀▀█  ▀  ▄████ █▄█   █ ▀▀▀ █
▀▀▀▀▀▀▀ █▄█ ▀▄▀ ▀ ▀ ▀▄█▄█ ▀ █▄▀▄▀▄█▄█ █ █ ▀▄█ ▀▀▀▀▀▀▀
▄▄▀▀▄▄▀█▀██▄▀▀  ▀ ▄▄ ▀▀██▀▀██▀▄ █ ▄▄▄▄▀█▀█▄ ▀▀▀▄█  ▄▄
▀▄█ ▄█▀▀▀▄▀▀▄▀▄▄▄▀ ▀█ ▄ ▄▄█▄█▄ ▄█ █▀▄▄   ██▄ ▄█ █▀ ▀ 
██▄▀▄▄▀▀█ ▄█▄ ▄█▀▄▀ ▀▀▀▀ █▄▄███ ▀▄█ █ █ ▄▀ ██▄ ▄▀ ▀ █
█ ██▄▀▀█▀▄▀█ ▀███▀▄▄▄▄  █▄  █▄▀▄▄▀█  ▀▀▄▄ █▀▀█▄▀ ▀▀▀█
  █▄█▄▀▀▄█▄ █  ▀▀▄█▀ ███ ▀█ ▀ █▄▀ █▄▄   ▄█   █▄  ▄ ▄ 
▄▀▀▄▀▀▀▄▄█ ▀▀ ▄▀ █▄  ▄▄ █  ▀█▄▄█ ▀▄█▀██▄██ ▄▀████▄█▄ 
▄▀▀ █ ▀▄██▀█▄█ ▄█▄▀▄ ▄▄█     ▄▄▄ ▀█▄▄  ▀▀▄█▄▀▄▀█▄▀▀ █
▄▀▄  ▄▀▄█▀▄▄▄ ▄█▀ ▀▄▀█ ▄▀▄  ▄▄  ▄█▀▄█▄▄▀ █▀▀▄▄███▀   
▄▀▄▄█▀▀▀█  ▀▀██▀▀ ▄ ▄▄▀ █▀▀▀█▄▄▀▀▄█▀▀██▄ █ ▄█▀▀▀█ ▀▀▄
▀▄  █ ▀ █▄ ▄█▀██ █     ▄█ ▀ ██▄▀█  ▄▀▀▀ █ █▀█ ▀ █▀▀█▀
▄█▀▄▀▀▀██▄█▀▄▄█▀▀▀ ▄▀▄▄▄█▀██▀▄█▄██▄▄ ▄ █ ▀▀█████▀▄▄▄ 
▀▀▀█▄▄▀▀▀▀▀▄▀▀██▄ ▄ ▄▄▀▀█▀ ▀▄▄▀▄▀▀▄ ▄▀█ ██▄ ▀▄▄ ▀▀█▄▄
▄  █▀█▀▀▀▄█ █▀█▀▀ ███▄▄██▀▄ █ ▄▀▄▄▀▀▄█▀▄█ ████▄ █▀█▀▄
 ▄ █ ▄▀█▀▄  ▄▀▄█▀▄ █▄█▀ ▀█▀▀▀▄▄█ ▄▄▀▄▀ ▄ ▀▀ █▀ ▀▀█   
▀█▀█▄ ▀ ▀█▀ ▄▄▀▄▄▄  ▀██▀██▀▀▄▀█▀▀▀█ ██▄▄ ▀ ▄█▀▀  ▄▀▀▄
█▄▄█▀▀▀█ ▀▄  █▀█▀▀▄▀ ▀▄▄ ▀▄▄▄█▀█▀█    █▀█▄█████ █▄▀▀▀
█  ▀▄█▀▀███▄▄▀ ▀▄▀▄   ▀ █  ▄▀█▀█ ▀▀  █ ▀ ▀  ▀ ▄█▀█▄  
▀█▄▀▀▀▀▄ ███▀ ▄▀▀ █▄▄ █▄ ▄ ▀▀▄▀█ █▄▄█ █▀▄ ▄▄▄ ▄▄ ██ ▄
   ▀  ▀ █▀█ █▀▄▄ ▀▄▄▄ ▄▀█▀▀▀█▀ ▄ █   █ █▀▄█▀█▀▀▀█▀▀▄█
█▀▀▀▀▀█ ▀█ ▄ ▄██▀▄ ▀▄▄ ██ ▀ █▄ ▄▄▀▀██   ▀▀▀ █ ▀ █  █▄
█ ███ █ ▄▀▄▀█▄ ▀▀▀ █▄▀▄▀▀▀█▀█▀ ▀   ▄▀▄▄▀▄ ▀▄▀▀████▀▀█
█ ▀▀▀ █ ▀█▀▀▀█ ▄▄▄▀▄█  █▀ ▀ ▄█▄ ▀█ █ ▀▀▄█▄██▄▀▀█ █ █▀
▀▀▀▀▀▀▀  ▀▀▀▀▀ ▀ ▀    ▀ ▀▀  ▀▀▀▀       ▀ ▀ ▀▀ ▀ ▀  ▀ `;

    // Get rowLength
    let rows = qrCode.slice(1).split("\n");
    rowLength = rows[0].length;

    // Initialize empty array
    for (let i = 0; i < rowLength * rowLength; i++) {
        preBits.push(null);
    }

    createIgnoreMask();

    readBitsFromQrString(rows);

    visualizeBytes(preBits);

    const patternIndex = getPatternIndex();
    const groups = initGroups();

    let readBits = readAllBytes(patternIndex);

    deinterleaveBytes(readBits, groups);

    validateEncoding();

    const length = getLength();

    let output = "";

    for (let i = 0; i < length; i++) {
        output += String.fromCharCode(readBitNumber(12 + i * 8, 8));
    }

    return output;
};

function readBitsFromQrString(rows: string[]) {
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        for (let j = 0; j < rowLength; j++) {
            let index = i * 2 * rowLength + j;
            switch (row[j]) {
                case "█":
                    preBits[index] = 1;
                    preBits[index + rowLength] = 1;
                    break;
                case "▀":
                    preBits[index] = 1;
                    preBits[index + rowLength] = 0;
                    break;
                case "▄":
                    preBits[index] = 0;
                    preBits[index + rowLength] = 1;
                    break;
                case " ":
                    preBits[index] = 0;
                    preBits[index + rowLength] = 0;
                    break;
            }
        }
    }
}

function getLength(): number {
    return readBitNumber(4, 8);
}

function initGroups(): number[][] {
    const codewordGroups = [
        // ...
        [ // 8
            [[2,97]],        // L
            [[2,38],[2,39]], // M
            [[4,18],[2,19]], // Q
            [[4,14],[2,15]], // H
        ],
        [ // 9
            [[2, 116]],       // L
            [[3, 36],[2,37]], // M
            [[4, 16],[4,17]], // Q
            [[4, 12],[4,13]], // H
        ],
        // ...
    ];

    const errorCorrectionLevel = getErrorCorrectionLevel();
    // the ec levels are not in order for some reason
    const ecLevelToIndex = [1, 0, 3, 2]; // M, L, H, Q
    const ecIndex = ecLevelToIndex[errorCorrectionLevel];

    let version: number;
    switch (rowLength) {
        case 49:
            version = 8;
            break;
        case 53:
            version = 9;
            break;
        default:
            throw new Error(`Invalid row length: ${rowLength}. Unsupported version.`);
    }

    const groups = codewordGroups[version - 8][ecIndex];

    totalDataCodewords = groups.reduce((sum, [blocks, codewords]) => sum + blocks * codewords, 0);

    return groups;
}

function readAllBytes(patternIndex: number): number[] {
    let readX = rowLength - 1;
    let readY = rowLength - 1;
    let upDir = -1;
    const readBits = [];

    for (let i = totalDataCodewords * 8; i > 0; i--) {
        if (ignoreMask[readY][readX]) {
            i++;
        } else {
            let readBit = preBits[readY * rowLength + readX];

            if (readBit === null) {
                throw new Error(`Null value at ${readX}, ${readY}`);
            }

            readBit = doesHitPattern(readX, readY, patternIndex) ? readBit ^ 1 : readBit;

            readBits.push(readBit);
        }

        if (readX % 2 == 0) {
            // Go left
            readX--;
        } else {
            // Go up
            readY += upDir;
            // Go right
            readX++;
        }

        // If out of bounds
        if (readY < 0 || readY >= rowLength) {
            upDir *= -1;
            // Go up
            readY += upDir;

            // Move two left
            readX -= 2;
        }
    }

    return readBits;
}

function deinterleaveBytes(readBits: number[], groups: number[][]): void {
    let groupData = Array.from({ length: groups.length }, () => []);
    for (let i = 0; i < groups.length; i++) {
        let [blocks, codewords] = groups[i];
        for (let j = 0; j < blocks; j++) {
            groupData[i].push([]);
        }
    }

    // console.log(readBits.join(""));

    const readReadBitNumber = (index, length) =>
        parseInt(readBits.slice(index, index + length).join(""), 2);

    let groupIndex = 0;
    let blockIndex = 0;

    for (let i = 0; i < totalDataCodewords; i++) {
        let [blocks, codewords] = groups[groupIndex];
        if (groupData[groupIndex][blockIndex].length < codewords) {
            groupData[groupIndex][blockIndex].push(readReadBitNumber(i * 8, 8));
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

    deleafedBits = groupData
        .flat(3)
        .map((x: number) => x.toString(2).padStart(8, "0").split(""))
        .flat()
        .map((x) => parseInt(x));
}

function validateEncoding(): void {
    let encoding = readBitNumber(0, 4);
    if (encoding != 0b0100) {
        throw new Error(
            "Invalid encoding expected binary but got " + encoding.toString(2).padStart(4, "0"),
        );
    }
}

function readBitNumber(index: number, length: number): number {
    let value = deleafedBits.slice(index, index + length).join("");
    return parseInt(value, 2);
}

function getPatternIndex(): number {
    let patternBit3 = preBits[(rowLength - 3) * rowLength + 8] ^ 1;
    let patternBit2 = preBits[(rowLength - 4) * rowLength + 8] ^ 0;
    let patternBit1 = preBits[(rowLength - 5) * rowLength + 8] ^ 1;

    return parseInt(`${patternBit3}${patternBit2}${patternBit1}`, 2);
}

function getErrorCorrectionLevel(): number {
    let patternBit2 = preBits[(rowLength - 1) * rowLength + 8] ^ 1;
    let patternBit1 = preBits[(rowLength - 2) * rowLength + 8] ^ 0;

    return parseInt(`${patternBit2}${patternBit1}`, 2);
}

function doesHitPattern(x: number, y: number, patternIndex: number): boolean {
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

function visualizeBytes(bytes: (number | null)[]) {
    let output = "";

    for (let i = 0; i < bytes.length; i++) {
        if (i % rowLength == 0) {
            output += "\n";
        }

        const debugVis = false;

        // console.log(Math.floor(i / rowLength));

        if (debugVis && ignoreMask[Math.floor(i / rowLength)][i % rowLength]) {
            output += "L";
        } else {
            output += bytes[i] ? "█" : " ";
        }
    }

    console.log(output);
}

function createIgnoreMask() {
    const setRectangle = (startX, startY, endX, endY) => {
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                ignoreMask[y][x] = true;
            }
        }
    };

    ignoreMask = Array.from({ length: rowLength + 1 }, () => Array(rowLength + 1).fill(false));

    const end = rowLength - 1;

    setRectangle(end - 10, 0, end, 6);
    setRectangle(end - 7, 6, end, 8);
    setRectangle(8, 6, end - 10, 6);

    const alignmentPositions = [
        [4, Math.floor(rowLength / 2)],
        [Math.floor(rowLength / 2), Math.floor(rowLength / 2)],
        [rowLength - 7, Math.floor(rowLength / 2)],
        [Math.floor(rowLength / 2), rowLength - 7],
        [Math.floor(rowLength / 2), 6],
        [rowLength - 7, rowLength - 7],
    ];

    for (const pos of alignmentPositions) {
        setRectangle(pos[0] - 2, pos[1] - 2, pos[0] + 2, pos[1] + 2);
    }
}
