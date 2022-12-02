const std = @import("std");

const toString = struct {
    fn unidade(n: anytype) []const u8 {
        return switch (n) {
            0 => "",
            1 => "um ",
            2 => "dois ",
            3 => "tres ",
            4 => "quatro ",
            5 => "cinco ",
            6 => "seis ",
            7 => "sete ",
            8 => "oito ",
            9 => "nove ",
            else => std.debug.panic("Número {} recebido em unidades", .{ n }),
        };
    }

    fn dezAVinte(n: anytype) []const u8 {
        return switch (n) {
            10 => "dez ",
            11 => "onze ",
            12 => "doze ",
            13 => "treze ",
            14 => "quatorze ",
            15 => "quinze ",
            16 => "dezesseis ",
            17 => "dezessete ",
            18 => "dezoito ",
            19 => "dezenove ",
            20 => "vinte ",
            else => std.debug.panic("Número {} recebido em dez-vinte", .{ n }),
        };
    }

    fn dezena(n: anytype) []const u8 {
        return switch (n) {
            0 => "",
            1 => "dez ",
            2 => "vinte ",
            3 => "trinta ",
            4 => "quarenta ",
            5 => "cinquenta ",
            6 => "sessenta ",
            7 => "setenta ",
            8 => "oitenta ",
            9 => "noventa ",
            else => std.debug.panic("Número {} recebido em dezenas", .{ n }),
        };
    }

    fn centena(n: anytype) []const u8 {
        return switch (n) {
            0 => "",
            1 => "cem ",
            2 => "duzentos ",
            3 => "trezentos ",
            4 => "quatrocentos ",
            5 => "quinhentos ",
            6 => "seiscentos ",
            7 => "setecentos ",
            8 => "oitocentos ",
            9 => "novecentos ",
            else => std.debug.panic("Número {} recebido em centenas", .{ n }),
        };
    }
};
const Grandeza = enum (usize) {
    centena = 0,
    milhar = 1,
    milhao = 2,
    bilhao = 3,
    trilhao = 4,
    quadrilhao = 5,
};

inline fn getOrdemGrandeza(n: anytype) ?Grandeza {
    return std.meta.intToEnum(Grandeza, std.math.log10(n) / 3) catch null;
}

inline fn getFatorMil(n: anytype) usize {
    return switch (getOrdemGrandeza(n).?) {
        inline else => |ordem_grandeza| comptime std.math.pow(usize, 1_000, @enumToInt(ordem_grandeza)),
    };
}

fn numeroPorExtenso(number: anytype, writer: anytype) !void {
    comptime {
        const Writer = @TypeOf(writer);
        const n_info = @typeInfo(@TypeOf(number));
        if (!(
            @hasDecl(Writer, "write") and
            @hasDecl(Writer, "writeAll") and
            @hasDecl(Writer, "print")
        )) @compileError("A funcao numeroPorExtenso requer um objeto Writer");
        if (n_info != .ComptimeInt and n_info != .Int) @compileError("A funcao numeroPorExtenso so funciona para numeros inteiros sem sinal");
    }

    var n: usize = number;
    while (n > 0) : (n %= getFatorMil(n)) {
        const grandeza = getOrdemGrandeza(n) orelse return error.InputTooBig;
        const centena  = (n / (100 * getFatorMil(n))) % 10;
        const dezena   = (n / (10 * getFatorMil(n))) % 10;
        const unidade  = (n / (1 * getFatorMil(n))) % 10;
        if (centena == 1 and (dezena > 0 or unidade > 0))
            try writer.writeAll("cento e ")
        else
            try writer.writeAll(toString.centena(centena));
        if (centena > 0 and (dezena > 0 or unidade > 0)) try writer.writeAll("e ");
        if ((dezena == 2 and unidade == 0) or dezena < 2 and dezena > 0 and unidade > 0) {
            try writer.writeAll(toString.dezAVinte(dezena * 10 + unidade));
        } else {
            try writer.writeAll(toString.dezena(dezena));
            if (dezena > 0 and unidade > 0) try writer.writeAll("e ");
            try writer.writeAll(toString.unidade(unidade));
        }
        switch (grandeza) {
                .centena => {},
                .milhar => try writer.writeAll("mil "),
                inline else => |case| try writer.writeAll(
                    if (n / getFatorMil(n) == 1) @tagName(case)
                    else @tagName(case)[0..@tagName(case).len - 2] ++ "oes "
                ),
        }
    }
    try writer.writeByte('\n');
}

pub fn main() !void {
    const writer = std.io.getStdErr().writer();
    try numeroPorExtenso(200, writer);
    try numeroPorExtenso(1234, writer);
    try numeroPorExtenso(5_234_534, writer);
    try numeroPorExtenso(987_654_321, writer);
    try numeroPorExtenso(2_000_000_000, writer);
    try numeroPorExtenso(1_000_000_000, writer);
    try numeroPorExtenso(1_234_567_890_987_654, writer);
    try numeroPorExtenso(123_456_789_098_765_432, writer);
}