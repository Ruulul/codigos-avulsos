const std = @import("std");
const e = std.testing.expect;
fn getInverse(comptime T: type, n: T) T {
    var inverse: T = 0;
    var rest = n;
    while (rest > 0) {
        inverse *= 10;
        inverse += rest % 10;
        rest /= 10;
    }
    return inverse;
}
test "getInverse" {
    const T = u32;
    try e(getInverse(T, 10) == 1);
    try e(getInverse(T, 1234) == 4321);
}
fn isInverseEqual(comptime T: type, n: T) bool {
    return n == getInverse(T, n);
}
fn countWithInverses(comptime T: type, n: []const T) usize {
    var len = n.len;
    for (n) |i| {
        if (isInverseEqual(T, i)) len += 1;
    }
    return len;
}
test "countWithInverses" {
    try e(countWithInverses(u32, &.{1,13,10,12,31}) == 6);
}