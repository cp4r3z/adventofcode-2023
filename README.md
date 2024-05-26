# Advent of Code 2023
https://adventofcode.com/2023

[![Build Status](https://github.com/cp4r3z/adventofcode-2023/actions/workflows/node.js.yml/badge.svg)](https://github.com/cp4r3z/adventofcode-2023/actions)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/cp4r3z/adventofcode-2023/main/LICENSE)

# Notables

## Day 5
Brute force solution found on the day, but a performant solution took... a long time.
Involves Intervals, for which a common module was built with unit tests.
The solution involves an "Intersection of **Intervals**" into a tree-LIKE graph, and then traversing for a min value.

## Day 11
**Grid2D** with Manhattan distances. The main difficulty was debugging the "universe expansion" OBO errors.

## Day 12
Combinations problem solved using dynamic programming, caching / memoizing results. Unfortunately Part 2 took something like 7.5 minutes, mostly due to input 850 (all ?s) It would be good to revisit.

## Day 16
**Grid2D** with some custom logic for elements. Used an abstract class for the shared logic. Part 2 solution ran a bit slow for the real input.

## Day 17
Implemented A* algorithm to pathfind through a multi-dimensional grid. This was extremely slow for the real input.

## Day 18
Part 1 can be solved by flooding the interior of a 2D Grid. Part 2 is more difficult. Modeled the trench as a rectilinear polygon defined by a linked list of points. Used a generator function to define the iterator for the list, and then did a *very* simplified shoelace algorithm to get the area. The real shoelace algorithm involves matrix determinants and might be fun to revisit.

# Setup

## Building

```
npm install -g typescript
```

**Ctrl+Shift+B**, tsc: build or tsc: watch

https://code.visualstudio.com/docs/typescript/typescript-compiling

## Running Unit Tests

*All Tests*
```shell
npm test
```
*Specific Day's Tests*
```shell
npm test 01
```
## Debugging

In VSCode, enable "Auto Attach" and run the script with the --inspect flag.

https://code.visualstudio.com/docs/nodejs/nodejs-debugging

### npm run test (node-terminal)

The `launch.json` file is setup so you can run/debug the unit test of *the currently open* .ts file by simply hitting F5. 

* If you hit F5 from a top-level file (like this one!) all unit tests will be run.
* You'll have to hit Shift+F5 to stop the debugger and clear the terminal.
