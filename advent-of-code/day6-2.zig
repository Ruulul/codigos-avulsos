const std = @import("std");
const input = @embedFile("day6.txt");

fn contains(comptime T: type, slice: []const T, item: T) bool {
    return std.mem.indexOfScalar(T, slice, item) != null;
}

pub fn main() void {
    const len = 14;
    var last_char: [len]u8 = .{0} ** len;
    var counter: usize = 0;
    const i = for (input) |char, i| {
        last_char[counter] = char;
        if (!contains(u8, &last_char, 0)) {
            if (!haveRepeatedChar: {
                var _i: usize = 0;
                const end = len;
                while (_i < end) : (_i += 1) {
                    var _j: usize = 0;
                    while (_j < end) : (_j += 1) {
                        if (_i == _j) continue;
                        if (last_char[_i] == last_char[_j]) break :haveRepeatedChar true;
                    }
                }
                break :haveRepeatedChar false;
            }) break i + 1;
        }
        last_char[counter] = char;
        counter += 1;
        if (counter == len) counter = 0;
    } else null;

    std.debug.print("...{s}: {any}", .{ &last_char, i });
}
