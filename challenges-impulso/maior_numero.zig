const std = @import("std");
const e = std.testing.expect;
pub fn geraMaiorNumero(comptime T: type, nums: []const T) !T {
    if (nums.len == 1) return nums[0];
    var copy = try std.BoundedArray(T, 50).init(nums.len);
    var s = copy.slice();
    std.mem.copy(T, s, nums);
    ordena(T, s);
    var n = s[0];
    for (s[1..]) |num| {
        n *= std.math.pow(T, 10, std.math.log10(num) + 1);
        n += num;
    }
    return n;
}
test "geraMaiorNumero" {
    try e(try geraMaiorNumero(usize, &.{320, 84, 9}) == 984320);
    try e(try geraMaiorNumero(usize, &.{10, 2})==210);
}

fn ordena(comptime T: type, nums: []T) void {
    var i: usize = 1;
    while (i < nums.len) : (i += 1) {
        const key = nums[i];
        var j = i;
        while (j > 0 and getMSD(T, key) > getMSD(T, nums[j - 1])) {
            j -= 1;
            nums[j + 1] = nums[j];
        }
        nums[j] = key;
    }
}

fn getDigitoMaisSignificante(comptime T: type, n: T) T {
    var num = n;
    while (num >= 10) num /= 10;
    return num;
}
const getMSD = getDigitoMaisSignificante;
test "getMaiorDigito" {
    try e(getMSD(usize, 4321) == 4);
    try e(getMSD(usize, 35) == 3);
    try e(getMSD(usize, 285) == 2);
}