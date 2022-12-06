const std = @import("std");
const input = "alareviverarara";
const expected_output = "arevivera";

fn isPalindrome(string: []const u8) bool {
    const end = string.len / 2;
    var i: usize = 0;
    return while (i < end) : (i += 1) {
        if (string[i] != string[string.len - i - 1]) break false;
    } else true;
}

fn findBiggestPalindrome(string: []const u8) []const u8 {
    var index_biggest_palindrome: usize = 0;
    var size_biggest_palindrome: usize = 0;

    for (string) |_, start| {
        var end: usize = start;
        while (end < string.len) : (end += 1) {
            if (isPalindrome(string[start..end]) and end - start > size_biggest_palindrome) {
                size_biggest_palindrome = end - start;
                index_biggest_palindrome = start;
            }
        }
    }

    return string[index_biggest_palindrome..][0..size_biggest_palindrome];
}

pub fn main() !void {
    std.log.debug("{s}", .{findBiggestPalindrome(input)});
    try std.testing.expect(
        std.mem.eql(u8, 
            findBiggestPalindrome(input), 
            expected_output,
        )
    );
}