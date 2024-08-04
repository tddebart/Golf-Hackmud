const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
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
    startPoint: { x: 50, y: 49 },
    endPoint: { x: 39, y: 13 },
};

// Set width and height

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let clickCoords = [];

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x =
        Math.floor(((e.clientX - rect.left) * canvas.width) / rect.width / 20) *
        20;
    const y =
        Math.floor(
            ((e.clientY - rect.top) * canvas.height) / rect.height / 20,
        ) * 20;

    if (x >= 0 && x < 1800 && y >= 0 && y < 1200) {
        const color = ctx.getImageData(x, y, 1, 1).data;
        const r = color[0];
        const g = color[1];
        const b = color[2];

        ctx.fillStyle = "green";
        ctx.fillRect(x, y, 20, 20);
        ctx.fillRect(x, y, 1, 1);

        clickCoords.push({ x: x / 20, y: y / 20 });

        console.log(clickCoords);
    }
});

for (let y = 0; y < 1200; y += 20) {
    for (let x = 0; x < 1800; x += 20) {
        ctx.fillStyle = "black";
        ctx.fillRect(x, y, 20, 20);
    }
}

for (let i = 0; i < mapData.boundsCoords.length; i++) {
    ctx.fillStyle = "green";
    ctx.fillRect(
        mapData.boundsCoords[i].x * 20,
        mapData.boundsCoords[i].y * 20,
        20,
        20,
    );
}
for (let i = 0; i < mapData.putCoords.length; i++) {
    ctx.fillStyle = "lightgreen";
    ctx.fillRect(
        mapData.putCoords[i].x * 20,
        mapData.putCoords[i].y * 20,
        20,
        20,
    );
}
ctx.fillStyle = "white";
ctx.fillRect(mapData.startPoint.x * 20, mapData.startPoint.y * 20, 20, 20);
ctx.fillStyle = "red";
ctx.fillRect(mapData.endPoint.x * 20, mapData.endPoint.y * 20, 20, 20);
