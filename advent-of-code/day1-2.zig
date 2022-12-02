const std = @import("std");
const input = @embedFile("./day1.txt");

pub fn main() void {
    var input_lines = std.mem.split(u8, input, "\n");
    var max1: u32 = 0;
    var max2: u32 = 0;
    var max3: u32 = 0;
    var acc: u32 = 0;
    while (input_lines.next()) |line| {
        if (line.len == 0) {
            if (acc > max1) max1 = acc
            else if (acc > max2) max2 = acc
            else if (acc > max3) max3 = acc;
            acc = 0;
            continue;
        }
        acc += std.fmt.parseInt(u32, line, 0) catch unreachable;
    }
    std.debug.print("{}", .{max1 + max2 + max3});
}