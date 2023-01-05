const std = @import("std");
const input = @embedFile("day5.txt");

pub fn main() !void {
    comptime var number_of_cols = 0;
    const row_of_index = comptime findNumbers: {
        var lines = std.mem.tokenize(u8, input, "\n");
        var i = 0;
        while (lines.next()) |line| : (i += 1) {
            var chars = std.mem.tokenize(u8, line, " ");
            _ = std.fmt.parseInt(u32, chars.next().?, 0) catch continue;
            number_of_cols = 1;
            @setEvalBranchQuota(2000);
            while (chars.next()) |_| : (number_of_cols += 1) {}
            break :findNumbers i;
        }
    };

    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    var cols: [number_of_cols]std.ArrayList(u8) = undefined;

    for (cols) |*col| col.* = std.ArrayList(u8).init(allocator);
    defer for (cols) |*col| col.deinit();

    var lines = std.mem.tokenize(u8, input, "\n");
    for (&[_]void{{}} ** row_of_index) |_| {
        const line = lines.next().?;
        for (cols) |*col, i| {
            const start = i * 4;
            const end = if (start + 4 > line.len) line.len else start + 4;
            const slice = line[start..end];
            var token = std.mem.tokenize(u8, slice, "[] ");
            if (token.next()) |char| try col.append(char[0]);
        }
    }
    for (cols) |*col| std.mem.reverse(u8, col.items);

    const new_index = lines.index;
    lines = std.mem.tokenize(u8, input, "move from to \n");
    lines.index = new_index;

    for (&[_]void{{}} ** number_of_cols) |_| _ = lines.next();

    while (lines.next()) |token| {
        const move = try std.fmt.parseInt(usize, token, 0);
        const from = try std.fmt.parseInt(usize, lines.next().?, 0);
        const to = try std.fmt.parseInt(usize, lines.next().?, 0);

        const s = cols[from - 1].items;
        const to_append = s[s.len - move ..];
        std.debug.assert(to_append.len == move);
        try cols[to - 1].appendSlice(to_append);

        var i: u32 = 0;
        while (i < move) : (i += 1) {
            _ = cols[from - 1].pop();
        }
    }

    for (cols) |*col| std.debug.print("{c}", .{col.pop()});
}
