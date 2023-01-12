const std = @import("std");
fn Operator(comptime T: type) type {
    return struct {
        symbol: u8,
        precedence: usize,
        associativity: enum { left, right },
        eval: ?*const fn (*Output(T)) anyerror!void = null,

        fn plusFn(stack: *Output(T)) anyerror!void {
            const first = stack.pop().number;
            const last = stack.pop().number;
            try stack.append(.{ .number = first + last });
        }
        fn minusFn(stack: *Output(T)) anyerror!void {
            const first = stack.pop().number;
            const last = stack.pop().number;
            try stack.append(.{ .number = last - first });
        }
        fn timesFn(stack: *Output(T)) anyerror!void {
            const first = stack.pop().number;
            const last = stack.pop().number;
            try stack.append(.{ .number = last * first });
        }
        fn byFn(stack: *Output(T)) anyerror!void {
            const first = stack.pop().number;
            const last = stack.pop().number;
            try stack.append(.{ .number = last / first });
        }
        fn raisedFn(stack: *Output(T)) anyerror!void {
            const first = stack.pop().number;
            const last = stack.pop().number;
            try stack.append(.{ .number = std.math.pow(@TypeOf(last), last, first) });
        }
    };
}
fn Output(comptime T: type) type {
    return std.BoundedArray(
        union(enum) {
            number: T,
            operator: *const Operator(T),
            pub fn format(value: Output(T), comptime fmt: []const u8, options: std.fmt.FormatOptions, writer: anytype) !void {
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
    const plus = Operator(T){ .symbol = '+', .precedence = 0, .associativity = .left, .eval = Operator(T).plusFn };
    const minus = Operator(T){ .symbol = '-', .precedence = 0, .associativity = .left, .eval = Operator(T).minusFn };

    const times = Operator(T){ .symbol = '*', .precedence = 1, .associativity = .left, .eval = Operator(T).timesFn };
    const by = Operator(T){ .symbol = '/', .precedence = 1, .associativity = .left, .eval = Operator(T).byFn };

    const raised = Operator(T){ .symbol = '^', .precedence = 2, .associativity = .right, .eval = Operator(T).raisedFn };
    const left_parenthesis = Operator(T){ .symbol = '(', .precedence = 5, .associativity = .left };
    const operators: []const Operator(T) = &.{ plus, minus, times, by, raised, left_parenthesis };
    const operators_symbols: []const u8 = "+-*/^(";

    var tokens = std.mem.tokenize(u8, stream, " ");
    var output = Output(T).init(0) catch unreachable;
    var stack = std.BoundedArray(*const Operator(T), 50).init(0) catch unreachable;
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
            const operator = &operators[std.mem.indexOfScalar(u8, operators_symbols, token[0]).?];
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
        try switch (op_or_number) {
            .number => stack.append(op_or_number),
            .operator => |op| op.eval.?(&stack),
        };
    }
    std.debug.assert(stack.len == 1);
    return stack.pop().number;
}
