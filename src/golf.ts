type MapData = {
    _id: string;
    boundsCoords: Point[];
    putCoords: Point[];
    bunkerCoords: Point[][];
    startPoint: Point;
    endPoint: Point;
    mapId: number;
    courseName: string;
    holeNumber: number;
    totalHoleCount: number;
    par: number;
    readonly type: "golf_map";
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
    prevBallPos: Point;
    lastUpdate: number;
    courseScores: number[];
    strokeCount: number;
    readonly type: "golf_session";
};

type returnType =
    | {
          ok: boolean;
          msg?: string;
      }
    | string;

const gameId = "golf_";

const putGreen = "`M▓`";
const fairwayGreen = "`L▓`";
const bunkerSand = "`I▒`";
const darkGreen = "`l░`";
const prevBallColor = "`R░`";
const ballColor = "`R█`";
const holeColor = "`X▓`";

const mapWidth = 80;
const mapHeight = 57;
const mapHeightOffset = 5;
const terminalWidth = mapWidth + 14;
const terminalHeight = mapHeight + mapHeightOffset;
const map: string[][] = [];
const drawBuffer: string[][] = [];

let mapData: MapData =  null;
let session: Session = null;
let alert: string = "";

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

For rules and instructions \`Nview\` \`Vrules\`
To start a new game \`Nview\` the current maps with \`Vmaps\` and start with \`Nstart\`:\`VmapId\`
`;

export default (context: Context, args?: any): returnType => {
    const lib = $fs.scripts.lib();

    // Check width and height
    if (!correctWidthAndHeight(context.cols, context.rows)) {
        return {
            ok: false,
            msg: `Terminal too small to run game\nTry setting your scale lower with gui.size {i:-1}. Or by making your right side smaller.
            \nCurrent \`Vrows\`X\`Vcols\`: \`V${context.cols}\`x\`V${context.rows}\`\nNeed at least \`V${terminalWidth}\`x\`V${terminalHeight + 4}\``,
        };
    }

    // Show rules on rules:true
    if (args?.view == "rules") {
        return showRules();
    }
    if (args?.view == "maps") {
        return showMaps();
    }

    // Insert a new map if we are script owner
    if (args?.insert_map && lib.caller_is_owner(context)) {
        return insertMap(args.insert_map);
    }

    // Get the session
    session = getSession(context.caller);

    // Reset on reset:true
    if (args?.reset) {
        if (!args?.confirm) {
            return "Are you sure you want to reset to the start menu? To continue, type `Nconfirm`:`Vtrue`";
        }
        resetGame();
    }

    if (args?.start != undefined) {
        if (session.mapId != -1) {
            // We are already in a game so ask if we want to start a new one
            if (!args?.confirm) {
                return "Are you sure you want to start a new game? This will end your current session and is not reversible. To continue, type `Nconfirm`:`Vtrue`";
            } else {
                resetGame();

                return $fs.coolmath.golf(args);
            }
        } else {
            // We are not in a game so start a new one without confirmation
            startGame(args.start);
        }
    }

    // Get the mapData
    mapData = getMapData();

    // Show start screen if we have no valid map
    if (session.mapId == -1) {
        return startScreen;
    }

    drawGround();
    // Calculate the shot
    if (args?.angle != undefined || args?.power != undefined) {
        if (args?.angle != undefined && args?.power != undefined) {
            if (args.angle < -360 || args.angle > 360) {
                return "Angle must be between -360 and 360";
            }

            if (args.power < 0 || args.power > 100) {
                return "Power must be between 0 and 100";
            }

            if (calculateShot(args.angle, args.power)) {
                return $fs.coolmath.golf()
            };
        } else {
            return "You must specify both an `Nangle` and a `Npower`";
        }
    }
    draw();

    return drawBufferToString();
};

