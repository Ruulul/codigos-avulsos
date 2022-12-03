const std = @import("std");
const input = @embedFile("day3.txt");

inline fn getPriority(char: u8) u8 {
    return switch (char) {
        'a'...'z' => |c| c - 'a' + 1,
        'A'...'Z' => |c| c - 'A' + 27,
        else => unreachable,
    };
}

pub fn main() void {
    var lines = std.mem.tokenize(u8, input, "\n");

    var acc: u32 = 0;
    main_loop: while (lines.next()) |line| {
        std.debug.assert(line.len % 2 == 0);
        const len = line.len / 2;
        const half1 = line[0..len];
        const half2 = line[len..];

        for (half1) |c1| {
            for (half2) |c2| {
                if (c1 == c2) {
                    acc += getPriority(c1);
                    continue :main_loop;
                }
            }
        } else unreachable;
    }

    std.debug.print("{}", .{acc});
}
