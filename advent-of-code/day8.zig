const std = @import("std");
const input = @embedFile("day8-test.txt");
const width = for (input) |char, i| if (char == '\n') break i + 1;

fn at(x: usize, y: usize) ?u8 {
    const i = y * width + x;
    return if (i < input.len) input[i] else null;
}
const Position = struct {
    x: usize,
    y: usize,
    pub fn format(value: Position, comptime fmt: []const u8, options: std.fmt.FormatOptions, writer: anytype) !void {
        _ = fmt;
        _ = options;
        try writer.print("(x = {}, y = {})", .{ value.x, value.y });
    }
};
fn getXY(i: usize) Position {
    return .{
        .x = i % width,
        .y = i / width,
    };
}
const Orientation = enum { horizontal, vertical };
const Direction = enum { sum, minus };
fn checkBorderFrom(x: usize, y: usize, orientation: Orientation, direction: Direction) bool {
    const base = switch (orientation) {
        .horizontal => x,
        .vertical => y,
    };
    const compare = switch (direction) {
        .sum => width - 2,
        .minus => 0,
    };
    return base == compare;
}
fn countVisibleFrom(x: usize, y: usize, orientation: Orientation, direction: Direction) usize {
    const tree = at(x, y).?;
    if (checkBorderFrom(x, y, orientation, direction)) return 1;
    const base = switch (orientation) {
        .horizontal => x,
        .vertical => y,
    };
    var i: usize = switch (direction) {
        .sum => base + 1,
        .minus => base - 1,
    };
    var count: usize = 0;
    while (switch (orientation) {
        .horizontal => at(i, y),
        .vertical => at(x, i),
    }) |other_tree| : (i = switch (direction) {
        .sum => i + 1,
        .minus => i - 1,
    }) { 
        count += 1;
        if (other_tree >= tree) break;
        if (i == 0 or i == width - 1) break;
    }
    std.log.debug("{} trees from ({} {}) with orientation {s} and direction {s}", .{count, x, y, @tagName(orientation), @tagName(direction)});
    return count;
}
fn calcScenicScore(x: usize, y: usize) usize {
    const score =
        countVisibleFrom(x, y, .horizontal, .sum) *
        countVisibleFrom(x, y, .horizontal, .minus) *
        countVisibleFrom(x, y, .vertical, .sum) *
        countVisibleFrom(x, y, .vertical, .minus);
    std.log.debug("score of {} for {c}({} {})", .{score, at(x, y).?, x, y});
    return score;
}
fn visibleFrom(x: usize, y: usize, orientation: Orientation, direction: Direction) bool {
    const tree = at(x, y).?;
    const base = switch (orientation) {
        .horizontal => x,
        .vertical => y,
    };
    var i: usize = switch (direction) {
        .sum => base + 1,
        .minus => base - 1,
    };
    return while (switch (orientation) {
        .horizontal => at(i, y),
        .vertical => at(x, i),
    }) |other_tree| : (i = switch (direction) {
        .sum => i + 1,
        .minus => i - 1,
    }) {        
        if (other_tree >= tree) break false;
        if (i == 0 or i == width - 1) break true;
    } else true;
}
fn checkTreeIsVisible(x: usize, y: usize) bool {
    if (x == 0 or y == 0 or x == width - 1 or y == width - 1) return true;
    if (!visibleFrom(x, y, .horizontal, .sum) and
        !visibleFrom(x, y, .horizontal, .minus) and
        !visibleFrom(x, y, .vertical, .sum) and
        !visibleFrom(x, y, .vertical, .minus)) return false;
    return true;
}
pub fn main() !void {
    var count: usize = 0;
    var highest_score: usize = 0;
    var i: usize = 0;
    while (i < input.len) : (i += 1) {
        switch (input[i]) {
            '0'...'9' => {},
            else => continue,
        }
        const p = getXY(i);
        std.debug.assert(at(p.x, p.y).? == input[i]);
        const visibility = checkTreeIsVisible(p.x, p.y);
        if (visibility) count += 1;
        const score = calcScenicScore(p.x, p.y);
        if (score > highest_score) highest_score = score;
    }
    std.log.debug("{}", .{count});
    std.log.debug("{}", .{highest_score});
}
