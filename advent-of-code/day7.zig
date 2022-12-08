const std = @import("std");
const input = @embedFile("day7.txt");

const File = struct {
    name: []const u8,
    size: usize,
};

const Folder = struct {
    parent: ?*Folder = null,
    name: []const u8,
    contents: Content,
    fn deinitRecursive(root: *Folder) void {
        for (root.contents.items) |*item|
            if (item.* == .folder) item.folder.deinitRecursive();
        root.contents.deinit();
    }
    fn findRoot(self: *Folder) *Folder {
        return if (self.parent) |parent| parent.findRoot() else self;
    }
    fn addSizeFolderRecursiveAtMost(root: Folder, at_most: usize, general_sum: *usize) usize {
        var size: usize = 0;
        for (root.contents.items) |item| switch (item) {
            .file => |f| size += f.size,
            .folder => |f| {
                size += addSizeFolderRecursiveAtMost(f, at_most, general_sum);
            },
        };
        if (size <= at_most) general_sum.* += size;
        return size;
    }
    fn getSizeFolder(root: Folder) usize {
        var size: usize = 0;
        for (root.contents.items) |item| switch (item) {
            .file => |f| size += f.size,
            .folder => |f| {
                size += getSizeFolder(f);
            },
        };
        return size;
    }
    fn findSmallestGreaterThan(root: *const Folder, at_least: usize) ?*const Folder {
        var smallest: ?*const Folder = null;
        const size_of_self = root.getSizeFolder();
        const cond = size_of_self >= at_least;

        if (cond) smallest = root;

        for (root.contents.items) |item| {
            if (item != .folder) continue;
            if (item.folder.findSmallestGreaterThan(at_least)) |found| {
                const found_size = found.getSizeFolder();
                const do_swap = if (smallest) |smol| found_size < smol.getSizeFolder() else if (found_size >= at_least) true else unreachable;
                if (do_swap) smallest = found;
            }
        }

        return smallest;
    }
    fn printPwd(root: Folder, writer: anytype) !void {
        if (root.parent) |parent| try parent.printPwd(writer);
        try writer.print("{s}/", .{root.name});
    }
    fn printTree(root: Folder, writer: anytype) !void {
        try printPwd(root, writer);try writer.writeByte('\n');
        for (root.contents.items) |item| {
            switch (item) {
                .file => |f| {
                    try printPwd(root, writer);
                    try writer.print("{s}\n", .{f.name});
                },
                .folder => |*f| try printTree(f, writer),
            }
        } 
    }
};

const Data = union(enum) {
    file: File,
    folder: Folder,
};

const Content = std.ArrayList(Data);

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    var root = Folder{.name = "/", .contents = Content.init(allocator)};

    var current_folder: *Folder = &root;
    defer root.deinitRecursive();

    var lines = std.mem.tokenize(u8, input, "\n");
    _ = lines.next(); //skipping first line with cd /
    while (lines.next()) |line| {
        if (line[0] == '$') {
            var tokens = std.mem.tokenize(u8, line, "$ ");
            const command = tokens.next().?;

            switch (std.meta.stringToEnum(enum { cd, ls }, command).?) {
                .cd => {
                    const name = tokens.next().?;
                    current_folder = if (std.mem.eql(u8, "..", name))
                        current_folder.parent.?
                    else for (current_folder.contents.items) |*folder| switch (folder.*) {
                        .file => continue,
                        .folder => |*f| if (std.mem.eql(u8, name, f.name)) break f else continue,
                    } else unreachable;
                },
                .ls => {
                    while (if (lines.peek()) |_line| _line[0] != '$' else false) {
                        const data = lines.next().?;
                        var data_tokens = std.mem.tokenize(u8, data, " ");
                        const size_or_type = data_tokens.next().?;
                        const name = data_tokens.next().?;

                        var file_or_folder: Data = undefined;
                        if (!std.mem.eql(u8, "dir", size_or_type)) {
                            const size = std.fmt.parseInt(usize, size_or_type, 0) catch unreachable;
                            file_or_folder = .{ .file = .{ .name = name, .size = size } };
                        } else {
                            file_or_folder = .{ .folder = .{ .name = name, .parent = current_folder, .contents = Content.init(allocator) } };
                        }
                        try current_folder.contents.append(file_or_folder);
                    }
                },
            }
        } else unreachable;
    }

    const at_most = 100_000;
    var acc: usize = 0;
    _ = root.addSizeFolderRecursiveAtMost(at_most, &acc);

    const total_disk = 70_000_000;
    const needed_space = 30_000_000;
    const used_space = root.getSizeFolder();
    const free_space = total_disk - used_space;
    const free_at_least = needed_space - free_space;
    const smaller_at_least_folder = root.findSmallestGreaterThan(free_at_least).?;

    const size_at_least = smaller_at_least_folder.getSizeFolder();

    std.log.debug("{}", .{acc});
    std.log.debug("{}", .{size_at_least});
}
