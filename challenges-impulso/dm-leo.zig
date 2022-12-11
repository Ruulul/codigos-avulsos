const std = @import("std");
const e = std.testing.expect;
const eql = std.mem.eql;
fn displayFromSeconds(seconds: usize, writer: anytype) !void {
    const minutes = seconds / 60;
    const hours = minutes / 60;
    try writer.print("{:0>2}:{:0>2}:{:0>2}", .{hours, minutes % 60, seconds % 60});
}
test "displayFromSeconds" {
    var output = std.ArrayList(u8).init(std.testing.allocator);
    defer output.deinit();
    const writer = output.writer();
    try displayFromSeconds(300, writer);
    try e(eql(u8, "00:05:00", output.items));
    output.clearAndFree();
    try displayFromSeconds(12506, writer);
    try e(eql(u8, "03:28:26", output.items));
}
const Hora = std.math.IntFittingRange(0, 24);
fn tempoDeJogo(hora_inicial: Hora, hora_final: Hora) Hora {
  const diferenca = if (hora_final >= hora_inicial) hora_final - hora_inicial else hora_final + 24 - hora_inicial;
  return if (diferenca == 0) 24 else diferenca;
}
test "tempoDeJogo" {
    try e(tempoDeJogo(16, 2) == 10);
    try e(tempoDeJogo(0, 0) == 24);
    try e(tempoDeJogo(2, 16) == 14);
}