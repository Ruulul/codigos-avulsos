const std = @import("std");
const input = @embedFile("day2.txt");

const Shape = enum(u32) {
    rock = 1,
    paper = 2,
    scissors = 3,
};
const Outcome = enum(u32) {
    lost = 0,
    draw = 3,
    victory = 6,
};

fn result(a: Shape, b: Shape) Outcome {
    return switch (@enumToInt(a) * 10 + @enumToInt(b)) {
        11, 22, 33 => .draw,
        13, 21, 32 => .victory,
        31, 12, 23 => .lost,
        else => unreachable,
    };
}

pub fn main() void {
    var points: u32 = 0;
    var lines = std.mem.tokenize(u8, input, "\n");
    while (lines.next()) |line| {
        var codes = std.mem.tokenize(u8, line, " ");
        const opponent_move_string = codes.next().?;
        const player_move_string = codes.next().?;
        const player_shape: Shape = switch (player_move_string[0]) {
            'X' => .rock,
            'Y' => .paper,
            'Z' => .scissors,
            else => unreachable,
        };
        const opponent_shape: Shape = switch (opponent_move_string[0]) {
            'A' => .rock,
            'B' => .paper,
            'C' => .scissors,
            else => unreachable,
        };
        points += @enumToInt(player_shape) + @enumToInt(result(player_shape, opponent_shape));
    }
    std.debug.print("{}", .{points});
}
