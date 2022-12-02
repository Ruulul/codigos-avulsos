const char_mapping = {
    "1": [],
    "2": ["a", "b", "c"],
    "3": ["d", "e", "f"],
    "4": ["g", "h", "i"],
    "5": ["j", "k", "l"],
    "6": ["m", "n", "o"],
    "7": ["p", "q", "r", "s"],
    "8": ["t", "u", "v"],
    "9": ["w", "x", "y", "z"],
    "0": [],
};


/**
 * algorithm:
 *      take the mapping of the first digit;
 *      peek the next;
 *      if none is left, return;
 *      otherwise,
 *          concatenate each mapping to the mapping of the recursive call;
 *          return;
 */
function combineChars (input) {
    let digits = input.split('');
    let output = char_mapping[digits[0]];
    if (digits[1]) {
        let to_append = combineChars(input.substring(1));
        output = output.flatMap(digit=>to_append.map(d=>digit+d));
    } 
    return output;
};

function combineCharsNF (input) {
    let digits = input.split('');
    let output = char_mapping[digits[0]]
    for (let digit of digits.slice(1)) {
        let to_append = char_mapping[digit];
        output = output.flatMap(d=>to_append.map(_d=>d+_d));
    }
    return output;
}
function test (input, needle) {
    for (let [i, result] of combineCharsNF(input).entries()) {
        if (result === needle)
            return console.log({input, needle, i})
    } 
    console.log(needle, 'not found')

}

let input, result
input = '2'
result = combineCharsNFOneLine(input)
console.log({input, result})
input = '23'
result = combineCharsNF(input)
console.log({input, result})
input = '789'
result = combineCharsNF(input)
console.log({input, result})
//test('38266776472627', 'euamoprogramar')