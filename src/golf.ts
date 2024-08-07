type MapData = {
    boundsCoords: Point[];
    putCoords: Point[];
    bunkerCoords: Point[][];
    startPoint: Point;
    endPoint: Point;
    mapId: number;
    courseName: string;
    holeNumber: number;
    totalHoleCount: number;
};

type Point = {
    x: number;
    y: number;
};

type Session = {
    _id: string;
    mapId: number;
    holeNumber: number;
    ballPos: Point;
    lastUpdate: number;
    courseScores: number[];
    strokeCount: number;
};

const gameId = "golf_";

const putGreen = "`M▓`";
const fairwayGreen = "`L▓`";
const bunkerSand = "`I▒`";
const darkGreen = "`l░`";
const ballColor = "`R▓`";
const holeColor = "`X▓`";

const mapWidth = 80;
const mapHeight = 60;
const mapHeightOffset = 5;
const terminalWidth = mapWidth + 14;
const terminalHeight = mapHeight + mapHeightOffset;
const map: string[][] = [];
const drawBuffer: string[][] = [];
const mapData: MapData = {
    boundsCoords: [
        { x: 32, y: 52 },
        { x: 29, y: 27 },
        { x: 23, y: 16 },
        { x: 23, y: 9 },
        { x: 41, y: 4 },
        { x: 56, y: 8 },
        { x: 54, y: 23 },
        { x: 51, y: 52 },
    ],
    putCoords: [
        { x: 33, y: 9 },
        { x: 29, y: 13 },
        { x: 34, y: 18 },
        { x: 40, y: 13 },
    ],
    bunkerCoords: [
        [
            { x: 30, y: 41 },
            { x: 30, y: 36 },
            { x: 53, y: 34 },
            { x: 52, y: 40 },
        ],
        [
            { x: 31, y: 22 },
            { x: 39, y: 18 },
            { x: 41, y: 21 },
            { x: 39, y: 25 },
            { x: 33, y: 27 },
        ],
    ],
    startPoint: { x: 45, y: 49 },
    endPoint: { x: 34, y: 13 },
    mapId: 1,
    courseName: "Course 1",
    holeNumber: 1,
    totalHoleCount: 18,
};

let session: Session = null;

const startScreen = `
\`H  ▄██████▄   ▄██████▄   ▄█          ▄████████\`
\`H  ███    ███ ███    ███ ███         ███    ███\`
\`H  ███    █▀  ███    ███ ███         ███    █▀\`
\`H ▄███        ███    ███ ███        ▄███▄▄▄\`
\`H▀▀███ ████▄  ███    ███ ███       ▀▀███▀▀▀\`
\`H  ███    ███ ███    ███ ███         ███\`
\`H  ███    ███ ███    ███ ███▌    ▄   ███\`
\`H  ████████▀   ▀██████▀  █████▄▄██   ███\`
\`H                        ▀                      \`

Welcome to coolmath.golf.

For rules and instructions see \`Nrules\`:\`Vtrue\`


`;

export default (context: Context, args?: any): string | { ok: boolean; msg: string } => {
    if (!correctWidthAndHeight(context.cols, context.rows)) {
        return {
            ok: false,
            msg: `Terminal too small to run game\nTry setting your scale lower with gui.size {i:-1}. Or by making your right side smaller.
            \nCurrent \`Vrows\`X\`Vcols\`: \`V${context.cols}\`x\`V${context.rows}\`\nNeed at least \`V${terminalWidth}\`x\`V${terminalHeight}\``,
        };
    }

    if (args?.rules) {
        return showRules();
    }

    session = getSession(context.caller);

    if (!args || session.mapId == -1) {
        // return startScreen;
    }

    for (let y = 0; y < terminalHeight; y++) {
        drawBuffer[y] = [];
        for (let x = 0; x < terminalWidth; x++) {
            drawBuffer[y][x] = " ";
        }
    }

    for (let y = 0; y < mapHeight; y++) {
        map[y] = [];
        for (let x = 0; x < mapWidth; x++) {
            map[y][x] = darkGreen;
        }
    }

    drawCoords(mapData.boundsCoords, fairwayGreen);
    fillCoords(mapData.boundsCoords, fairwayGreen);

    drawCoords(mapData.putCoords, putGreen);
    fillCoords(mapData.putCoords, putGreen);

    for (let i = 0; i < mapData.bunkerCoords.length; i++) {
        drawCoords(mapData.bunkerCoords[i], bunkerSand);
        fillCoords(mapData.bunkerCoords[i], bunkerSand);
    }

    map[mapData.startPoint.y][mapData.startPoint.x] = ballColor;
    map[mapData.endPoint.y][mapData.endPoint.x] = holeColor;

    drawMap();
    drawSideBar();

    return drawBufferToString();
};

function correctWidthAndHeight(columns: number, rows: number): boolean {
    if (columns < terminalWidth || rows < terminalHeight) {
        return false;
    }

    return true;
}