// Returns true if the shot was a success into the hole
function calculateShot(angle: number, power: number): boolean {
    session.strokeCount += 1;
    session.prevBallPos = clone(session.ballPos);
    let pos = clone(session.ballPos);

    power /= 2;
    // If we are in a bunker we reduce the power by 20%
    if (map[pos.y][pos.x] == bunkerSand) {
        power *= 0.8;
    }
    // Multiply by a random factor from 0.9 to 1.1 so it is not always the same
    power *= Math.random() * 0.2 + 0.9;
    power = Math.round(power);

    let angleRadians = (angle-90) * (Math.PI / 180);
    let dx = Math.cos(angleRadians) * power;
    let dy = Math.sin(angleRadians) * power;

    let endPos = {
        x: Math.round(pos.x + dx),
        y: Math.round(pos.y + dy),
    } as Point;

    // Clamp the position
    endPos.x = Math.max(0, Math.min(mapWidth-1, endPos.x));
    endPos.y = Math.max(0, Math.min(mapHeight-1, endPos.y));

    let points = getCoordsBetweenPoints(pos, endPos);

    // If we went over the hole and landed really close to it we count as a success
    if (points.some(p => p.x == mapData.endPoint.x && p.y == mapData.endPoint.y) && distance(mapData.endPoint, endPos) <= 2) {
        // We are in the hole
        const successMessages = [
            "Congratulations! You made it to the hole!",
            "Well done! You made it to the hole!",
            "Amazing shot! You made it to the hole!",
            "Nice work! You sank the putt!",
            "You did it! You made it to the hole!",
            "Wow, I guess you made it to the hole.",
        ]

        const message = successMessages[Math.floor(Math.random() * successMessages.length)];

        alert = `\`L${message}\` - ${strokeToGolfTerm()}`;

        session.courseScores[session.holeNumber] = session.strokeCount;
        session.holeNumber += 1;
        session.strokeCount = -1;

        return true;
    }

    if (map[endPos.y][endPos.x] == darkGreen) {
        // Out of bounds
        session.prevBallPos = clone(endPos);
        alert = "`DYou went out of bounds! Try again!`";
    } else {
        session.ballPos = endPos;
    }

    return false;
}

function correctWidthAndHeight(columns: number, rows: number): boolean {
    if (columns < terminalWidth || rows < terminalHeight + 4) {
        return false;
    }

    return true;
}

function showRules(): string {
    return `You are going to see a map of the golf course from a top down perspective.

Made up from the following colors

${darkGreen} - Out of bounds
${fairwayGreen} - Fairway
${putGreen} - Putt Area
${bunkerSand} - Bunker
${ballColor} - Ball
${holeColor} - Hole

The goal of the game is to get the ball into the hole in the least number of strokes.

- Each time you move the ball, you will be charged a stroke.
- If you put the ball in the hole, you will be rewarded with the number of strokes it took to get there.

The hole will end when you get the ball into the hole or if you run out of moves. You will then go to the next hole.
On the last hole of the game ends you will get your final score. You can see how many holes there are on the right side while playing the game.

Have fun!
`;
}

function showMaps(): string {
    let maps = $db.f({ type: "golf_map" }).array() as MapData[];
    // Make list unique by mapId
    maps = maps.filter((value, index, self) => self.findIndex((t) => t.mapId === value.mapId) === index);

    let out = "Maps:\n";
    for (const map of maps) {
        out += `${map.mapId} - ${map.courseName}\n`;
    }

    return out;
}

function insertMap(insertData: object): returnType {
    let insertedMapData = insertData as MapData;

    if (insertedMapData.type !== "golf_map") {
        return { ok: false, msg: "Invalid map data" };
    }

    $db.us({ _id: insertedMapData._id }, insertedMapData);

    return { ok: true, msg: "Map inserted" };
}

function getSession(userName: string): Session {
    const id = gameId + "session_" + userName;

    let session = $db.f({ _id: id }).first() as unknown as Session;

    if (!session) {
        session = {
            _id: id,
            type: "golf_session",
            mapId: -1,
            holeNumber: 0,
            ballPos: { x: 0, y: 0 },
            prevBallPos: { x: 0, y: 0 },
            lastUpdate: Date.now(),
            strokeCount: 0,
            courseScores: [],
        };

        $db.i(session);
    }

    return session as Session;
}

function getMapData(): MapData | null {
    if (session.mapId == -1) {
        return null;
    }

    let foundMapData = $db
        .f({ type: "golf_map", mapId: session.mapId, holeNumber: session.holeNumber })
        .first() as MapData | null;

    if (foundMapData == null) {
        logError(
            "Could not find map with id: " +
                session.mapId +
                " and holeNumber: " +
                session.holeNumber,
        );
    }

    // Setup session if we just started
    if (session.strokeCount == -1) {
        session.strokeCount = 0;
        session.prevBallPos = foundMapData.startPoint;
        session.ballPos = foundMapData.startPoint;

        if (session.holeNumber == 0) {
            for (let i = 0; i < foundMapData.totalHoleCount; i++) {
                session.courseScores[i] = 0;
            }
        }
    }

    return foundMapData as MapData;
}

function startGame(mapId: number): void {
    session.mapId = mapId;
    session.holeNumber = 0;
    session.ballPos = { x: -1, y: -1 };
    session.lastUpdate = Date.now();
    session.strokeCount = -1;
    session.courseScores = [];

    updateDBSession();
}

function resetGame(): void {
    $db.r({ _id: session._id });
}

function updateDBSession(): void {
    $db.us({ _id: session._id }, session);
}

