const std = @import("std");
fn ScalarMixin(comptime Self: type, comptime T: type) type {
    return struct {
        fn sumScalar(self: *Self, scalar: T) *Self {
            for (self.items) |*item| item.* += scalar;
            return self;
        }
        fn mulScalar(self: *Self, scalar: T) *Self {
            for (self.items) |*item| item.* *= scalar;
            return self;
        }
    };
}
fn Vetor(comptime T: type) type {
    return struct {
        const Self = @This();
        items: []T = undefined,
        allocator: std.mem.Allocator,
        len: usize,
        fn init(allocator: std.mem.Allocator, size: usize) !Self {
            var self = Self{ .len = size, .allocator = allocator };
            self.items = try allocator.alloc(T, size);
            return self;
        }
        usingnamespace ScalarMixin(Self, T);
        fn deinit(self: *Self) void {
            self.allocator.free(self.items);
            self.* = undefined;
        }
        fn at(self: Self, x: usize) T {
            std.debug.assert(x < self.len);
            return self.items[x];
        }
        fn set(self: Self, x: usize, value: T) void {
            std.debug.assert(x < self.len);
            self.items[x] = value;
        }
        fn sum(self: *Self, vetor: Self) *Self {
            std.debug.assert(self.len == vetor.len);
            for (self.items) |*item, i| item.* += vetor.items[i];
            return self;
        }
        fn mul(self: *Self, vetor: Self) T {
            std.debug.assert(self.len == vetor.len);
            var acc: T = 0;
            for (self.items) |item, i| acc += item*vetor.items[i];
            return acc;
        }
    };
}
fn Matrix(comptime T: type) type {
    return struct {
        const Self = @This();
        items: []T = undefined,
        allocator: std.mem.Allocator,
        n_rows: usize,
        n_cols: usize,
        fn init(allocator: std.mem.Allocator, n_rows: usize, n_cols: usize) !Self {
            var self = Self{ .allocator = allocator, .n_rows = n_rows, .n_cols = n_cols };
            self.items = try allocator.alloc(T, n_cols * n_rows);
            return self;
        }
        usingnamespace ScalarMixin(Self, T);
        fn deinit(self: *Self) void {
            self.allocator.free(self.items);
            self.* = undefined;
        }
        inline fn calcIndex(self: Self, x: usize, y: usize) usize {
            std.debug.assert(x < self.n_cols);
            std.debug.assert(y < self.n_rows);
            return (self.n_cols * y) + x;
        }
        fn at(self: Self, x: usize, y: usize) T {
            return self.items[self.calcIndex(x, y)];
        }
        fn set(self: Self, x: usize, y: usize, value: T) void {
            self.items[self.calcIndex(x, y)] = value;
        }
        fn sum(self: *Self, matrix: Self) *Self {
            for (self.items) |*item, i| item.* += matrix.items[i];
            return self;
        }
        fn mul(self: Self, matrix: Self) !Self {
            std.debug.assert(self.n_cols == matrix.n_rows);
            
            var result = try Self.init(self.allocator, self.n_rows, matrix.n_cols);

            var row: usize = 0;
            var col: usize = 0;

            while (col < matrix.n_cols) : (col += 1) {
                row = 0;
                while (row < self.n_rows) : (row += 1) {
                    const i = result.calcIndex(col, row);
                    result.items[i] = 0;

                    var pos: usize = 0;
                    while (pos < matrix.n_rows) : (pos += 1) {
                        result.items[i] += self.at(pos, row) * matrix.at(col, pos);
                    }
                }
            }

            return result;
        }
    };
}

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    const T = u32;
    var matrix1 = try Matrix(T).init(allocator, 2, 3);
    defer matrix1.deinit();
    var matrix2 = try Matrix(T).init(allocator, 3, 2);
    defer matrix2.deinit();

    matrix1.set(0, 0, 1);
    matrix1.set(1, 0, 2);   
    matrix1.set(2, 0, 3);
    matrix1.set(0, 1, 4);
    matrix1.set(1, 1, 5);
    matrix1.set(2, 1, 6);

    matrix2.set(0, 0, 7);
    matrix2.set(1, 0, 8);
    matrix2.set(0, 1, 9);
    matrix2.set(1, 1, 10);
    matrix2.set(0, 2, 11);
    matrix2.set(1, 2, 12);

    var result = try matrix1.mul(matrix2);
    defer result.deinit();

    expect(result.at(0, 0) == 58);
    expect(result.at(1, 0) == 64);
    expect(result.at(0, 1) == 139);
    expect(result.at(1, 1) == 154);
}

fn expect(ok: bool) void {
    if (ok) std.debug.print("ok!\n", .{}) else std.debug.print("failed\n", .{});
}