function showRules(): string {
    return `
You are going to see a map of the golf course from a top down perspective.

Made up from the following colors

${darkGreen} - Out of bounds
${fairwayGreen} - Fairway
${putGreen} - Putt Area
${bunkerSand} - Bunker
${ballColor} - Ball
${holeColor} - Hole
`;
}

function getSession(userName: string): Session {
    let session = $db.f({ _id: gameId + userName }).first() as unknown as Session;

    if (!session) {
        session = {
            _id: gameId + userName,
            mapId: -1,
            holeNumber: 0,
            ballPos: { x: 0, y: 0 },
            lastUpdate: Date.now(),
            strokeCount: 0,
            courseScores: [],
        };

        for (let i = 0; i < mapData.totalHoleCount; i++) {
            session.courseScores.push(0);
        }
    }

    return session as Session;
}

//#region drawing
function fillCoords(coords: Point[], color: string): void {
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            if (isInPolygon(x, y, coords)) {
                map[y][x] = color;
            }
        }
    }
}

function drawCoords(coords: Point[], color: string): void {
    for (let i = 0; i < coords.length; i++) {
        drawLine(coords[i], coords[(i + 1) % coords.length], color);
    }
}

function isInPolygon(x: number, y: number, coords: Point[]): boolean {
    let inside = false;

    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        if (
            coords[i].y > y !== coords[j].y > y &&
            x <
                ((coords[j].x - coords[i].x) * (y - coords[i].y)) / (coords[j].y - coords[i].y) +
                    coords[i].x
        ) {
            inside = !inside;
        }
    }

    return inside;
}

function drawLine(point1: Point, point2: Point, color: string): void {
    const dx = Math.abs(point2.x - point1.x);
    const dy = Math.abs(point2.y - point1.y);
    const sx = point1.x < point2.x ? 1 : -1;
    const sy = point1.y < point2.y ? 1 : -1;
    let err = (dx > dy ? dx : -dy) / 2;
    let x = point1.x;
    let y = point1.y;

    while (true) {
        map[y][x] = color;
        if (x === point2.x && y === point2.y) {
            break;
        }
        const e2 = err;
        if (e2 > -dx) {
            err -= dy;
            x += sx;
        }
        if (e2 < dy) {
            err += dx;
            y += sy;
        }
    }
}

// #region Sidebar
function drawSideBar(): void {
    for (let y = mapHeightOffset; y < terminalHeight; y++) {
        for (let x = mapWidth; x < terminalWidth; x++) {
            // Draw border of 1 width
            if (
                x < mapWidth + 1 ||
                x > terminalWidth - 2 ||
                y < mapHeightOffset + 1 ||
                y > terminalHeight - 2
            ) {
                drawBuffer[y][x] = "`h▓`";
            }
        }
    }

    // Draw course name
    let courseNameText = mapData.courseName;
    for (let i = 0; i < courseNameText.length; i++) {
        drawBuffer[mapHeightOffset + 2][mapWidth + 3 + i] = courseNameText[i];
    }

    // Draw holeNumber
    let holeNumberText = `Hole ${mapData.holeNumber.toString().padStart(2, "0")}`;
    for (let i = 0; i < holeNumberText.length; i++) {
        drawBuffer[mapHeightOffset + 4][mapWidth + 3 + i] = holeNumberText[i];
    }

    // Draw stokes
    let strokeCountText = `Stroke: ${session.strokeCount.toString().padStart(2, "0")}`;
    for (let i = 0; i < strokeCountText.length; i++) {
        drawBuffer[mapHeightOffset + 6][mapWidth + 2 + i] = strokeCountText[i];
    }

    // Draw course scores
    let scoreText = "Scores";
    for (let i = 0; i < scoreText.length; i++) {
        drawBuffer[mapHeightOffset + 9][mapWidth + 3 + i] = scoreText[i];
    }
    for (let i = 0; i < session.courseScores.length; i++) {
        let score = session.courseScores[i];
        let scoreText = `${i.toString().padStart(2, "0")} - ${score.toString().padStart(2, "0")}`;
        for (let j = 0; j < scoreText.length; j++) {
            drawBuffer[mapHeightOffset + 11 + i][mapWidth + 3 + j] = scoreText[j];
        }
    }

    // Draw date
    let dateText = new Date().toLocaleDateString();
    for (let i = 0; i < dateText.length; i++) {
        drawBuffer[terminalHeight - 3][mapWidth + 3 + i] = dateText[i];
    }
}
// #endregion

function drawMap(): void {
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            drawBuffer[y + mapHeightOffset][x] = map[y][x];
        }
    }
}

function drawBufferToString(): string {
    let output = "";

    for (let y = 0; y < terminalHeight; y++) {
        for (let x = 0; x < terminalWidth; x++) {
            output += drawBuffer[y][x];
        }

        output += "\n";
    }

    return output;
}
//#endregion