//#region drawing
function drawGround(): void {
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
}

function draw(): void {
    // Draw start point
    for (let i = mapData.startPoint.y - 1; i <= mapData.startPoint.y + 1; i++) {
        for (let j = mapData.startPoint.x - 1; j <= mapData.startPoint.x + 1; j++) {
            if (i >= 0 && j >= 0 && i < mapHeight && j < mapWidth) {
                map[i][j] = putGreen;
            }
        }
    }

    map[session.prevBallPos.y][session.prevBallPos.x] = prevBallColor;
    map[session.ballPos.y][session.ballPos.x] = ballColor;
    map[mapData.endPoint.y][mapData.endPoint.x] = holeColor;

    drawMap();
    drawSideBar();
}

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
    let coords = getCoordsBetweenPoints(point1, point2);
    for (const coord of coords) {
        map[coord.y][coord.x] = color;
    }
}

function getCoordsBetweenPoints(point1: Point, point2: Point): Point[] {
    const coords: Point[] = [];

    const dx = Math.abs(point2.x - point1.x);
    const dy = Math.abs(point2.y - point1.y);
    const sx = point1.x < point2.x ? 1 : -1;
    const sy = point1.y < point2.y ? 1 : -1;
    let err = (dx > dy ? dx : -dy) / 2;
    let x = point1.x;
    let y = point1.y;

    while (true) {
        coords.push({ x, y });
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

    return coords;
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
    let holeNumberText = `Hole ${(mapData.holeNumber + 1).toString().padStart(2, "0")}`;
    for (let i = 0; i < holeNumberText.length; i++) {
        drawBuffer[mapHeightOffset + 4][mapWidth + 3 + i] = holeNumberText[i];
    }

    // Draw stokes
    let strokeCountText = `Stroke: ${session.strokeCount.toString().padStart(2, "0")}`;
    for (let i = 0; i < strokeCountText.length; i++) {
        drawBuffer[mapHeightOffset + 6][mapWidth + 2 + i] = strokeCountText[i];
    }

    // Draw par
    let parText = `Par: ${mapData.par.toString().padStart(2, "0")}`;
    for (let i = 0; i < parText.length; i++) {
        drawBuffer[mapHeightOffset + 7][mapWidth + 3 + i] = parText[i];
    }

    // Draw course scores
    let scoreText = "Scores";
    for (let i = 0; i < scoreText.length; i++) {
        drawBuffer[mapHeightOffset + 9][mapWidth + 3 + i] = scoreText[i];
    }
    for (let i = 0; i < session.courseScores.length; i++) {
        let score = session.courseScores[i];
        let scoreText = `${(i + 1).toString().padStart(2, "0")} - ${score.toString().padStart(2, "0")}`;
        for (let j = 0; j < scoreText.length; j++) {
            drawBuffer[mapHeightOffset + 11 + i][mapWidth + 3 + j] = scoreText[j];
        }
    }
    // Total score
    let totalScoreText = `Total: ${session.courseScores
        .reduce((a, b) => a + b)
        .toString()
        .padStart(2, "0")}`;
    for (let i = 0; i < totalScoreText.length; i++) {
        drawBuffer[mapHeightOffset + 12 + session.courseScores.length][mapWidth + 3 + i] =
            totalScoreText[i];
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

    let startHeight = 3;
    output += "You can `Nview` the `Vrules`. Or you can reset the game with reset: true\nTake a shot with `Nangle`:`V(-360 to 360)` and `Npower`:`V(0 to 100)`\n\n";
    if (alert !== "") {
        output += alert;
        startHeight+=1;
    }

    for (let y = startHeight; y < terminalHeight; y++) {
        for (let x = 0; x < terminalWidth; x++) {
            output += drawBuffer[y][x];
        }

        output += "\n";
    }

    return output;
}
//#endregion

function logError(msg: string): void {
    throw new Error(
        msg + "\nIf you think this was a error, please report this to me with chats.tell or to @boss_sloth_inc in the hackmud discord.",
    );
}

function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
};

function distance(point1: Point, point2: Point): number {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}

function strokeToGolfTerm(): string
{
    let strokes = session.strokeCount;
    let par = mapData.par;

    if (strokes == 1) {
        return "Hole in one";
    }

    switch (strokes - par) {
        case -3:
            return "Albatross";
        case -2:
            return "Eagle";
        case -1:
            return "Birdie";
        case 0:
            return "Par";
        case 1:
            return "Bogey";
        case 2:
            return "Double Bogey";
        case 3:
            return "Triple Bogey";
        case 4:
            return "Quadruple Bogey";
        default:
            return `${strokes} strokes`;
    }
}
