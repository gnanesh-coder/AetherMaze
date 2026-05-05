#include "maze.h"
#include <string.h>

PathCollection* createPathCollection(int initial_capacity) {
    PathCollection *pc = (PathCollection*)malloc(sizeof(PathCollection));
    pc->capacity = initial_capacity;
    pc->count = 0;
    pc->routes = (Route*)malloc(pc->capacity * sizeof(Route));
    return pc;
}

void addPath(PathCollection *paths, Position *route, int length) {
    if (paths->count >= paths->capacity) return;

    paths->routes[paths->count].length = length;
    paths->routes[paths->count].path = (Position*)malloc(length * sizeof(Position));
    memcpy(paths->routes[paths->count].path, route, length * sizeof(Position));
    paths->count++;
}

void freePathCollection(PathCollection *paths) {
    if (!paths) return;
    for (int i = 0; i < paths->count; i++) {
        free(paths->routes[i].path);
    }
    free(paths->routes);
    free(paths);
}

void findAllPathsDFS(Maze *maze, Position start, Position target, 
                     PathCollection *paths, Position *current_path, 
                     int path_length, int **visited) {
    
    // Check if we reached the limit
    if (paths->count >= paths->capacity) return;

    // Add current position to path
    current_path[path_length] = start;
    path_length++;

    // Check if we reached the target
    if (start.y == target.y && start.x == target.x) {
        addPath(paths, current_path, path_length);
        return;
    }

    // Mark as visited
    visited[start.y][start.x] = 1;

    // Explore 4 directions
    for (int i = 0; i < 4; i++) {
        Direction dir = getDirections(i);
        Position next = {start.y + dir.dy, start.x + dir.dx};

        if (isValidMove(maze, next.y, next.x) && !visited[next.y][next.x]) {
            findAllPathsDFS(maze, next, target, paths, current_path, path_length, visited);
            
            // Early exit if limit reached
            if (paths->count >= paths->capacity) break;
        }
    }

    // Backtrack: unmark visited
    visited[start.y][start.x] = 0;
}

int compareRoutes(const void *a, const void *b) {
    Route *r1 = (Route*)a;
    Route *r2 = (Route*)b;
    return r1->length - r2->length;
}

void sortPathsByLength(Route *routes, int count) {
    qsort(routes, count, sizeof(Route), compareRoutes);
}

void copyPath(Position *src, Position *dst, int length) {
    memcpy(dst, src, length * sizeof(Position));
}

int isPositionInPath(Position *path, int length, Position pos) {
    for (int i = 0; i < length; i++) {
        if (path[i].y == pos.y && path[i].x == pos.x) return 1;
    }
    return 0;
}

void printPath(Route route) {
    printf("Steps: %d\n", route.length);
    for (int i = 0; i < route.length; i++) {
        printf("(%d,%d)%s", route.path[i].y, route.path[i].x, (i == route.length - 1) ? "" : " -> ");
    }
    printf("\n");
}

void printAllPaths(PathCollection *paths) {
    printf("\nFound %d possible paths:\n", paths->count);
    if (paths->count == 0) {
        printf("No paths found.\n");
        return;
    }

    int shortest = paths->routes[0].length;
    for (int i = 0; i < paths->count; i++) {
        printf("Route %d%s: %d steps", i + 1, (i == 0) ? " (SHORTEST)" : "", paths->routes[i].length);
        if (i > 0) {
            printf(" (+%d)", paths->routes[i].length - shortest);
        }
        if (i == 0) printf(" \u2713"); // Checkmark
        printf("\n");
    }
}
