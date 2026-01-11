import * as ROT from 'rot-js';

export class MapGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.rooms = [];
    }

    generate() {
        // 1. Initialize grid with Walls (1) - Note: In ROT.js, we usually dig out 0 (floor) from 1 (wall) or vice versa.
        // Let's stick to our convention: 0=Nothing/Wall, 1=Floor
        // But ROT.js Digger creates walls as 1 and floors as 0 usually? No, let's see.
        // ROT.Map.Digger callback: (x, y, value) -> value is 1 for wall, 0 for floor.

        // Initialize simple 2D array
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = 1; // Default to Wall (assuming we will map 1 to Wall later)
            }
        }

        // 2. Use ROT.js Digger
        // width, height, options
        const digger = new ROT.Map.Digger(this.width, this.height, {
            roomWidth: [6, 12], // Min/Max room width
            roomHeight: [6, 12], // Min/Max room height
            corridorLength: [3, 10], // Corridor length
            dugPercentage: 0.4 // Stop after 40% of map is floor
        });

        // 3. Create callback to populate our grid
        // value: 0 for floor, 1 for wall
        digger.create((x, y, value) => {
            if (value === 0) {
                this.grid[y][x] = 0; // Floor
            } else {
                this.grid[y][x] = 1; // Wall
            }
        });

        // 4. Get Rooms
        const rooms = digger.getRooms();
        this.rooms = rooms.map(room => ({
            x: room.getLeft(),
            y: room.getTop(),
            w: room.getRight() - room.getLeft() + 1,
            h: room.getBottom() - room.getTop() + 1,
            centerX: room.getCenter()[0],
            centerY: room.getCenter()[1]
        }));

        // Connect rooms with doors? ROT.js makes corridors but not explicit doors always.
        // Also Digger guarantees connectivity.

        // 5. Convert to our GameScene format: 
        // We used: 2=Wall, 1=Floor in previous generator.
        // Let's map ROT(0=Floor, 1=Wall) to Our(1=Floor, 2=Wall).

        const outputGrid = [];
        for (let y = 0; y < this.height; y++) {
            outputGrid[y] = [];
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === 0) { // Floor
                    outputGrid[y][x] = 1;
                } else { // Wall
                    outputGrid[y][x] = 2;
                }
            }
        }

        return {
            grid: outputGrid,
            rooms: this.rooms
        };
    }
}
