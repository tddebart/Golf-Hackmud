type MapData = {
    boundsCoords: Point[];
    putCoords: Point[];
    bunkerCoords: Point[][];
    startPoint: Point;
    endPoint: Point;
};

type Point = {
    x: number;
    y: number;
};

const putGreen = "`M▓`";
const fairwayGreen = "`L▓`";
const bunkerSand = "`I▒`";
const darkGreen = "`l░`";
const ballColor = "`R▓`";
const holeColor = "`X▓`";

const width = 90;
const height = 60;
const map = [];
const mapData = {
    boundsCoords: [
        { x: 37, y: 52 },
        { x: 34, y: 27 },
        { x: 28, y: 16 },
        { x: 28, y: 9 },
        { x: 46, y: 4 },
        { x: 61, y: 8 },
        { x: 59, y: 23 },
        { x: 56, y: 52 },
    ],
    putCoords: [
        { x: 38, y: 9 },
        { x: 34, y: 13 },
        { x: 39, y: 18 },
        { x: 45, y: 13 },
    ],
    bunkerCoords: [
        [
            { x: 35, y: 41 },
            { x: 35, y: 36 },
            { x: 58, y: 34 },
            { x: 57, y: 40 },
        ],
        [
            { x: 36, y: 22 },
            { x: 44, y: 18 },
            { x: 46, y: 21 },
            { x: 44, y: 25 },
            { x: 38, y: 27 },
        ]
    ],
    startPoint: { x: 50, y: 49 },
    endPoint: { x: 39, y: 13 },
} as MapData;

export default (context: Context, args?: any): string => {
    for (let y = 0; y < height; y++) {
        map[y] = [];
        for (let x = 0; x < width; x++) {
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

    return drawMap();
};

function fillCoords(coords: Point[], color: string): void {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
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
                ((coords[j].x - coords[i].x) * (y - coords[i].y)) /
                    (coords[j].y - coords[i].y) +
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

function drawMap(): string {
    let output = "";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            output += map[y][x];
        }
        output += "\n";
    }

    return output;
}
