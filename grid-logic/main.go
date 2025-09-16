package main

import (
    "encoding/json"
    "fmt"
    "syscall/js"
)

// Grid represents the state of the pixel grid.
var Grid [][]string

// main function sets up the JS callbacks.
func main() {
    c := make(chan struct{}, 0)
    fmt.Println("Go Wasm Initialized")

    js.Global().Set("initGrid", js.FuncOf(initGrid))
    js.Global().Set("applyLine", js.FuncOf(applyLine))
    js.Global().Set("applyGradient", js.FuncOf(applyGradient))
    js.Global().Set("applyBucket", js.FuncOf(applyBucket))

    <-c
}

// initGrid initializes the grid with a given size and color.
func initGrid(this js.Value, args []js.Value) interface{} {
    size := args[0].Int()
    color := args[1].String()
    Grid = make([][]string, size)
    for i := range Grid {
        Grid[i] = make([]string, size)
        for j := range Grid[i] {
            Grid[i][j] = color
        }
    }
    return nil
}

// applyLine applies the line tool to the grid.
func applyLine(this js.Value, args []js.Value) interface{} {
    x0, y0 := args[0].Int(), args[1].Int()
    x1, y1 := args[2].Int(), args[3].Int()
    color := args[4].String()

    // Bresenham's line algorithm
    dx := abs(x1 - x0)
    dy := -abs(y1 - y0)
    sx := -1
    if x0 < x1 {
        sx = 1
    }
    sy := -1
    if y0 < y1 {
        sy = 1
    }
    err := dx + dy

    for {
        if x0 >= 0 && x0 < len(Grid) && y0 >= 0 && y0 < len(Grid[0])) {
            Grid[y0][x0] = color
        }
        if x0 == x1 && y0 == y1 {
            break
        }
        e2 := 2 * err
        if e2 >= dy {
            err += dy
            x0 += sx
        }
        if e2 <= dx {
            err += dx
            y0 += sy
        }
    }

    return serializeGrid()
}

// applyGradient applies the gradient tool to the grid.
func applyGradient(this js.Value, args []js.Value) interface{} {
    // ... (gradient logic to be implemented)
    return serializeGrid()
}

// applyBucket applies the bucket fill tool to the grid.
func applyBucket(this js.Value, args []js.Value) interface{} {
    // ... (bucket logic to be implemented)
    return serializeGrid()
}

// abs returns the absolute value of an integer.
func abs(x int) int {
    if x < 0 {
        return -x
    }
    return x
}

// serializeGrid converts the grid to a JSON string.
func serializeGrid() string {
    gridJSON, err := json.Marshal(Grid)
    if err != nil {
        return "[]"
    }
    return string(gridJSON)
}
