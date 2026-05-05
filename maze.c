#include "maze.h"
#include <string.h>

Maze* createMaze(int rows, int cols) {
    Maze *maze = (Maze*)malloc(sizeof(Maze));
    if (!maze) return NULL;

    maze->rows = rows;
    maze->cols = cols;
    maze->grid = (int**)malloc(rows * sizeof(int*));
    for (int i = 0; i < rows; i++) {
        maze->grid[i] = (int*)malloc(cols * sizeof(int));
    }
    return maze;
}

void initializeMaze(Maze *maze) {
    fillWalls(maze);
}

void fillWalls(Maze *maze) {
    for (int i = 0; i < maze->rows; i++) {
        for (int j = 0; j < maze->cols; j++) {
            maze->grid[i][j] = 1; // 1 = wall
        }
    }
}

void freeMaze(Maze *maze) {
    if (!maze) return;
    for (int i = 0; i < maze->rows; i++) {
        free(maze->grid[i]);
    }
    free(maze->grid);
    free(maze);
}

int** createVisitedGrid(int rows, int cols) {
    int **grid = (int**)malloc(rows * sizeof(int*));
    for (int i = 0; i < rows; i++) {
        grid[i] = (int*)calloc(cols, sizeof(int));
    }
    return grid;
}

void freeGrid(int **grid, int rows) {
    if (!grid) return;
    for (int i = 0; i < rows; i++) {
        free(grid[i]);
    }
    free(grid);
}

Direction getDirections(int index) {
    Direction dirs[] = {
        {-1, 0}, // Up
        {1, 0},  // Down
        {0, -1}, // Left
        {0, 1}   // Right
    };
    if (index >= 0 && index < 4) return dirs[index];
    return (Direction){0, 0};
}

void generateMazeDFS(Maze *maze, int y, int x, int **visited) {
    visited[y][x] = 1;
    maze->grid[y][x] = 0; // Mark as path

    int indices[] = {0, 1, 2, 3};
    // Shuffle indices for random direction selection
    for (int i = 0; i < 4; i++) {
        int r = rand() % 4;
        int temp = indices[i];
        indices[i] = indices[r];
        indices[r] = temp;
    }

    for (int i = 0; i < 4; i++) {
        Direction dir = getDirections(indices[i]);
        int ny = y + dir.dy * 2;
        int nx = x + dir.dx * 2;

        if (ny > 0 && ny < maze->rows - 1 && nx > 0 && nx < maze->cols - 1) {
            if (!visited[ny][nx]) {
                // Carve path between (y,x) and (ny,nx)
                maze->grid[y + dir.dy][x + dir.dx] = 0;
                generateMazeDFS(maze, ny, nx, visited);
            }
        }
    }
}

void setStartAndTarget(Maze *maze, int start_y, int start_x, int target_y, int target_x) {
    // Ensure start and target are paths
    maze->grid[start_y][start_x] = 0;
    maze->grid[target_y][target_x] = 0;
}

int isValidMove(Maze *maze, int y, int x) {
    return (y >= 0 && y < maze->rows && x >= 0 && x < maze->cols && maze->grid[y][x] == 0);
}

int isWall(Maze *maze, int y, int x) {
    return (y < 0 || y >= maze->rows || x < 0 || x >= maze->cols || maze->grid[y][x] == 1);
}

void printMaze(Maze *maze) {
    printf("Maze (%dx%d):\n", maze->rows, maze->cols);
    for (int i = 0; i < maze->rows; i++) {
        for (int j = 0; j < maze->cols; j++) {
            if (maze->grid[i][j] == 1) {
                printf("\u2588\u2588"); // Wall (full block)
            } else {
                printf("  "); // Path
            }
        }
        printf("\n");
    }
}

void printMazeWithPath(Maze *maze, Route route) {
    printf("\nMaze with Shortest Path:\n");
    for (int i = 0; i < maze->rows; i++) {
        for (int j = 0; j < maze->cols; j++) {
            Position pos = {i, j};
            if (isPositionInPath(route.path, route.length, pos)) {
                printf("\u2592\u2592"); // Path marker (medium shade)
            } else if (maze->grid[i][j] == 1) {
                printf("\u2588\u2588"); // Wall (full block)
            } else {
                printf("  "); // Path
            }
        }
        printf("\n");
    }
}
