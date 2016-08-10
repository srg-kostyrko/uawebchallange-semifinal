export class Lexer {
  constructor(input) {
    this.symbols = input.length ? input.split('') : [];
    this.position = 0;
    this.line = 1;
    this.offset = 1;

    this.tokens = [];

    this.token = [];

    this.notTokenized = new RegExp('[ \\n\\r\\t]');
  }

  peek() {
    if (this.position >= this.symbols.length) {
      return false;
    }
    return this.symbols[this.position];
  }

  next() {
    this.position++;
    return this.peek();
  }

  consumeToken() {
    if (this.token.length > 0) {
      this.tokens.push({
        token: this.token.join(''),
        line: this.line,
        offset: this.offset
      });
      this.offset += this.token.length;
      this.token = [];
    }
  }

  isNotTokenized(symbol) {
    return this.notTokenized.test(symbol);
  }

  consumeString() {
    let symbol = this.peek();
    while (symbol !== false) {
      switch (symbol) {
        case '"':
          if (this.token.length == 0) {
            this.token.push('');
          }
          this.consumeToken();
          this.token.push(symbol);
          this.consumeToken();
          return;
        case '\n':
          this.line++;
          this.offset++;
          /** falls through */
        default:
          this.token.push(symbol);
      }

      symbol = this.next();
    }
  }

  tokenize() {
    let symbol = this.peek();

    while (symbol !== false) {
      switch (symbol) {
        case '(':
        case ')':
          this.consumeToken();
          this.token.push(symbol);
          this.consumeToken();
          break;
        case '\n':
          this.line++;
          this.offset = 1;
          break;
        case '"':
          this.consumeToken();
          this.token.push(symbol);
          this.consumeToken();
          this.next();
          this.consumeString();
          break;
        default:
          if (this.isNotTokenized(symbol)) {
            this.consumeToken();
            this.offset++;
          } else {
            this.token.push(symbol);
          }
      }

      symbol = this.next();
    }
    this.consumeToken();

    return this.tokens;
  }
}

export default function tokenize(input) {
  let lexer = new Lexer(input);
  return lexer.tokenize();
}
