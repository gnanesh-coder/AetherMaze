/**
 * Aether Maze - Core Logic
 * Implements Maze Generation, Pathfinding, and Interactive UI
 */

class MazeVisualizer {
    constructor() {
        this.canvas = document.getElementById('maze-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.btnGenerate = document.getElementById('btn-generate');
        this.btnSolveAll = document.getElementById('btn-solve-all');
        this.btnSolveShortest = document.getElementById('btn-solve-shortest');
        this.btnReset = document.getElementById('btn-reset');
        this.btnMinimize = document.getElementById('btn-minimize');
        this.btnMaximize = document.getElementById('btn-maximize');
        this.btnClose = document.getElementById('btn-close');
        this.speedSlider = document.getElementById('speed-slider');
        this.sizeSlider = document.getElementById('size-slider');
        this.statVisited = document.getElementById('stat-visited');
        this.statLength = document.getElementById('stat-length');

        // State
        this.rows = parseInt(this.sizeSlider.value);
        this.cols = parseInt(this.sizeSlider.value);
        this.grid = [];
        this.cellSize = 0;
        this.isAnimating = false;
        this.stopFlag = false;

        // Interaction State
        this.isDraggingStart = false;
        this.isDraggingEnd = false;
        this.isDrawingWalls = false;

        // Start/End Positions
        this.start = { r: 1, c: 1 };
        this.end = { r: this.rows - 2, c: this.cols - 2 };

        this.init();
        this.addEventListeners();
    }

    init() {
        this.rows = parseInt(this.sizeSlider.value);
        this.cols = parseInt(this.sizeSlider.value);

        // Reset markers if size changed
        this.start = { r: 1, c: 1 };
        this.end = { r: this.rows - 2, c: this.cols - 2 };

        // Adjust canvas size to avoid overlap and account for title bar
        const containerSize = Math.min(window.innerWidth - 420, window.innerHeight - 150);
        this.cellSize = Math.floor(containerSize / this.rows);
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;

        // Initialize grid: 1 = wall, 0 = path
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(1));
        this.draw();
    }

    addEventListeners() {
        this.btnGenerate.onclick = () => this.generateMaze();
        this.btnSolveAll.onclick = () => this.findAllPaths();
        this.btnSolveShortest.onclick = () => this.findShortestPath();
        this.btnReset.onclick = () => {
            this.stopFlag = true;
            this.init();
        };

        // Window controls (only active in Electron)
        if (this.btnMinimize) {
            this.btnMinimize.onclick = () => window.electron?.minimize();
            this.btnMaximize.onclick = () => window.electron?.maximize();
            this.btnClose.onclick = () => window.electron?.close();
        }
        this.sizeSlider.oninput = () => this.init();

        // Mouse events
        this.canvas.onmousedown = (e) => this.handleMouseDown(e);
        this.canvas.onmousemove = (e) => this.handleMouseMove(e);
        window.onmouseup = () => {
            this.isDraggingStart = false;
            this.isDraggingEnd = false;
            this.isDrawingWalls = false;
        };
    }

    handleMouseDown(e) {
        if (this.isAnimating) return;
        const { r, c } = this.getCoords(e);

        if (r === this.start.r && c === this.start.c) {
            this.isDraggingStart = true;
        } else if (r === this.end.r && c === this.end.c) {
            this.isDraggingEnd = true;
        } else {
            this.isDrawingWalls = true;
            this.toggleWall(r, c);
        }
    }

    handleMouseMove(e) {
        if (this.isAnimating) return;
        const { r, c } = this.getCoords(e);
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;

        if (this.isDraggingStart) {
            if (this.grid[r][c] === 0 && !(r === this.end.r && c === this.end.c)) {
                this.start = { r, c };
                this.draw();
            }
        } else if (this.isDraggingEnd) {
            if (this.grid[r][c] === 0 && !(r === this.start.r && c === this.start.c)) {
                this.end = { r, c };
                this.draw();
            }
        } else if (this.isDrawingWalls) {
            this.toggleWall(r, c, true); // True means only set to wall if dragging
        }
    }

    getCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        return {
            c: Math.floor(x / this.cellSize),
            r: Math.floor(y / this.cellSize)
        };
    }

    toggleWall(r, c, onlyAdd = false) {
        if (r > 0 && r < this.rows - 1 && c > 0 && c < this.cols - 1) {
            if ((r === this.start.r && c === this.start.c) || (r === this.end.r && c === this.end.c)) return;

            if (onlyAdd) {
                this.grid[r][c] = 1;
            } else {
                this.grid[r][c] = this.grid[r][c] === 1 ? 0 : 1;
            }
            this.drawCell(r, c);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = '#121212';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw blueprint grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
        }
        for (let j = 0; j <= this.cols; j++) {
            this.ctx.moveTo(j * this.cellSize, 0);
            this.ctx.lineTo(j * this.cellSize, this.canvas.height);
        }
        this.ctx.stroke();

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === 1 || (r === this.start.r && c === this.start.c) || (r === this.end.r && c === this.end.c)) {
                    this.drawCell(r, c);
                }
            }
        }
    }

    drawCell(r, c, color = null) {
        const val = this.grid[r][c];
        if (color) {
            this.ctx.fillStyle = color;
        } else if (r === this.start.r && c === this.start.c) {
            this.ctx.fillStyle = '#9c27b0';
        } else if (r === this.end.r && c === this.end.c) {
            this.ctx.fillStyle = '#f44336';
        } else {
            this.ctx.fillStyle = val === 1 ? '#ffffff' : '#121212';
        }

        this.ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);

        if ((r === this.start.r && c === this.start.c) || (r === this.end.r && c === this.end.c)) {
            this.ctx.beginPath();
            this.ctx.arc(c * this.cellSize + this.cellSize / 2, r * this.cellSize + this.cellSize / 2, this.cellSize * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
    }

    sleep() {
        const speedValue = parseInt(this.speedSlider.value);
        if (speedValue >= 100) return Promise.resolve(); // Instant at max speed
        const speed = 101 - speedValue;
        return new Promise(resolve => setTimeout(resolve, speed));
    }

    async generateMaze() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.stopFlag = false;

        this.init();
        const visited = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        await this.recursiveBacktrack(1, 1, visited);

        this.isAnimating = false;
        this.draw();
    }

    async recursiveBacktrack(r, c, visited) {
        if (this.stopFlag) return;
        visited[r][c] = true;
        this.grid[r][c] = 0;
        this.drawCell(r, c);

        const dirs = [
            { dr: -2, dc: 0, mr: -1, mc: 0 },
            { dr: 2, dc: 0, mr: 1, mc: 0 },
            { dr: 0, dc: -2, mr: 0, mc: -1 },
            { dr: 0, dc: 2, mr: 0, mc: 1 }
        ].sort(() => Math.random() - 0.5);

        for (const dir of dirs) {
            const nr = r + dir.dr;
            const nc = c + dir.dc;
            if (nr > 0 && nr < this.rows - 1 && nc > 0 && nc < this.cols - 1 && !visited[nr][nc]) {
                this.grid[r + dir.mr][c + dir.mc] = 0;
                this.drawCell(r + dir.mr, c + dir.mc);
                await this.sleep();
                await this.recursiveBacktrack(nr, nc, visited);
            }
        }
    }

    async findAllPaths() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.stopFlag = false;
        this.draw(); // Clear previous paths

        const visited = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        const allPaths = [];
        let nodesVisited = 0;

        await this.dfsAllPaths(this.start.r, this.start.c, visited, [], allPaths, () => {
            nodesVisited++;
            this.statVisited.innerText = nodesVisited;
        });

        this.isAnimating = false;
        this.statLength.innerText = allPaths.length > 0 ? allPaths[0].length : 0;
    }

    async dfsAllPaths(r, c, visited, currentPath, allPaths, onVisit, limit = 15) {
        if (this.stopFlag || allPaths.length >= limit) return; // Cap for performance
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols || this.grid[r][c] === 1 || visited[r][c]) return;

        visited[r][c] = true;
        currentPath.push({ r, c });
        onVisit();

        if (r === this.end.r && c === this.end.c) {
            const pathIndex = allPaths.length;
            allPaths.push([...currentPath]);
            const hue = (pathIndex * 137.5) % 360;
            const pathColor = `hsla(${hue}, 80%, 60%, 0.8)`;
            this.drawPath(currentPath, pathColor);
            await this.sleep();
        } else {
            if (!(r === this.start.r && c === this.start.c)) {
                this.drawCell(r, c, 'rgba(255, 255, 255, 0.05)');
            }
            await this.sleep();

            const dirs = [{ dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: -1, dc: 0 }];
            for (const dir of dirs) {
                await this.dfsAllPaths(r + dir.dr, c + dir.dc, visited, currentPath, allPaths, onVisit, limit);
            }
        }

        currentPath.pop();
        visited[r][c] = false;
    }

    async findShortestPath() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.stopFlag = false;
        this.draw();

        const queue = [{ r: this.start.r, c: this.start.c, path: [] }];
        const visited = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        visited[this.start.r][this.start.c] = true;

        let foundPath = null;
        let nodesVisited = 0;

        while (queue.length > 0 && !this.stopFlag) {
            const { r, c, path } = queue.shift();
            nodesVisited++;
            this.statVisited.innerText = nodesVisited;

            const currentPath = [...path, { r, c }];

            if (r === this.end.r && c === this.end.c) {
                foundPath = currentPath;
                break;
            }

            if (!(r === this.start.r && c === this.start.c)) {
                this.drawCell(r, c, 'rgba(0, 200, 83, 0.2)');
            }
            if (nodesVisited % 5 === 0) await this.sleep(); // Animation speed

            const dirs = [{ dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: -1, dc: 0 }];
            for (const dir of dirs) {
                const nr = r + dir.dr;
                const nc = c + dir.dc;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.grid[nr][nc] === 0 && !visited[nr][nc]) {
                    visited[nr][nc] = true;
                    queue.push({ r: nr, c: nc, path: currentPath });
                }
            }
        }

        if (foundPath) {
            this.drawPath(foundPath, '#00c853');
            this.statLength.innerText = foundPath.length;
        }
        this.isAnimating = false;
    }

    drawPath(path, color) {
        for (const pos of path) {
            if ((pos.r === this.start.r && pos.c === this.start.c) || (pos.r === this.end.r && pos.c === this.end.c)) continue;
            this.drawCell(pos.r, pos.c, color);
        }
    }
}

window.onload = () => new MazeVisualizer();
