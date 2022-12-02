const std = @import("std");
const assert = std.debug.assert;
/// Parsing:
/// Pratt-parsing works with two central components:
/// 
/// A iterative cycle, with recursive tree.
/// This works out with a binding directive that signals the recursive tree to stop.
pub const Parser = @This();

pub const Tree = struct {
         left: ?Tree,
        token: Token,
        right: ?Tree,
};

pub const Token = []const u8;

pub const Rule = struct {
    symbol: []const u8,
    precendence: enum {
        prefix,
         infix,
        sulfix,
    },
    binding: usize,
    is_right_binding: bool,
};

rules: std.StringHashMap(Rule),
symbols: []const []const u8,
pub fn parse (parser: Parser, allocator: std.mem.Allocator, stream: []const u8) !Tree {
    
}
