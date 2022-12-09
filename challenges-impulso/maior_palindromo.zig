const std = @import("std");
const inputs = [_][]const u8{ 
    "alareviverarara", 
    "ghiabcdefhelloadamhelloabcdefghi",
    "123476497456821389372891381947384372846372843289436289432849362489236438294863294628394368294832946832948294239468329483293432981234567898765432164378246738146783164371864378126437814637186413782",
};

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
    const max_expected_len = 200 * 2 + 1;
    const positions = string.len * 2 + 1;

    std.debug.assert(positions <= max_expected_len);
    var length_per_position = std.BoundedArray(u8, max_expected_len).init(positions) catch unreachable;
    const p = length_per_position.slice();
    for (p) |*c| c.* = 0;
    const getIndex = struct { inline fn f(n: usize) usize { return n / 2; } }.f;
    var max_len: usize = 0;
    var start: usize = 0;
    var max_right: usize = 0;
    var center: usize = 0;

    for (p) |*l, i| {
        if (i < max_right) l.* = std.math.min(max_right - i, p[2 * center - i]);
        while (i > l.* and l.* < positions - 1 - i and string[getIndex(i + l.* - 1)] == string[getIndex(i - l.*)]) l.* += 1;
        if (i + l.* > max_right) {
            center = i;
            max_right = i + l.*;
        }
        if (l.* > max_len) {
            start = if (l.* + 1 > i) 0 else (i - l.*)/2 + 1;
            max_len = l.*;
        }
    }
    return string[start..][0..max_len - 1];
}

fn manacherAlloc(allocator: std.mem.Allocator, string: []const u8) []const u8 {
    const positions = string.len * 2 + 1;
    var p = allocator.alloc(u8, positions) catch |err| std.debug.panic("Allocation error! {s}", .{@errorName(err)});
    defer allocator.free(p);
    for (p) |*c| c.* = 0;
    const getIndex = struct { inline fn f(n: usize) usize { return n / 2; } }.f;
    var max_len: usize = 0;
    var start: usize = 0;
    var max_right: usize = 0;
    var center: usize = 0;

    for (p) |_, i| {
        if (i < max_right) p[i] = std.math.min(max_right - i, p[2 * center - i]);
        while (i > p[i] and p[i] < positions - 1 - i and string[getIndex(i + p[i] - 1)] == string[getIndex(i - p[i])]) p[i] += 1;
        if (i + p[i] > max_right) {
            center = i;
            max_right = i + p[i];
        }
        if (p[i] > max_len) {
            start = if (p[i] + 1 > i) 0 else (i - p[i])/2 + 1;
            max_len = p[i];
        }
    }
    return string[start..][0..max_len - 1];
}
const Measure = enum(u64) {
    _,
    pub fn format (value: Measure, comptime fmt: []const u8, options: std.fmt.FormatOptions, writer: anytype) !void {
        _ = fmt;
        var buffer: [50]u8 = undefined;
        const digits = std.fmt.bufPrintIntToSlice(&buffer, @enumToInt(value), 10, .lower, options);
        const index_decimal_point = digits.len -| 3;
        for (digits[0..index_decimal_point]) |digit| try writer.writeByte(digit);
        try writer.writeByte('.');
        for (digits[index_decimal_point..]) |digit| try writer.writeByte(digit);
        try writer.writeAll("ms");
    }
};
fn runNTimes(comptime n: comptime_int, timer: *std.time.Timer, func: anytype, args: anytype) Measure {
    var acc: u64 = 0;
    var i: std.math.IntFittingRange(0, n) = 0;

    while (i < n) : (i += 1) {
        timer.reset();
        _ = @call(.{}, func, args);
        acc += timer.read();
    }

    return @intToEnum(Measure, acc / n);
}

pub fn main() !void {
    var timer = try std.time.Timer.start();
    const n = 10_000;

    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    for (inputs) |input| {
        std.log.debug("input: {s}", .{input});
        std.log.debug("testing brute force:", .{});
        std.log.debug("average execution time ({} iterations): {}. result: {s}", .{
            n,
            runNTimes(n, &timer, bruteForce, .{input}),
            bruteForce(input),
        });

        std.log.debug("testing dynamic approach:", .{});
        std.log.debug("average execution time ({} iterations): {}. result: {s}", .{
            n,
            runNTimes(n, &timer, dynamicApproach, .{input}),
            dynamicApproach(input),
        });

        std.log.debug("testing manachers:", .{});
        std.log.debug("average execution time ({} iterations): {}. result: {s}", .{
            n,
            runNTimes(n, &timer, manacherAlgo, .{input}),
            manacherAlgo(input),
        });
        
        std.log.debug("testing manachers(dynamic memory):", .{});
        std.log.debug("average execution time ({} iterations): {}. result: {s}", .{
            n,
            runNTimes(n, &timer, manacherAlloc, .{allocator, input}),
            manacherAlloc(allocator, input),
        });
    }
}
