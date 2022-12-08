const std = @import("std");
const inputs = [_][]const u8{ "alareviverarara", "ghiabcdefhelloadamhelloabcdefghi" };

fn isPalindrome(string: []const u8) bool {
    const end = string.len / 2;
    var i: usize = 0;
    return while (i < end) : (i += 1) {
        if (string[i] != string[string.len - i - 1]) break false;
    } else true;
}

fn bruteForce(string: []const u8) []const u8 {
    var index: usize = 0;
    var size: usize = 0;

    for (string) |_, start| {
        for (string[start..]) |_, len| {
            if (len <= size) continue;
            if (isPalindrome(string[start..][0..len]) and len > size) {
                size = len;
                index = start;
            }
        }
    }

    return string[index..][0..size];
}

fn dynamicApproach(string: []const u8) []const u8 {
    var index: usize = 0;
    var size: usize = 0;

    for (string) |char, i| {
        var low = if (i == 0) 0 else i - 1;
        var high = if (i == string.len - 1) i else i + 1;

        while (high < string.len and string[high] == char) high += 1;
        while (low > 0 and string[low] == char) low -= 1;
        while (low > 0 and high < string.len and string[low] == string[high]) {
            low -= 1;
            high += 1;
        }

        const len = high - low - 1;
        if (len > size) {
            size = len;
            index = low + 1;
        }
    }

    return string[index..][0..size];
}

fn manacherAlgo(string: []const u8) []const u8 {
    const max_expected_len = 50;
    const positions = string.len * 2 + 1;

    var length_per_position = try std.BoundedArray(u8, max_expected_len).init(positions);
    _ = length_per_position;
    return string;
}

fn runNTimes(comptime n: comptime_int, timer: *std.time.Timer, func: anytype, args: anytype) u64 {
    var acc: u64 = 0;
    var i: std.math.IntFittingRange(0, n) = 0;

    while (i < n) : (i += 1) {
        timer.reset();
        _ = @call(.{}, func, args);
        acc += timer.read();
    }

    return acc / n;
}

pub fn main() !void {
    var timer = try std.time.Timer.start();
    const n = 1_000_000;

    for (inputs) |input| {
        std.log.debug("input: {s}", .{input});
        std.log.debug("testing brute force:", .{});
        std.log.debug("average execution time ({} iterations): {}ms. result: {s}", .{
            n,
            runNTimes(n, &timer, bruteForce, .{input}),
            bruteForce(input),
        });

        std.log.debug("testing dynamic approach:", .{});
        std.log.debug("average execution time ({} iterations): {}ms. result: {s}", .{
            n,
            runNTimes(n, &timer, dynamicApproach, .{input}),
            dynamicApproach(input),
        });
    }
}