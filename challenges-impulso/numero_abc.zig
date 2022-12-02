const std = @import("std");

fn charMapping(input: u8) ?[]const u8 {
    return switch (input) {
        '2' => "abc",
        '3' => "def",
        '4' => "ghi",
        '5' => "jkl",
        '6' => "mno",
        '7' => "pqrs",
        '8' => "tuv",
        '9' => "wxyz",
        else => null,
    };
}

fn combineChars(input: []const u8, allocator: std.mem.Allocator) ![]u8 {
    const len_per_item = input.len + 1;
    const total_items = blk: {
        var size: usize = 1;
        for (input) |digit| {
            size *= (charMapping(digit) orelse return error.InvalidInput).len;
        }
        break :blk size;
    };

    const output = try allocator.alloc(u8, total_items * len_per_item);
    errdefer allocator.free(output);
    for (output) |*char| char.* = 0;

    var phase = input.len;
    var initial_i: usize = 0;
    for (input) |digit| {
        const mapping = charMapping(digit).?;
        phase /= mapping.len;
        var i = initial_i;
        var phase_count: usize = 0;
        var index_digit: usize = 0;
        while (i < output.len) : (i += len_per_item) {
            output[i] = mapping[index_digit];
            phase_count += 1;
            if (phase_count >= phase) {
                phase_count = 0;
                index_digit += 1;
                if (index_digit >= mapping.len) index_digit = 0;
            }
        }
        initial_i += 1;
    }

    return output;
}

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();

    const allocator = gpa.allocator();

    const input = "789";
    const result = try combineChars(input, allocator);
    defer allocator.free(result);

    {
        var iterator = std.mem.tokenize(u8, result, "\x00");
        var i: usize = 0;
        std.debug.print("[\n  ", .{});
        while (iterator.next()) |item| {
            i += 1;
            std.debug.print("\"{s}\",", .{item});
            if (i % 3 == 0 and iterator.peek() != null) {
                std.debug.print("\n  ", .{});
            }
        }
        std.debug.print("\n]", .{});
    }

    std.debug.print("\ncount: {}", .{
        result.len / (input.len + 1),
    });
}
