const std = @import("std");
const input = @embedFile("day7.txt");

const File = struct {
    name: []const u8,
    size: usize,
};

const Folder = struct {
    parent: ?*Folder = null,
    name: []const u8,
    contents: std.ArrayList(Data),
    fn deinitRecursive(self: *Folder) void {
        for (self.contents.items) |*item| 
            if (item.* == .folder) item.folder.deinitRecursive();
        self.contents.deinit();
    }
};

const Data = union(enum) {
    file: File,
    folder: Folder,
};

fn addSizeFolderRecursiveAtMost(root: *const Folder, at_most: usize, general_sum: *usize) usize {
    var size: usize = 0;
    for (root.contents.items) |item| switch (item) {
        .file => |f| size += f.size,
        .folder => |*f| {
            size += addSizeFolderRecursiveAtMost(f, at_most, general_sum);
        }
    };
    if (size <= at_most) general_sum.* += size;
    return size;
}

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    var current_folder: *Folder = &.{
        .name = "/",
        .contents = std.ArrayList(Data).init(allocator),
    };
    const root = current_folder;
    defer root.deinitRecursive();

    var lines = std.mem.tokenize(u8, input, "\n");
    _ = lines.next(); //skipping first line with cd /
    while (lines.next()) |line| {
        if (line[0] == '$') {
            var tokens = std.mem.tokenize(u8, line, "$ ");
            const command = tokens.next().?;

            switch (std.meta.stringToEnum(enum {cd, ls}, command).?) {
                .cd => {
                    const name = tokens.next().?;
                    current_folder = if (std.mem.eql(u8, "..", name)) 
                        current_folder.parent.?
                    else for (current_folder.contents.items) |folder, i| switch (folder) {
                        .file => continue,
                        .folder => |f| if (std.mem.eql(u8, name, f.name)) break &current_folder.contents.items[i].folder else continue,
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
                            file_or_folder = .{ .file = .{.name = name, .size = size} };
                        } else {
                            file_or_folder = .{ .folder = .{.name = name, .parent = current_folder, .contents = std.ArrayList(Data).init(allocator)} };
                        }
                        try current_folder.contents.append(file_or_folder);
                    }
                },
            }
        } else unreachable;
    }

    const at_most = 100_000;
    var acc: usize = 0;
    _ = addSizeFolderRecursiveAtMost(root, at_most, &acc);

    std.debug.print("{}", .{acc});
}