// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke and released under an MIT
// license. The Unicode regexps (for identifiers and whitespace) were
// taken from [Esprima](http://esprima.org) by Ariya Hidayat.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/marijnh/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/marijnh/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js
(function(root, mod) {
    if (typeof exports == "object" && typeof module == "object") return mod(exports); // CommonJS
    if (typeof define == "function" && define.amd) return define([
        "exports"
    ], mod); // AMD
    mod(root.acorn || (root.acorn = {})); // Plain browser env
})(this, function(exports1) {
    "use strict";
    exports1.version = "0.5.0";
    // Plus additional edits marked with 'JS-Interpreter change' comments.
    // JS-Interpreter change:
    // No longer exporting defaultOptions, getLineInfo, tokenize, tokTypes,
    // isIdentifierStart, and isIdentifierChar.  Not used by JS-Interpreter.
    // -- Neil Fraser, February 2023.
    // The main exported interface (under `self.acorn` when in the
    // browser) is a `parse` function that takes a code string and
    // returns an abstract syntax tree as specified by [Mozilla parser
    // API][api], with the caveat that the SpiderMonkey-specific syntax
    // (`let`, `yield`, inline XML, etc) is not recognized.
    //
    // [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
    var options, input, inputLen, sourceFile;
    exports1.parse = function(inpt, opts) {
        input = String(inpt);
        inputLen = input.length;
        setOptions(opts);
        initTokenState();
        return parseTopLevel(options.program);
    };
    // A second optional argument can be given to further configure
    // the parser process. These options are recognized:
    var defaultOptions = {
        // JS-Interpreter change:
        // `ecmaVersion` option has been removed along with all cases where
        // it is checked.  In this version of Acorn it was limited to 3 or 5,
        // and there's no use case for 3 with JS-Interpreter.
        // -- Neil Fraser, December 2022.
        // Turn on `strictSemicolons` to prevent the parser from doing
        // automatic semicolon insertion.
        strictSemicolons: false,
        // When `allowTrailingCommas` is false, the parser will not allow
        // trailing commas in array and object literals.
        allowTrailingCommas: true,
        // By default, reserved words are not enforced. Enable
        // `forbidReserved` to enforce them. When this option has the
        // value "everywhere", reserved words and keywords can also not be
        // used as property names.
        forbidReserved: false,
        // When enabled, a return at the top level is not considered an
        // error.
        allowReturnOutsideFunction: false,
        // When `locations` is on, `loc` properties holding objects with
        // `start` and `end` properties in `{line, column}` form (with
        // line being 1-based and column 0-based) will be attached to the
        // nodes.
        locations: false,
        // A function can be passed as `onComment` option, which will
        // cause Acorn to call that function with `(block, text, start,
        // end)` parameters whenever a comment is skipped. `block` is a
        // boolean indicating whether this is a block (`/* */`) comment,
        // `text` is the content of the comment, and `start` and `end` are
        // character offsets that denote the start and end of the comment.
        // When the `locations` option is on, two more parameters are
        // passed, the full `{line, column}` locations of the start and
        // end of the comments. Note that you are not allowed to call the
        // parser from the callback—that will corrupt its internal state.
        onComment: null,
        // Nodes have their start and end characters offsets recorded in
        // `start` and `end` properties (directly on the node, rather than
        // the `loc` object, which holds line/column data. To also add a
        // [semi-standardized][range] `range` property holding a `[start,
        // end]` array with the same numbers, set the `ranges` option to
        // `true`.
        //
        // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
        ranges: false,
        // It is possible to parse multiple files into a single AST by
        // passing the tree produced by parsing the first file as
        // `program` option in subsequent parses. This will add the
        // toplevel forms of the parsed file to the `Program` (top) node
        // of an existing parse tree.
        program: null,
        // When `locations` is on, you can pass this to record the source
        // file in every node's `loc` object.
        sourceFile: null,
        // This value, if given, is stored in every node, whether
        // `locations` is on or off.
        directSourceFile: null
    };
    function setOptions(opts) {
        options = opts || {};
        for(var opt in defaultOptions)if (!Object.prototype.hasOwnProperty.call(options, opt)) options[opt] = defaultOptions[opt];
        sourceFile = options.sourceFile || null;
    }
    // The `getLineInfo` function is mostly useful when the
    // `locations` option is off (for performance reasons) and you
    // want to find the line/column position for a given character
    // offset. `input` should be the code string that the offset refers
    // into.
    var getLineInfo = function(input, offset) {
        for(var line = 1, cur = 0;;){
            lineBreak.lastIndex = cur;
            var match = lineBreak.exec(input);
            if (match && match.index < offset) {
                ++line;
                cur = match.index + match[0].length;
            } else break;
        }
        return {
            line: line,
            column: offset - cur
        };
    };
    // JS-Interpreter change:
    // tokenize function never used.  Removed.
    // -- Neil Fraser, February 2023.
    // State is kept in (closure-)global variables. We already saw the
    // `options`, `input`, and `inputLen` variables above.
    // The current position of the tokenizer in the input.
    var tokPos;
    // The start and end offsets of the current token.
    var tokStart, tokEnd;
    // When `options.locations` is true, these hold objects
    // containing the tokens start and end line/column pairs.
    var tokStartLoc, tokEndLoc;
    // The type and value of the current token. Token types are objects,
    // named by variables against which they can be compared, and
    // holding properties that describe them (indicating, for example,
    // the precedence of an infix operator, and the original name of a
    // keyword token). The kind of value that's held in `tokVal` depends
    // on the type of the token. For literals, it is the literal value,
    // for operators, the operator name, and so on.
    var tokType, tokVal;
    // Interal state for the tokenizer. To distinguish between division
    // operators and regular expressions, it remembers whether the last
    // token was one that is allowed to be followed by an expression.
    // (If it is, a slash is probably a regexp, if it isn't it's a
    // division operator. See the `parseStatement` function for a
    // caveat.)
    var tokRegexpAllowed;
    // When `options.locations` is true, these are used to keep
    // track of the current line, and know when a new line has been
    // entered.
    var tokCurLine, tokLineStart;
    // These store the position of the previous token, which is useful
    // when finishing a node and assigning its `end` position.
    var lastStart, lastEnd, lastEndLoc;
    // This is the parser's state. `inFunction` is used to reject
    // `return` statements outside of functions, `labels` to verify that
    // `break` and `continue` have somewhere to jump to, and `strict`
    // indicates whether strict mode is on.
    var inFunction, labels, strict;
    // This function is used to raise exceptions on parse errors. It
    // takes an offset integer (into the current `input`) to indicate
    // the location of the error, attaches the position to the end
    // of the error message, and then raises a `SyntaxError` with that
    // message.
    function raise(pos, message) {
        var loc = getLineInfo(input, pos);
        message += " (" + loc.line + ":" + loc.column + ")";
        var err = new SyntaxError(message);
        err.pos = pos;
        err.loc = loc;
        err.raisedAt = tokPos;
        throw err;
    }
    // Reused empty array added for node fields that are always empty.
    var empty = [];
    // ## Token types
    // The assignment of fine-grained, information-carrying type objects
    // allows the tokenizer to store the information it has about a
    // token in a way that is very cheap for the parser to look up.
    // All token type variables start with an underscore, to make them
    // easy to recognize.
    // These are the general types. The `type` property is only used to
    // make them recognizeable when debugging.
    var _num = {
        type: "num"
    }, _regexp = {
        type: "regexp"
    }, _string = {
        type: "string"
    };
    var _name = {
        type: "name"
    }, _eof = {
        type: "eof"
    };
    // Keyword tokens. The `keyword` property (also used in keyword-like
    // operators) indicates that the token originated from an
    // identifier-like word, which is used when parsing property names.
    //
    // The `beforeExpr` property is used to disambiguate between regular
    // expressions and divisions. It is set on all token types that can
    // be followed by an expression (thus, a slash after them would be a
    // regular expression).
    //
    // `isLoop` marks a keyword as starting a loop, which is important
    // to know when parsing a label, in order to allow or disallow
    // continue jumps to that label.
    var _break = {
        keyword: "break"
    }, _case = {
        keyword: "case",
        beforeExpr: true
    }, _catch = {
        keyword: "catch"
    };
    var _continue = {
        keyword: "continue"
    }, _debugger = {
        keyword: "debugger"
    }, _default = {
        keyword: "default"
    };
    var _do = {
        keyword: "do",
        isLoop: true
    }, _else = {
        keyword: "else",
        beforeExpr: true
    };
    var _finally = {
        keyword: "finally"
    }, _for = {
        keyword: "for",
        isLoop: true
    }, _function = {
        keyword: "function"
    };
    var _if = {
        keyword: "if"
    }, _return = {
        keyword: "return",
        beforeExpr: true
    }, _switch = {
        keyword: "switch"
    };
    var _throw = {
        keyword: "throw",
        beforeExpr: true
    }, _try = {
        keyword: "try"
    }, _var = {
        keyword: "var"
    };
    var _while = {
        keyword: "while",
        isLoop: true
    }, _with = {
        keyword: "with"
    }, _new = {
        keyword: "new",
        beforeExpr: true
    };
    var _this = {
        keyword: "this"
    };
    // The keywords that denote values.
    var _null = {
        keyword: "null",
        atomValue: null
    }, _true = {
        keyword: "true",
        atomValue: true
    };
    var _false = {
        keyword: "false",
        atomValue: false
    };
    // Some keywords are treated as regular operators. `in` sometimes
    // (when parsing `for`) needs to be tested against specifically, so
    // we assign a variable name to it for quick comparing.
    var _in = {
        keyword: "in",
        binop: 7,
        beforeExpr: true
    };
    // Map keyword names to token types.
    var keywordTypes = {
        "break": _break,
        "case": _case,
        "catch": _catch,
        "continue": _continue,
        "debugger": _debugger,
        "default": _default,
        "do": _do,
        "else": _else,
        "finally": _finally,
        "for": _for,
        "function": _function,
        "if": _if,
        "return": _return,
        "switch": _switch,
        "throw": _throw,
        "try": _try,
        "var": _var,
        "while": _while,
        "with": _with,
        "null": _null,
        "true": _true,
        "false": _false,
        "new": _new,
        "in": _in,
        "instanceof": {
            keyword: "instanceof",
            binop: 7,
            beforeExpr: true
        },
        "this": _this,
        "typeof": {
            keyword: "typeof",
            prefix: true,
            beforeExpr: true
        },
        "void": {
            keyword: "void",
            prefix: true,
            beforeExpr: true
        },
        "delete": {
            keyword: "delete",
            prefix: true,
            beforeExpr: true
        }
    };
    // Punctuation token types. Again, the `type` property is purely for debugging.
    var _bracketL = {
        type: "[",
        beforeExpr: true
    }, _bracketR = {
        type: "]"
    }, _braceL = {
        type: "{",
        beforeExpr: true
    };
    var _braceR = {
        type: "}"
    }, _parenL = {
        type: "(",
        beforeExpr: true
    }, _parenR = {
        type: ")"
    };
    var _comma = {
        type: ",",
        beforeExpr: true
    }, _semi = {
        type: ";",
        beforeExpr: true
    };
    var _colon = {
        type: ":",
        beforeExpr: true
    }, _dot = {
        type: "."
    }, _question = {
        type: "?",
        beforeExpr: true
    };
    // Operators. These carry several kinds of properties to help the
    // parser use them properly (the presence of these properties is
    // what categorizes them as operators).
    //
    // `binop`, when present, specifies that this operator is a binary
    // operator, and will refer to its precedence.
    //
    // `prefix` and `postfix` mark the operator as a prefix or postfix
    // unary operator. `isUpdate` specifies that the node produced by
    // the operator should be of type UpdateExpression rather than
    // simply UnaryExpression (`++` and `--`).
    //
    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
    // binary operators with a very low precedence, that should result
    // in AssignmentExpression nodes.
    var _slash = {
        binop: 10,
        beforeExpr: true
    }, _eq = {
        isAssign: true,
        beforeExpr: true
    };
    var _assign = {
        isAssign: true,
        beforeExpr: true
    };
    var _incDec = {
        postfix: true,
        prefix: true,
        isUpdate: true
    }, _prefix = {
        prefix: true,
        beforeExpr: true
    };
    var _logicalOR = {
        binop: 1,
        beforeExpr: true
    };
    var _logicalAND = {
        binop: 2,
        beforeExpr: true
    };
    var _bitwiseOR = {
        binop: 3,
        beforeExpr: true
    };
    var _bitwiseXOR = {
        binop: 4,
        beforeExpr: true
    };
    var _bitwiseAND = {
        binop: 5,
        beforeExpr: true
    };
    var _equality = {
        binop: 6,
        beforeExpr: true
    };
    var _relational = {
        binop: 7,
        beforeExpr: true
    };
    var _bitShift = {
        binop: 8,
        beforeExpr: true
    };
    var _plusMin = {
        binop: 9,
        prefix: true,
        beforeExpr: true
    };
    var _multiplyModulo = {
        binop: 10,
        beforeExpr: true
    };
    // JS-Interpreter change:
    // tokTypes map never used.  Removed.
    // -- Neil Fraser, February 2023.
    // JS-Interpreter change:
    // Acorn's original code built up functions using strings for maximum efficiency.
    // However, this triggered a CSP unsafe-eval requirement.  Here's a slower, but
    // simpler approach.  -- Neil Fraser, January 2022.
    // https://github.com/NeilFraser/JS-Interpreter/issues/228
    function makePredicate(words) {
        words = words.split(" ");
        var set = Object.create(null);
        for(var i = 0; i < words.length; i++)set[words[i]] = true;
        return function(str) {
            return set[str] || false;
        };
    }
    // ECMAScript 5 reserved words.
    var isReservedWord5 = makePredicate("class enum extends super const export import");
    // The additional reserved words in strict mode.
    var isStrictReservedWord = makePredicate("implements interface let package private protected public static yield");
    // The forbidden variable names in strict mode.
    var isStrictBadIdWord = makePredicate("eval arguments");
    // And the keywords.
    var isKeyword = makePredicate("break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this");
    // ## Character categories
    // Big ugly regular expressions that match characters in the
    // whitespace, identifier, and identifier-start categories. These
    // are only applied when a character is found to actually have a
    // code point above 128.
    var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
    var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";
    var nonASCIIidentifierChars = "̀-ͯ҃-֑҇-ׇֽֿׁׂׅׄؐ-ؚؠ-ىٲ-ۓۧ-ۨۻ-ۼܰ-݊ࠀ-ࠔࠛ-ࠣࠥ-ࠧࠩ-࠭ࡀ-ࡗࣤ-ࣾऀ-ःऺ-़ा-ॏ॑-ॗॢ-ॣ०-९ঁ-ঃ়া-ৄেৈৗয়-ৠਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢ-ૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୟ-ୠ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఁ-ఃె-ైొ-్ౕౖౢ-ౣ౦-౯ಂಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢ-ೣ೦-೯ംഃെ-ൈൗൢ-ൣ൦-൯ංඃ්ා-ුූෘ-ෟෲෳิ-ฺเ-ๅ๐-๙ິ-ູ່-ໍ໐-໙༘༙༠-༩༹༵༷ཁ-ཇཱ-྄྆-྇ྍ-ྗྙ-ྼ࿆က-ဩ၀-၉ၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟ᜎ-ᜐᜠ-ᜰᝀ-ᝐᝲᝳក-ឲ៝០-៩᠋-᠍᠐-᠙ᤠ-ᤫᤰ-᤻ᥑ-ᥭᦰ-ᧀᧈ-ᧉ᧐-᧙ᨀ-ᨕᨠ-ᩓ᩠-᩿᩼-᪉᪐-᪙ᭆ-ᭋ᭐-᭙᭫-᭳᮰-᮹᯦-᯳ᰀ-ᰢ᱀-᱉ᱛ-ᱽ᳐-᳒ᴀ-ᶾḁ-ἕ‌‍‿⁀⁔⃐-⃥⃜⃡-⃰ⶁ-ⶖⷠ-ⷿ〡-〨゙゚Ꙁ-ꙭꙴ-꙽ꚟ꛰-꛱ꟸ-ꠀ꠆ꠋꠣ-ꠧꢀ-ꢁꢴ-꣄꣐-꣙ꣳ-ꣷ꤀-꤉ꤦ-꤭ꤰ-ꥅꦀ-ꦃ꦳-꧀ꨀ-ꨧꩀ-ꩁꩌ-ꩍ꩐-꩙ꩻꫠ-ꫩꫲ-ꫳꯀ-ꯡ꯬꯭꯰-꯹ﬠ-ﬨ︀-️︠-︦︳︴﹍-﹏０-９＿";
    var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
    var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
    // Whether a single character denotes a newline.
    var newline = /[\n\r\u2028\u2029]/;
    // Matches a whole line break (where CRLF is considered a single
    // line break). Used to count lines.
    var lineBreak = /\r\n|[\n\r\u2028\u2029]/g;
    // Test whether a given character code starts an identifier.
    var isIdentifierStart = function(code) {
        if (code < 65) return code === 36;
        if (code < 91) return true;
        if (code < 97) return code === 95;
        if (code < 123) return true;
        return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
    };
    // Test whether a given character is part of an identifier.
    var isIdentifierChar = function(code) {
        if (code < 48) return code === 36;
        if (code < 58) return true;
        if (code < 65) return false;
        if (code < 91) return true;
        if (code < 97) return code === 95;
        if (code < 123) return true;
        return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
    };
    // ## Tokenizer
    // These are used when `options.locations` is on, for the
    // `tokStartLoc` and `tokEndLoc` properties.
    function line_loc_t() {
        this.line = tokCurLine;
        this.column = tokPos - tokLineStart;
    }
    // Reset the token state. Used at the start of a parse.
    function initTokenState() {
        tokCurLine = 1;
        tokPos = tokLineStart = 0;
        tokRegexpAllowed = true;
        skipSpace();
    }
    // Called at the end of every token. Sets `tokEnd`, `tokVal`, and
    // `tokRegexpAllowed`, and skips the space after the token, so that
    // the next one's `tokStart` will point at the right position.
    function finishToken(type, val) {
        tokEnd = tokPos;
        if (options.locations) tokEndLoc = new line_loc_t;
        tokType = type;
        skipSpace();
        tokVal = val;
        tokRegexpAllowed = type.beforeExpr;
    }
    function skipBlockComment() {
        var startLoc = options.onComment && options.locations && new line_loc_t;
        var start = tokPos, end = input.indexOf("*/", tokPos += 2);
        if (end === -1) raise(tokPos - 2, "Unterminated comment");
        tokPos = end + 2;
        if (options.locations) {
            lineBreak.lastIndex = start;
            var match;
            while((match = lineBreak.exec(input)) && match.index < tokPos){
                ++tokCurLine;
                tokLineStart = match.index + match[0].length;
            }
        }
        if (options.onComment) options.onComment(true, input.slice(start + 2, end), start, tokPos, startLoc, options.locations && new line_loc_t);
    }
    function skipLineComment() {
        var start = tokPos;
        var startLoc = options.onComment && options.locations && new line_loc_t;
        var ch = input.charCodeAt(tokPos += 2);
        while(tokPos < inputLen && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233){
            ++tokPos;
            ch = input.charCodeAt(tokPos);
        }
        if (options.onComment) options.onComment(false, input.slice(start + 2, tokPos), start, tokPos, startLoc, options.locations && new line_loc_t);
    }
    // Called at the start of the parse and after every token. Skips
    // whitespace and comments, and.
    function skipSpace() {
        while(tokPos < inputLen){
            var ch = input.charCodeAt(tokPos);
            if (ch === 32) ++tokPos;
            else if (ch === 13) {
                ++tokPos;
                var next = input.charCodeAt(tokPos);
                if (next === 10) ++tokPos;
                if (options.locations) {
                    ++tokCurLine;
                    tokLineStart = tokPos;
                }
            } else if (ch === 10 || ch === 8232 || ch === 8233) {
                ++tokPos;
                if (options.locations) {
                    ++tokCurLine;
                    tokLineStart = tokPos;
                }
            } else if (ch > 8 && ch < 14) ++tokPos;
            else if (ch === 47) {
                var next = input.charCodeAt(tokPos + 1);
                if (next === 42) skipBlockComment();
                else if (next === 47) skipLineComment();
                else break;
            } else if (ch === 160) ++tokPos;
            else if (ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) ++tokPos;
            else break;
        }
    }
    // ### Token reading
    // This is the function that is called to fetch the next token. It
    // is somewhat obscure, because it works in character codes rather
    // than characters, and because operator parsing has been inlined
    // into it.
    //
    // All in the name of speed.
    //
    // The `forceRegexp` parameter is used in the one case where the
    // `tokRegexpAllowed` trick does not work. See `parseStatement`.
    function readToken_dot() {
        var next = input.charCodeAt(tokPos + 1);
        if (next >= 48 && next <= 57) return readNumber(true);
        ++tokPos;
        return finishToken(_dot);
    }
    function readToken_slash() {
        var next = input.charCodeAt(tokPos + 1);
        if (tokRegexpAllowed) {
            ++tokPos;
            return readRegexp();
        }
        if (next === 61) return finishOp(_assign, 2);
        return finishOp(_slash, 1);
    }
    function readToken_mult_modulo() {
        var next = input.charCodeAt(tokPos + 1);
        if (next === 61) return finishOp(_assign, 2);
        return finishOp(_multiplyModulo, 1);
    }
    function readToken_pipe_amp(code) {
        var next = input.charCodeAt(tokPos + 1);
        if (next === code) return finishOp(code === 124 ? _logicalOR : _logicalAND, 2);
        if (next === 61) return finishOp(_assign, 2);
        return finishOp(code === 124 ? _bitwiseOR : _bitwiseAND, 1);
    }
    function readToken_caret() {
        var next = input.charCodeAt(tokPos + 1);
        if (next === 61) return finishOp(_assign, 2);
        return finishOp(_bitwiseXOR, 1);
    }
    function readToken_plus_min(code) {
        var next = input.charCodeAt(tokPos + 1);
        if (next === code) {
            if (next == 45 && input.charCodeAt(tokPos + 2) == 62 && newline.test(input.slice(lastEnd, tokPos))) {
                // A `-->` line comment
                tokPos += 3;
                skipLineComment();
                skipSpace();
                return readToken();
            }
            return finishOp(_incDec, 2);
        }
        if (next === 61) return finishOp(_assign, 2);
        return finishOp(_plusMin, 1);
    }
    function readToken_lt_gt(code) {
        var next = input.charCodeAt(tokPos + 1);
        var size = 1;
        if (next === code) {
            size = code === 62 && input.charCodeAt(tokPos + 2) === 62 ? 3 : 2;
            if (input.charCodeAt(tokPos + size) === 61) return finishOp(_assign, size + 1);
            return finishOp(_bitShift, size);
        }
        if (next == 33 && code == 60 && input.charCodeAt(tokPos + 2) == 45 && input.charCodeAt(tokPos + 3) == 45) {
            // `<!--`, an XML-style comment that should be interpreted as a line comment
            tokPos += 4;
            skipLineComment();
            skipSpace();
            return readToken();
        }
        if (next === 61) size = input.charCodeAt(tokPos + 2) === 61 ? 3 : 2;
        return finishOp(_relational, size);
    }
    function readToken_eq_excl(code) {
        var next = input.charCodeAt(tokPos + 1);
        if (next === 61) return finishOp(_equality, input.charCodeAt(tokPos + 2) === 61 ? 3 : 2);
        return finishOp(code === 61 ? _eq : _prefix, 1);
    }
    function getTokenFromCode(code) {
        switch(code){
            // The interpretation of a dot depends on whether it is followed
            // by a digit.
            case 46:
                return readToken_dot();
            // Punctuation tokens.
            case 40:
                ++tokPos;
                return finishToken(_parenL);
            case 41:
                ++tokPos;
                return finishToken(_parenR);
            case 59:
                ++tokPos;
                return finishToken(_semi);
            case 44:
                ++tokPos;
                return finishToken(_comma);
            case 91:
                ++tokPos;
                return finishToken(_bracketL);
            case 93:
                ++tokPos;
                return finishToken(_bracketR);
            case 123:
                ++tokPos;
                return finishToken(_braceL);
            case 125:
                ++tokPos;
                return finishToken(_braceR);
            case 58:
                ++tokPos;
                return finishToken(_colon);
            case 63:
                ++tokPos;
                return finishToken(_question);
            // '0x' is a hexadecimal number.
            case 48:
                var next = input.charCodeAt(tokPos + 1);
                if (next === 120 || next === 88) return readHexNumber();
            // Anything else beginning with a digit is an integer, octal
            // number, or float.
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
                return readNumber(false);
            // Quotes produce strings.
            case 34:
            case 39:
                return readString(code);
            // Operators are parsed inline in tiny state machines. '=' (61) is
            // often referred to. `finishOp` simply skips the amount of
            // characters it is given as second argument, and returns a token
            // of the type given by its first argument.
            case 47:
                return readToken_slash(code);
            case 37:
            case 42:
                return readToken_mult_modulo();
            case 124:
            case 38:
                return readToken_pipe_amp(code);
            case 94:
                return readToken_caret();
            case 43:
            case 45:
                return readToken_plus_min(code);
            case 60:
            case 62:
                return readToken_lt_gt(code);
            case 61:
            case 33:
                return readToken_eq_excl(code);
            case 126:
                return finishOp(_prefix, 1);
        }
        return false;
    }
    function readToken(forceRegexp) {
        if (!forceRegexp) tokStart = tokPos;
        else tokPos = tokStart + 1;
        if (options.locations) tokStartLoc = new line_loc_t;
        if (forceRegexp) return readRegexp();
        if (tokPos >= inputLen) return finishToken(_eof);
        var code = input.charCodeAt(tokPos);
        // Identifier or keyword. '\uXXXX' sequences are allowed in
        // identifiers, so '\' also dispatches to that.
        if (isIdentifierStart(code) || code === 92 /* '\' */ ) return readWord();
        var tok = getTokenFromCode(code);
        if (tok === false) {
            // If we are here, we either found a non-ASCII identifier
            // character, or something that's entirely disallowed.
            var ch = String.fromCharCode(code);
            if (ch === "\\" || nonASCIIidentifierStart.test(ch)) return readWord();
            raise(tokPos, "Unexpected character '" + ch + "'");
        }
        return tok;
    }
    function finishOp(type, size) {
        var str = input.slice(tokPos, tokPos + size);
        tokPos += size;
        finishToken(type, str);
    }
    // Parse a regular expression. Some context-awareness is necessary,
    // since a '/' inside a '[]' set does not end the expression.
    function readRegexp() {
        // JS-Interpreter change:
        // Removed redundant declaration of 'content' here.  Caused lint errors.
        // -- Neil Fraser, June 2022.
        var escaped, inClass, start = tokPos;
        for(;;){
            if (tokPos >= inputLen) raise(start, "Unterminated regular expression");
            var ch = input.charAt(tokPos);
            if (newline.test(ch)) raise(start, "Unterminated regular expression");
            if (!escaped) {
                if (ch === "[") inClass = true;
                else if (ch === "]" && inClass) inClass = false;
                else if (ch === "/" && !inClass) break;
                escaped = ch === "\\";
            } else escaped = false;
            ++tokPos;
        }
        var content = input.slice(start, tokPos);
        ++tokPos;
        // Need to use `readWord1` because '\uXXXX' sequences are allowed
        // here (don't ask).
        var mods = readWord1();
        // JS-Interpreter change:
        // Acorn used to use 'gmsiy' to check for flags.  But 's' and 'y' are ES6.
        // -- Neil Fraser, December 2022.
        // https://github.com/acornjs/acorn/issues/1163
        if (mods && !/^[gmi]*$/.test(mods)) raise(start, "Invalid regexp flag");
        try {
            var value = new RegExp(content, mods);
        } catch (e) {
            if (e instanceof SyntaxError) raise(start, e.message);
            raise(e);
        }
        return finishToken(_regexp, value);
    }
    // Read an integer in the given radix. Return null if zero digits
    // were read, the integer value otherwise. When `len` is given, this
    // will return `null` unless the integer has exactly `len` digits.
    function readInt(radix, len) {
        var start = tokPos, total = 0;
        for(var i = 0, e = len == null ? Infinity : len; i < e; ++i){
            var code = input.charCodeAt(tokPos), val;
            if (code >= 97) val = code - 97 + 10; // a
            else if (code >= 65) val = code - 65 + 10; // A
            else if (code >= 48 && code <= 57) val = code - 48; // 0-9
            else val = Infinity;
            if (val >= radix) break;
            ++tokPos;
            total = total * radix + val;
        }
        if (tokPos === start || len != null && tokPos - start !== len) return null;
        return total;
    }
    function readHexNumber() {
        tokPos += 2; // 0x
        var val = readInt(16);
        if (val == null) raise(tokStart + 2, "Expected hexadecimal number");
        if (isIdentifierStart(input.charCodeAt(tokPos))) raise(tokPos, "Identifier directly after number");
        return finishToken(_num, val);
    }
    // Read an integer, octal integer, or floating-point number.
    function readNumber(startsWithDot) {
        var start = tokPos, isFloat = false, octal = input.charCodeAt(tokPos) === 48;
        if (!startsWithDot && readInt(10) === null) raise(start, "Invalid number");
        if (input.charCodeAt(tokPos) === 46) {
            ++tokPos;
            readInt(10);
            isFloat = true;
        }
        var next = input.charCodeAt(tokPos);
        if (next === 69 || next === 101) {
            next = input.charCodeAt(++tokPos);
            if (next === 43 || next === 45) ++tokPos; // '+-'
            if (readInt(10) === null) raise(start, "Invalid number");
            isFloat = true;
        }
        if (isIdentifierStart(input.charCodeAt(tokPos))) raise(tokPos, "Identifier directly after number");
        var str = input.slice(start, tokPos), val;
        if (isFloat) val = parseFloat(str);
        else if (!octal || str.length === 1) val = parseInt(str, 10);
        else if (/[89]/.test(str) || strict) raise(start, "Invalid number");
        else val = parseInt(str, 8);
        return finishToken(_num, val);
    }
    // Read a string value, interpreting backslash-escapes.
    function readString(quote) {
        tokPos++;
        var out = "";
        for(;;){
            if (tokPos >= inputLen) raise(tokStart, "Unterminated string constant");
            var ch = input.charCodeAt(tokPos);
            if (ch === quote) {
                ++tokPos;
                return finishToken(_string, out);
            }
            if (ch === 92) {
                ch = input.charCodeAt(++tokPos);
                var octal = /^[0-7]+/.exec(input.slice(tokPos, tokPos + 3));
                if (octal) octal = octal[0];
                while(octal && parseInt(octal, 8) > 255)octal = octal.slice(0, -1);
                if (octal === "0") octal = null;
                ++tokPos;
                if (octal) {
                    if (strict) raise(tokPos - 2, "Octal literal in strict mode");
                    out += String.fromCharCode(parseInt(octal, 8));
                    tokPos += octal.length - 1;
                } else switch(ch){
                    case 110:
                        out += "\n";
                        break; // 'n' -> '\n'
                    case 114:
                        out += "\r";
                        break; // 'r' -> '\r'
                    case 120:
                        out += String.fromCharCode(readHexChar(2));
                        break; // 'x'
                    case 117:
                        out += String.fromCharCode(readHexChar(4));
                        break; // 'u'
                    case 85:
                        out += String.fromCharCode(readHexChar(8));
                        break; // 'U'
                    case 116:
                        out += "	";
                        break; // 't' -> '\t'
                    case 98:
                        out += "\b";
                        break; // 'b' -> '\b'
                    case 118:
                        out += "\v";
                        break; // 'v' -> '\u000b'
                    case 102:
                        out += "\f";
                        break; // 'f' -> '\f'
                    case 48:
                        out += "\0";
                        break; // 0 -> '\0'
                    case 13:
                        if (input.charCodeAt(tokPos) === 10) ++tokPos; // '\r\n'
                    case 10:
                        if (options.locations) {
                            tokLineStart = tokPos;
                            ++tokCurLine;
                        }
                        break;
                    default:
                        out += String.fromCharCode(ch);
                        break;
                }
            } else {
                if (ch === 13 || ch === 10 || ch === 8232 || ch === 8233) raise(tokStart, "Unterminated string constant");
                out += String.fromCharCode(ch); // '\'
                ++tokPos;
            }
        }
    }
    // Used to read character escape sequences ('\x', '\u', '\U').
    function readHexChar(len) {
        var n = readInt(16, len);
        if (n === null) raise(tokStart, "Bad character escape sequence");
        return n;
    }
    // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.
    var containsEsc;
    // Read an identifier, and return it as a string. Sets `containsEsc`
    // to whether the word contained a '\u' escape.
    //
    // Only builds up the word character-by-character when it actually
    // containeds an escape, as a micro-optimization.
    function readWord1() {
        containsEsc = false;
        var word, first = true, start = tokPos;
        for(;;){
            var ch = input.charCodeAt(tokPos);
            if (isIdentifierChar(ch)) {
                if (containsEsc) word += input.charAt(tokPos);
                ++tokPos;
            } else if (ch === 92) {
                if (!containsEsc) word = input.slice(start, tokPos);
                containsEsc = true;
                if (input.charCodeAt(++tokPos) != 117) raise(tokPos, "Expecting Unicode escape sequence \\uXXXX");
                ++tokPos;
                var esc = readHexChar(4);
                var escStr = String.fromCharCode(esc);
                if (!escStr) raise(tokPos - 1, "Invalid Unicode escape");
                if (!(first ? isIdentifierStart(esc) : isIdentifierChar(esc))) raise(tokPos - 4, "Invalid Unicode escape");
                word += escStr;
            } else break;
            first = false;
        }
        return containsEsc ? word : input.slice(start, tokPos);
    }
    // Read an identifier or keyword token. Will check for reserved
    // words when necessary.
    function readWord() {
        var word = readWord1();
        var type = _name;
        if (!containsEsc && isKeyword(word)) type = keywordTypes[word];
        return finishToken(type, word);
    }
    // ## Parser
    // A recursive descent parser operates by defining functions for all
    // syntactic elements, and recursively calling those, each function
    // advancing the input stream and returning an AST node. Precedence
    // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
    // instead of `(!x)[1]` is handled by the fact that the parser
    // function that parses unary prefix operators is called first, and
    // in turn calls the function that parses `[]` subscripts — that
    // way, it'll receive the node for `x[1]` already parsed, and wraps
    // *that* in the unary operator node.
    //
    // Acorn uses an [operator precedence parser][opp] to handle binary
    // operator precedence, because it is much more compact than using
    // the technique outlined above, which uses different, nesting
    // functions to specify precedence, for all of the ten binary
    // precedence levels that JavaScript defines.
    //
    // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser
    // ### Parser utilities
    // Continue to the next token.
    function next() {
        lastStart = tokStart;
        lastEnd = tokEnd;
        lastEndLoc = tokEndLoc;
        readToken();
    }
    // Enter strict mode. Re-reads the next token to please pedantic
    // tests ("use strict"; 010; -- should fail).
    function setStrict(strct) {
        strict = strct;
        tokPos = tokStart;
        if (options.locations) while(tokPos < tokLineStart){
            tokLineStart = input.lastIndexOf("\n", tokLineStart - 2) + 1;
            --tokCurLine;
        }
        skipSpace();
        readToken();
    }
    // Start an AST node, attaching a start offset.
    function node_t() {
        this.type = null;
        this.start = tokStart;
        this.end = null;
    }
    function node_loc_t() {
        this.start = tokStartLoc;
        this.end = null;
        if (sourceFile !== null) this.source = sourceFile;
    }
    function startNode() {
        var node = new node_t();
        if (options.locations) node.loc = new node_loc_t();
        if (options.directSourceFile) node.sourceFile = options.directSourceFile;
        if (options.ranges) node.range = [
            tokStart,
            0
        ];
        return node;
    }
    // Start a node whose start offset information should be based on
    // the start of another node. For example, a binary operator node is
    // only started after its left-hand side has already been parsed.
    function startNodeFrom(other) {
        var node = new node_t();
        node.start = other.start;
        if (options.locations) {
            node.loc = new node_loc_t();
            node.loc.start = other.loc.start;
        }
        if (options.ranges) node.range = [
            other.range[0],
            0
        ];
        return node;
    }
    // Finish an AST node, adding `type` and `end` properties.
    function finishNode(node, type) {
        node.type = type;
        node.end = lastEnd;
        if (options.locations) node.loc.end = lastEndLoc;
        if (options.ranges) node.range[1] = lastEnd;
        return node;
    }
    // Test whether a statement node is the string literal `"use strict"`.
    function isUseStrict(stmt) {
        return stmt.type === "ExpressionStatement" && stmt.expression.type === "Literal" && stmt.expression.value === "use strict";
    }
    // Predicate that tests whether the next token is of the given
    // type, and if yes, consumes it as a side effect.
    function eat(type) {
        if (tokType === type) {
            next();
            return true;
        }
    }
    // Test whether a semicolon can be inserted at the current position.
    function canInsertSemicolon() {
        return !options.strictSemicolons && (tokType === _eof || tokType === _braceR || newline.test(input.slice(lastEnd, tokStart)));
    }
    // Consume a semicolon, or, failing that, see if we are allowed to
    // pretend that there is a semicolon at this position.
    function semicolon() {
        if (!eat(_semi) && !canInsertSemicolon()) unexpected();
    }
    // Expect a token of a given type. If found, consume it, otherwise,
    // raise an unexpected token error.
    function expect(type) {
        if (tokType === type) next();
        else unexpected();
    }
    // Raise an unexpected token error.
    function unexpected() {
        raise(tokStart, "Unexpected token");
    }
    // Verify that a node is an lval — something that can be assigned
    // to.
    function checkLVal(expr) {
        if (expr.type !== "Identifier" && expr.type !== "MemberExpression") raise(expr.start, "Assigning to rvalue");
        if (strict && expr.type === "Identifier" && isStrictBadIdWord(expr.name)) raise(expr.start, "Assigning to " + expr.name + " in strict mode");
    }
    // ### Statement parsing
    // Parse a program. Initializes the parser, reads any number of
    // statements, and wraps them in a Program node.  Optionally takes a
    // `program` argument.  If present, the statements will be appended
    // to its body instead of creating a new node.
    function parseTopLevel(program) {
        lastStart = lastEnd = tokPos;
        if (options.locations) lastEndLoc = new line_loc_t;
        inFunction = strict = null;
        labels = [];
        readToken();
        var node = program || startNode(), first = true;
        if (!program) node.body = [];
        while(tokType !== _eof){
            var stmt = parseStatement();
            node.body.push(stmt);
            if (first && isUseStrict(stmt)) setStrict(true);
            first = false;
        }
        return finishNode(node, "Program");
    }
    var loopLabel = {
        kind: "loop"
    }, switchLabel = {
        kind: "switch"
    };
    // Parse a single statement.
    //
    // If expecting a statement and finding a slash operator, parse a
    // regular expression literal. This is to handle cases like
    // `if (foo) /blah/.exec(foo);`, where looking at the previous token
    // does not help.
    function parseStatement() {
        if (tokType === _slash || tokType === _assign && tokVal == "/=") readToken(true);
        var starttype = tokType, node = startNode();
        // Most types of statements are recognized by the keyword they
        // start with. Many are trivial to parse, some require a bit of
        // complexity.
        switch(starttype){
            case _break:
            case _continue:
                next();
                var isBreak = starttype === _break;
                if (eat(_semi) || canInsertSemicolon()) node.label = null;
                else if (tokType !== _name) unexpected();
                else {
                    node.label = parseIdent();
                    semicolon();
                }
                // Verify that there is an actual destination to break or
                // continue to.
                for(var i = 0; i < labels.length; ++i){
                    var lab = labels[i];
                    if (node.label == null || lab.name === node.label.name) {
                        if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
                        if (node.label && isBreak) break;
                    }
                }
                if (i === labels.length) raise(node.start, "Unsyntactic " + starttype.keyword);
                return finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
            case _debugger:
                next();
                semicolon();
                return finishNode(node, "DebuggerStatement");
            case _do:
                next();
                labels.push(loopLabel);
                node.body = parseStatement();
                labels.pop();
                expect(_while);
                node.test = parseParenExpression();
                semicolon();
                return finishNode(node, "DoWhileStatement");
            // Disambiguating between a `for` and a `for`/`in` loop is
            // non-trivial. Basically, we have to parse the init `var`
            // statement or expression, disallowing the `in` operator (see
            // the second parameter to `parseExpression`), and then check
            // whether the next token is `in`. When there is no init part
            // (semicolon immediately after the opening parenthesis), it is
            // a regular `for` loop.
            case _for:
                next();
                labels.push(loopLabel);
                expect(_parenL);
                if (tokType === _semi) return parseFor(node, null);
                if (tokType === _var) {
                    var init = startNode();
                    next();
                    parseVar(init, true);
                    finishNode(init, "VariableDeclaration");
                    if (init.declarations.length === 1 && eat(_in)) return parseForIn(node, init);
                    return parseFor(node, init);
                }
                var init = parseExpression(false, true);
                if (eat(_in)) {
                    checkLVal(init);
                    return parseForIn(node, init);
                }
                return parseFor(node, init);
            case _function:
                next();
                return parseFunction(node, true);
            case _if:
                next();
                node.test = parseParenExpression();
                node.consequent = parseStatement();
                node.alternate = eat(_else) ? parseStatement() : null;
                return finishNode(node, "IfStatement");
            case _return:
                if (!inFunction && !options.allowReturnOutsideFunction) raise(tokStart, "'return' outside of function");
                next();
                // In `return` (and `break`/`continue`), the keywords with
                // optional arguments, we eagerly look for a semicolon or the
                // possibility to insert one.
                if (eat(_semi) || canInsertSemicolon()) node.argument = null;
                else {
                    node.argument = parseExpression();
                    semicolon();
                }
                return finishNode(node, "ReturnStatement");
            case _switch:
                next();
                node.discriminant = parseParenExpression();
                node.cases = [];
                expect(_braceL);
                labels.push(switchLabel);
                // Statements under must be grouped (by label) in SwitchCase
                // nodes. `cur` is used to keep the node that we are currently
                // adding statements to.
                for(var cur, sawDefault; tokType != _braceR;)if (tokType === _case || tokType === _default) {
                    var isCase = tokType === _case;
                    if (cur) finishNode(cur, "SwitchCase");
                    node.cases.push(cur = startNode());
                    cur.consequent = [];
                    next();
                    if (isCase) cur.test = parseExpression();
                    else {
                        if (sawDefault) raise(lastStart, "Multiple default clauses");
                        sawDefault = true;
                        cur.test = null;
                    }
                    expect(_colon);
                } else {
                    if (!cur) unexpected();
                    cur.consequent.push(parseStatement());
                }
                if (cur) finishNode(cur, "SwitchCase");
                next(); // Closing brace
                labels.pop();
                return finishNode(node, "SwitchStatement");
            case _throw:
                next();
                if (newline.test(input.slice(lastEnd, tokStart))) raise(lastEnd, "Illegal newline after throw");
                node.argument = parseExpression();
                semicolon();
                return finishNode(node, "ThrowStatement");
            case _try:
                next();
                node.block = parseBlock();
                node.handler = null;
                if (tokType === _catch) {
                    var clause = startNode();
                    next();
                    expect(_parenL);
                    clause.param = parseIdent();
                    if (strict && isStrictBadIdWord(clause.param.name)) raise(clause.param.start, "Binding " + clause.param.name + " in strict mode");
                    expect(_parenR);
                    // JS-Interpreter change:
                    // Obsolete unused property; commenting out.
                    // -- Neil Fraser, January 2023.
                    // clause.guard = null;
                    clause.body = parseBlock();
                    node.handler = finishNode(clause, "CatchClause");
                }
                // JS-Interpreter change:
                // Obsolete unused property; commenting out.
                // -- Neil Fraser, January 2023.
                // node.guardedHandlers = empty;
                node.finalizer = eat(_finally) ? parseBlock() : null;
                if (!node.handler && !node.finalizer) raise(node.start, "Missing catch or finally clause");
                return finishNode(node, "TryStatement");
            case _var:
                next();
                parseVar(node);
                semicolon();
                return finishNode(node, "VariableDeclaration");
            case _while:
                next();
                node.test = parseParenExpression();
                labels.push(loopLabel);
                node.body = parseStatement();
                labels.pop();
                return finishNode(node, "WhileStatement");
            case _with:
                if (strict) raise(tokStart, "'with' in strict mode");
                next();
                node.object = parseParenExpression();
                node.body = parseStatement();
                return finishNode(node, "WithStatement");
            case _braceL:
                return parseBlock();
            case _semi:
                next();
                return finishNode(node, "EmptyStatement");
            // If the statement does not start with a statement keyword or a
            // brace, it's an ExpressionStatement or LabeledStatement. We
            // simply start parsing an expression, and afterwards, if the
            // next token is a colon and the expression was a simple
            // Identifier node, we switch to interpreting it as a label.
            default:
                var maybeName = tokVal, expr = parseExpression();
                if (starttype === _name && expr.type === "Identifier" && eat(_colon)) {
                    for(var i = 0; i < labels.length; ++i)if (labels[i].name === maybeName) raise(expr.start, "Label '" + maybeName + "' is already declared");
                    var kind = tokType.isLoop ? "loop" : tokType === _switch ? "switch" : null;
                    labels.push({
                        name: maybeName,
                        kind: kind
                    });
                    node.body = parseStatement();
                    labels.pop();
                    node.label = expr;
                    return finishNode(node, "LabeledStatement");
                } else {
                    node.expression = expr;
                    semicolon();
                    return finishNode(node, "ExpressionStatement");
                }
        }
    }
    // Used for constructs like `switch` and `if` that insist on
    // parentheses around their expression.
    function parseParenExpression() {
        expect(_parenL);
        var val = parseExpression();
        expect(_parenR);
        return val;
    }
    // Parse a semicolon-enclosed block of statements, handling `"use
    // strict"` declarations when `allowStrict` is true (used for
    // function bodies).
    function parseBlock(allowStrict) {
        var node = startNode(), first = true, strict = false, oldStrict;
        node.body = [];
        expect(_braceL);
        while(!eat(_braceR)){
            var stmt = parseStatement();
            node.body.push(stmt);
            if (first && allowStrict && isUseStrict(stmt)) {
                oldStrict = strict;
                setStrict(strict = true);
            }
            first = false;
        }
        if (strict && !oldStrict) setStrict(false);
        return finishNode(node, "BlockStatement");
    }
    // Parse a regular `for` loop. The disambiguation code in
    // `parseStatement` will already have parsed the init statement or
    // expression.
    function parseFor(node, init) {
        node.init = init;
        expect(_semi);
        node.test = tokType === _semi ? null : parseExpression();
        expect(_semi);
        node.update = tokType === _parenR ? null : parseExpression();
        expect(_parenR);
        node.body = parseStatement();
        labels.pop();
        return finishNode(node, "ForStatement");
    }
    // Parse a `for`/`in` loop.
    function parseForIn(node, init) {
        node.left = init;
        node.right = parseExpression();
        expect(_parenR);
        node.body = parseStatement();
        labels.pop();
        return finishNode(node, "ForInStatement");
    }
    // Parse a list of variable declarations.
    function parseVar(node, noIn) {
        node.declarations = [];
        node.kind = "var";
        for(;;){
            var decl = startNode();
            decl.id = parseIdent();
            if (strict && isStrictBadIdWord(decl.id.name)) raise(decl.id.start, "Binding " + decl.id.name + " in strict mode");
            decl.init = eat(_eq) ? parseExpression(true, noIn) : null;
            node.declarations.push(finishNode(decl, "VariableDeclarator"));
            if (!eat(_comma)) break;
        }
        return node;
    }
    // ### Expression parsing
    // These nest, from the most general expression type at the top to
    // 'atomic', nondivisible expression types at the bottom. Most of
    // the functions will simply let the function(s) below them parse,
    // and, *if* the syntactic construct they handle is present, wrap
    // the AST node that the inner parser gave them in another node.
    // Parse a full expression. The arguments are used to forbid comma
    // sequences (in argument lists, array literals, or object literals)
    // or the `in` operator (in for loops initalization expressions).
    function parseExpression(noComma, noIn) {
        var expr = parseMaybeAssign(noIn);
        if (!noComma && tokType === _comma) {
            var node = startNodeFrom(expr);
            node.expressions = [
                expr
            ];
            while(eat(_comma))node.expressions.push(parseMaybeAssign(noIn));
            return finishNode(node, "SequenceExpression");
        }
        return expr;
    }
    // Parse an assignment expression. This includes applications of
    // operators like `+=`.
    function parseMaybeAssign(noIn) {
        var left = parseMaybeConditional(noIn);
        if (tokType.isAssign) {
            var node = startNodeFrom(left);
            node.operator = tokVal;
            node.left = left;
            next();
            node.right = parseMaybeAssign(noIn);
            checkLVal(left);
            return finishNode(node, "AssignmentExpression");
        }
        return left;
    }
    // Parse a ternary conditional (`?:`) operator.
    function parseMaybeConditional(noIn) {
        var expr = parseExprOps(noIn);
        if (eat(_question)) {
            var node = startNodeFrom(expr);
            node.test = expr;
            node.consequent = parseExpression(true);
            expect(_colon);
            node.alternate = parseExpression(true, noIn);
            return finishNode(node, "ConditionalExpression");
        }
        return expr;
    }
    // Start the precedence parser.
    function parseExprOps(noIn) {
        return parseExprOp(parseMaybeUnary(), -1, noIn);
    }
    // Parse binary operators with the operator precedence parsing
    // algorithm. `left` is the left-hand side of the operator.
    // `minPrec` provides context that allows the function to stop and
    // defer further parser to one of its callers when it encounters an
    // operator that has a lower precedence than the set it is parsing.
    function parseExprOp(left, minPrec, noIn) {
        var prec = tokType.binop;
        if (prec != null && (!noIn || tokType !== _in)) {
            if (prec > minPrec) {
                var node = startNodeFrom(left);
                node.left = left;
                node.operator = tokVal;
                var op = tokType;
                next();
                node.right = parseExprOp(parseMaybeUnary(), prec, noIn);
                var exprNode = finishNode(node, op === _logicalOR || op === _logicalAND ? "LogicalExpression" : "BinaryExpression");
                return parseExprOp(exprNode, minPrec, noIn);
            }
        }
        return left;
    }
    // Parse unary operators, both prefix and postfix.
    function parseMaybeUnary() {
        if (tokType.prefix) {
            var node = startNode(), update = tokType.isUpdate;
            node.operator = tokVal;
            node.prefix = true;
            tokRegexpAllowed = true;
            next();
            node.argument = parseMaybeUnary();
            if (update) checkLVal(node.argument);
            else if (strict && node.operator === "delete" && node.argument.type === "Identifier") raise(node.start, "Deleting local variable in strict mode");
            return finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
        }
        var expr = parseExprSubscripts();
        while(tokType.postfix && !canInsertSemicolon()){
            var node = startNodeFrom(expr);
            node.operator = tokVal;
            node.prefix = false;
            node.argument = expr;
            checkLVal(expr);
            next();
            expr = finishNode(node, "UpdateExpression");
        }
        return expr;
    }
    // Parse call, dot, and `[]`-subscript expressions.
    function parseExprSubscripts() {
        return parseSubscripts(parseExprAtom());
    }
    function parseSubscripts(base, noCalls) {
        if (eat(_dot)) {
            var node = startNodeFrom(base);
            node.object = base;
            node.property = parseIdent(true);
            node.computed = false;
            return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
        } else if (eat(_bracketL)) {
            var node = startNodeFrom(base);
            node.object = base;
            node.property = parseExpression();
            node.computed = true;
            expect(_bracketR);
            return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
        } else if (!noCalls && eat(_parenL)) {
            var node = startNodeFrom(base);
            node.callee = base;
            node.arguments = parseExprList(_parenR, false);
            return parseSubscripts(finishNode(node, "CallExpression"), noCalls);
        } else return base;
    }
    // Parse an atomic expression — either a single token that is an
    // expression, an expression started by a keyword like `function` or
    // `new`, or an expression wrapped in punctuation like `()`, `[]`,
    // or `{}`.
    function parseExprAtom() {
        switch(tokType){
            case _this:
                var node = startNode();
                next();
                return finishNode(node, "ThisExpression");
            case _name:
                return parseIdent();
            case _num:
            case _string:
            case _regexp:
                var node = startNode();
                node.value = tokVal;
                node.raw = input.slice(tokStart, tokEnd);
                next();
                return finishNode(node, "Literal");
            case _null:
            case _true:
            case _false:
                var node = startNode();
                node.value = tokType.atomValue;
                node.raw = tokType.keyword;
                next();
                return finishNode(node, "Literal");
            case _parenL:
                var tokStartLoc1 = tokStartLoc, tokStart1 = tokStart;
                next();
                var val = parseExpression();
                val.start = tokStart1;
                val.end = tokEnd;
                if (options.locations) {
                    val.loc.start = tokStartLoc1;
                    val.loc.end = tokEndLoc;
                }
                if (options.ranges) val.range = [
                    tokStart1,
                    tokEnd
                ];
                expect(_parenR);
                return val;
            case _bracketL:
                var node = startNode();
                next();
                node.elements = parseExprList(_bracketR, true, true);
                return finishNode(node, "ArrayExpression");
            case _braceL:
                return parseObj();
            case _function:
                var node = startNode();
                next();
                return parseFunction(node, false);
            case _new:
                return parseNew();
            default:
                unexpected();
        }
    }
    // New's precedence is slightly tricky. It must allow its argument
    // to be a `[]` or dot subscript expression, but not a call — at
    // least, not without wrapping it in parentheses. Thus, it uses the
    function parseNew() {
        var node = startNode();
        next();
        node.callee = parseSubscripts(parseExprAtom(), true);
        if (eat(_parenL)) node.arguments = parseExprList(_parenR, false);
        else node.arguments = empty;
        return finishNode(node, "NewExpression");
    }
    // Parse an object literal.
    function parseObj() {
        var node = startNode(), first = true, sawGetSet = false;
        node.properties = [];
        next();
        while(!eat(_braceR)){
            if (!first) {
                expect(_comma);
                if (options.allowTrailingCommas && eat(_braceR)) break;
            } else first = false;
            var prop = {
                key: parsePropertyName()
            }, isGetSet = false, kind;
            if (eat(_colon)) {
                prop.value = parseExpression(true);
                kind = prop.kind = "init";
            } else if (prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set")) {
                isGetSet = sawGetSet = true;
                kind = prop.kind = prop.key.name;
                prop.key = parsePropertyName();
                if (tokType !== _parenL) unexpected();
                prop.value = parseFunction(startNode(), false);
            } else unexpected();
            // getters and setters are not allowed to clash — either with
            // each other or with an init property — and in strict mode,
            // init properties are also not allowed to be repeated.
            if (prop.key.type === "Identifier" && (strict || sawGetSet)) for(var i = 0; i < node.properties.length; ++i){
                var other = node.properties[i];
                if (other.key.name === prop.key.name) {
                    var conflict = kind == other.kind || isGetSet && other.kind === "init" || kind === "init" && (other.kind === "get" || other.kind === "set");
                    if (conflict && !strict && kind === "init" && other.kind === "init") conflict = false;
                    if (conflict) raise(prop.key.start, "Redefinition of property");
                }
            }
            node.properties.push(prop);
        }
        return finishNode(node, "ObjectExpression");
    }
    function parsePropertyName() {
        if (tokType === _num || tokType === _string) return parseExprAtom();
        return parseIdent(true);
    }
    // Parse a function declaration or literal (depending on the
    // `isStatement` parameter).
    function parseFunction(node, isStatement) {
        if (tokType === _name) node.id = parseIdent();
        else if (isStatement) unexpected();
        else node.id = null;
        node.params = [];
        var first = true;
        expect(_parenL);
        while(!eat(_parenR)){
            if (!first) expect(_comma);
            else first = false;
            node.params.push(parseIdent());
        }
        // Start a new scope with regard to labels and the `inFunction`
        // flag (restore them to their old value afterwards).
        var oldInFunc = inFunction, oldLabels = labels;
        inFunction = true;
        labels = [];
        node.body = parseBlock(true);
        inFunction = oldInFunc;
        labels = oldLabels;
        // If this is a strict mode function, verify that argument names
        // are not repeated, and it does not try to bind the words `eval`
        // or `arguments`.
        if (strict || node.body.body.length && isUseStrict(node.body.body[0])) for(var i = node.id ? -1 : 0; i < node.params.length; ++i){
            var id = i < 0 ? node.id : node.params[i];
            if (isStrictReservedWord(id.name) || isStrictBadIdWord(id.name)) raise(id.start, "Defining '" + id.name + "' in strict mode");
            if (i >= 0) {
                for(var j = 0; j < i; ++j)if (id.name === node.params[j].name) raise(id.start, "Argument name clash in strict mode");
            }
        }
        return finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
    }
    // Parses a comma-separated list of expressions, and returns them as
    // an array. `close` is the token type that ends the list, and
    // `allowEmpty` can be turned on to allow subsequent commas with
    // nothing in between them to be parsed as `null` (which is needed
    // for array literals).
    function parseExprList(close, allowTrailingComma, allowEmpty) {
        var elts = [], first = true;
        while(!eat(close)){
            if (!first) {
                expect(_comma);
                if (allowTrailingComma && options.allowTrailingCommas && eat(close)) break;
            } else first = false;
            if (allowEmpty && tokType === _comma) elts.push(null);
            else elts.push(parseExpression(true));
        }
        return elts;
    }
    // Parse the next token as an identifier. If `liberal` is true (used
    // when parsing properties), it will also convert keywords into
    // identifiers.
    function parseIdent(liberal) {
        var node = startNode();
        if (liberal && options.forbidReserved == "everywhere") liberal = false;
        if (tokType === _name) {
            if (!liberal && (options.forbidReserved && isReservedWord5(tokVal) || strict && isStrictReservedWord(tokVal)) && input.slice(tokStart, tokEnd).indexOf("\\") == -1) raise(tokStart, "The keyword '" + tokVal + "' is reserved");
            node.name = tokVal;
        } else if (liberal && tokType.keyword) node.name = tokType.keyword;
        else unexpected();
        tokRegexpAllowed = false;
        next();
        return finishNode(node, "Identifier");
    }
});

//# sourceMappingURL=index.2e799f30.js.map
