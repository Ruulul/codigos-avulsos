const std = @import("std");
const input = @embedFile("day3.txt");

inline fn getPriority(char: u8) u8 {
    return switch(char) {
        'a'...'z' => |c| c - 'a' + 1,
        'A'...'Z' => |c| c - 'A' + 27,
        else => unreachable,
    };
}

pub fn main() void {
    var lines = std.mem.tokenize(u8, input, "\n");

    var acc: u32 = 0; 
    main_loop: while (lines.next()) |line1| {
        const line2 = lines.next().?;
        const line3 = lines.next().?;

            const max_expected_len = 50;
            const len = std.mem.max(usize, &.{line1.len, line2.len, line3.len});

        var common = std.BoundedArray(?u8, max_expected_len).init(len) catch |err| {
            std.log.debug("Error on creation of bounded array with len {}: {s}", .{line1.len, @errorName(err)});
            return;
        };
        const c_slice = common.slice();
        var c_idx: usize = 0;

        main_for: for (line1) |c1| {
            for (line2) |c2| {
                if (c1 == c2) {
                    c_slice[c_idx] = c1;
                    c_idx += 1;
                    continue :main_for;
                }
            }
        }

        c_idx = 0;
        while (c_slice[c_idx]) |c| : (c_idx += 1) {
            for (line3) |char| {
                if (c == char) {
                    acc += getPriority(char);
                    continue :main_loop;
                }
            }
        } else unreachable; 
    }

    std.debug.print("{}", .{acc});
}