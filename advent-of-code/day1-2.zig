const std = @import("std");
const input = @embedFile("./day1.txt");

pub fn main() void {
    var input_lines = std.mem.split(u8, input, "\n");
    const n = 3;
    var maxs: [n]u32 = .{0}**n;
    var total:u32 = 0;
    var acc: u32 = 0;
    while (input_lines.next()) |line| {
        if (line.len == 0) {
            for (maxs) |*max| {
                if (acc > max.*) {
                    max.* = acc;
                    break;
                }
            }
            acc = 0;
            continue;
        }
        acc += std.fmt.parseInt(u32, line, 0) catch unreachable;
    }
    for (maxs) |max| total += max;
    std.debug.print("{}", .{total});
}