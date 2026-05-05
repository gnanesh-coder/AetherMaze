#ifndef MAZE_H
#define MAZE_H

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

// Data Structures
typedef struct {
    int rows;
    int cols;
    int **grid;  // 0 = path, 1 = wall
} Maze;

typedef struct {
    int y;
    int x;
} Position;

typedef struct {
    Position *path;
    int length;
} Route;

typedef struct {
    Route *routes;
    int count;
    int capacity;
} PathCollection;

typedef struct {
    int dy;
    int dx;
} Direction;

// Maze lifecycle
Maze* createMaze(int rows, int cols);
void initializeMaze(Maze *maze);
void freeMaze(Maze *maze);
void fillWalls(Maze *maze);
void setStartAndTarget(Maze *maze, int start_y, int start_x, int target_y, int target_x);

// Maze generation
void generateMazeDFS(Maze *maze, int y, int x, int **visited);

// Visited grid management
int** createVisitedGrid(int rows, int cols);
void freeGrid(int **grid, int rows);

// Path collection management
PathCollection* createPathCollection(int initial_capacity);
void addPath(PathCollection *paths, Position *route, int length);
void freePathCollection(PathCollection *paths);

// Pathfinding
void findAllPathsDFS(Maze *maze, Position start, Position target, 
                     PathCollection *paths, Position *current_path, 
                     int path_length, int **visited);

// Sorting
void sortPathsByLength(Route *routes, int count);
int compareRoutes(const void *a, const void *b);

// Utilities
Direction getDirections(int index);
int isValidMove(Maze *maze, int y, int x);
int isWall(Maze *maze, int y, int x);
int isPositionInPath(Position *path, int length, Position pos);
void copyPath(Position *src, Position *dst, int length);

// Output
void printMaze(Maze *maze);
void printMazeWithPath(Maze *maze, Route route);
void printPath(Route route);
void printAllPaths(PathCollection *paths);

#endif // MAZE_H
