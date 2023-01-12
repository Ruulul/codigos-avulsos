const std = @import("std");
pub fn somaNosMaisProfundos(comptime T: type, arvore: []const ?T) T {
    const offset = calculaOffset: {
        var slots: usize = 1;
        var offset_atual: usize = 1;
        while (offset_atual + slots * 2 < arvore.len) {
            slots = countNotNullNodes(T, arvore[offset_atual..][0..slots]) * 2;
            offset_atual += slots;
            std.debug.print("\nitem: {any}\noffset: {}\nslots: {}\nlen: {}\n", .{arvore[offset_atual], offset_atual, slots, arvore.len});
        }
        break :calculaOffset offset_atual;
    };
    //std.debug.print("\noffset: {}", .{offset});
    var acc: T = 0;
    for (arvore[offset..]) |i| {
        //if (i) |v| std.debug.print("\nsumming {}\n",.{v});
        if (i) |value| acc += value;
    }
    std.debug.print("\nsummed {}\n", .{acc});
    return acc;
}
fn countNotNullNodes(comptime T: type, sub_tree: []const ?T) usize {
    var count: usize = 0;
    for (sub_tree) |i| {
        if (i != null) count += 1;
    }
    return count;
}

test {
    const e = std.testing.expect;
    try e(somaNosMaisProfundos(u8, &.{1,2,3,4,5,null,6,7,8,null,null,null,9}) == 24);
    try e(somaNosMaisProfundos(u8, &.{12,13,14,4,14,2,6,18,null,2,8,null,null,null,10}) == 38);
    try e(somaNosMaisProfundos(u8, &.{1, 2, null, 3, null, 4, 5, 6, 7, null, null}) == 13);
}