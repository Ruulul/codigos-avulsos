const std = @import("std");
const Operator = struct {
    symbol: u8,
    precedence: usize,
    associativity: enum { left, right },
};
const plus = Operator{ .symbol = '+', .precedence = 0, .associativity = .left };
const minus = Operator{ .symbol = '-', .precedence = 0, .associativity = .left };

const times = Operator{ .symbol = '*', .precedence = 1, .associativity = .left };
const by = Operator{ .symbol = '/', .precedence = 1, .associativity = .left };

const raised = Operator{ .symbol = '^', .precedence = 2, .associativity = .right };
const left_parenthesis = Operator{ .symbol = '(', .precedence = 5, .associativity = .left };
const operators: []const Operator = &.{ plus, minus, times, by, raised, left_parenthesis };
const operators_symbols: []const u8 = "+-*/^(";
fn Output(comptime T: type) type {
    return std.BoundedArray(
        union(enum) {
            number: T,
            operator: Operator,
            pub fn format(value: @This(), comptime fmt: []const u8, options: std.fmt.FormatOptions, writer: anytype) !void {
                _ = fmt;
                _ = options;
                try switch (value) {
                    .number => |n| writer.print("{}", .{n}),
                    .operator => |op| writer.print("{c}", .{op.symbol}),
                };
            }
        },
        50,
    );
}
pub fn calculate(comptime T: type, stream: []const u8) !T {
    var tokens = std.mem.tokenize(u8, stream, " ");
    var output = Output(T).init(0) catch unreachable;
    var stack = std.BoundedArray(Operator, 50).init(0) catch unreachable;
    while (tokens.next()) |token| {
        const parse = std.fmt.parseInt(T, token, 0) catch {
            std.debug.assert(token.len == 1);
            const last_operator = stack.buffer[stack.len -| 1];
            if (token[0] == ')') {
                while (stack.buffer[stack.len - 1].symbol != '(') {
                    try output.append(.{ .operator = stack.pop() });
                }
                _ = stack.pop();
                continue;
            }
            const operator = operators[std.mem.indexOfScalar(u8, operators_symbols, token[0]).?];
            if (stack.len == 0) try stack.append(operator) else {
                if (last_operator.symbol == '(' or operator.precedence > last_operator.precedence)
                    try stack.append(operator)
                else {
                    try output.append(.{ .operator = stack.pop() });
                    try stack.append(operator);
                }
            }
            continue;
        };
        try output.append(.{ .number = parse });
    }
    while (stack.popOrNull()) |op| try output.append(.{ .operator = op });
    return eval(T, output);
}
test {
    const e = std.testing.expect;
    try e(try calculate(u8, "2 + 3") == 5);
    try e(try calculate(u8, "10 - 2 * 3") == 4);
    try e(try calculate(u8, "2 + 3 ^ 2") == 11);
    try e(try calculate(u8, "1 ^ 2 ^ 3") == 1);
    try e(try calculate(u8, "3 * ( 9 - 2 )") == 21);
}
fn eval(comptime T: type, tree: Output(T)) !T {
    var stack = Output(T).init(0) catch unreachable;
    for (tree.slice()) |op_or_number| {
        switch (op_or_number) {
            .number => try stack.append(op_or_number),
            .operator => |op| switch (op.symbol) {
                '+' => try stack.append(.{ .number = stack.pop().number + stack.pop().number }),
                '-' => {
                    const last = stack.pop().number;
                    const first = stack.pop().number;
                    try stack.append(.{ .number = first - last });
                },
                '*' => try stack.append(.{ .number = stack.pop().number * stack.pop().number }),
                '/' => {
                    const last = stack.pop().number;
                    const first = stack.pop().number;
                    try stack.append(.{ .number = first / last });
                },
                '^' => {
                    const last = stack.pop().number;
                    const first = stack.pop().number;
                    try stack.append(.{ .number = std.math.pow(T, first, last) });
                },
                else => unreachable,
            },
        }
    }
    std.debug.assert(stack.len == 1);
    return stack.pop().number;
}
