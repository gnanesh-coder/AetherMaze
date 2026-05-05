#include "maze.h"

int main() {
    // Seed random number generator
    srand((unsigned int)time(NULL));

    int rows = 31;
    int cols = 31;
    Maze *maze = createMaze(rows, cols);
    if (!maze) {
        fprintf(stderr, "Error: Could not allocate memory for maze.\n");
        return 1;
    }

    initializeMaze(maze);

    // Create visited grid for generation
    int **visited_gen = createVisitedGrid(rows, cols);
    
    // Generate maze starting from (1, 1)
    generateMazeDFS(maze, 1, 1, visited_gen);
    
    // Set start and target
    Position start = {1, 1};
    Position target = {rows - 2, cols - 2};
    setStartAndTarget(maze, start.y, start.x, target.y, target.x);

    // Print the generated maze
    printMaze(maze);

    // Find all paths using DFS
    int max_paths = 10;
    PathCollection *paths = createPathCollection(max_paths);
    Position *current_path_buf = (Position*)malloc(rows * cols * sizeof(Position));
    int **visited_find = createVisitedGrid(rows, cols);

    findAllPathsDFS(maze, start, target, paths, current_path_buf, 0, visited_find);

    // Sort paths by length
    sortPathsByLength(paths->routes, paths->count);

    // Display results
    printAllPaths(paths);

    if (paths->count > 0) {
        printMazeWithPath(maze, paths->routes[0]);
    }

    // Cleanup
    freeGrid(visited_gen, rows);
    freeGrid(visited_find, rows);
    free(current_path_buf);
    freePathCollection(paths);
    freeMaze(maze);

    return 0;
}
