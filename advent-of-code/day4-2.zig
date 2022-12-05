const std = @import("std");
const input = @embedFile("day4.txt");

pub fn main() void {
    var lines = std.mem.tokenize(u8, input, "\n");
    
    var acc: u32 = 0;
    while (lines.next()) |line| {
        var pairs = std.mem.tokenize(u8, line, "-,");
        const pair1 = [_]u32{
            std.fmt.parseInt(u32, pairs.next().?, 0) catch unreachable, 
            std.fmt.parseInt(u32, pairs.next().?, 0) catch unreachable,
        };
        const pair2 = [_]u32{
            std.fmt.parseInt(u32, pairs.next().?, 0) catch unreachable, 
            std.fmt.parseInt(u32, pairs.next().?, 0) catch unreachable,
        };

        if (
            pair1[0] >= pair2[1] and pair1[1] <= pair2[0]
        or  pair1[0] <= pair2[1] and pair1[1] >= pair2[0]
        ) acc += 1;
    }

    std.debug.print("{}", .{acc});
}