export const TYPE_EMPTY = '_empty_';
export const TYPE_LITERAL = '_literal_';
export const TYPE_FUNC = '_func_';
export const TYPE_STRING = '_string_';

export class AstBuilder {

  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;

    this.elements = [];
    this.errors = [];
    this.failed = false;
  }

  peek() {
    if (this.position >= this.tokens.length) {
      return false;
    }

    return this.tokens[this.position];
  }

  next() {
    this.position++;

    return this.peek();
  }

  back() {
    this.position--;
    return this.peek();
  }

  build() {
    let token = this.peek();

    while (token !== false) {
      switch (token.token) {
        case '(':
          this.elements.push(this.consumeElement());
          break;
        case ')':
          this.errors.push({
            message: 'Зайва закриваюча дужка, пропускаю',
            line: token.line,
            offset: token.line
          });
          break;
        case '"':
          this.consumeString();
          this.errors.push({
            message: 'Неочікуваний текстовий рядок, пропускаю',
            line: token.line,
            offset: token.line
          });
          break;
        default:
          this.errors.push({
            message: 'неочікуваний токен «' + token.token + '» очікую «(»',
            line: token.line,
            offset: token.line
          });
          this.failed = true;
          break;
      }
      token = this.next();
    }

    return {
      elements: this.elements,
      errors: this.errors
    };
  }

  consumeString() {
    let {line, offset} = this.peek();

    let string = this.next();
    let closing = this.next();
    if (closing.token != '"') {
      this.errors.push({
        message: 'Відсутні закриваючі лапки, виправлено',
        line: closing ? closing.line : (string ? string.line  : line),
        offset: closing ? closing.offset : (string ? string.offset + string.token.length : offset),
      });
      this.back();
    }

    return {
      type: TYPE_STRING,
      token: string.token,
      line,
      offset
    };
  }

  consumeElement() {
    let {line, offset} = this.peek();
    let headToken = this.next();

    if (headToken === false) {
      this.errors.push({
        message: 'Відсутня закриваюча дужка, виправлено',
        line,
        offset
      });
      return {
        type: TYPE_EMPTY,
        line,
        offset
      };
    }

    if (headToken.token == ')') {
      return {
        type: TYPE_EMPTY,
        line,
        offset
      };
    }

    if (headToken.token == '"') {
      return this.consumeString();
    }

    let tailFirst = this.next();
    if (tailFirst.token == ')') {
      if(/^[0-9]*$/.test(headToken.token)) {
        return {
          type: TYPE_LITERAL,
          token: parseInt(headToken.token),
          line,
          offset
        };
      }
      if (/^[0-9]*\.[0-9]*$/.test(headToken.token)) {
        return {
          type: TYPE_LITERAL,
          token: parseFloat(headToken.token),
          line,
          offset
        };
      }
      return {
        type: TYPE_FUNC,
        token: headToken.token,
        name: headToken.token,
        line,
        offset
      };
    }

    let tail = [];

    let token = tailFirst;
    let lastToken = token;
    while (token !== false) {
      switch (token.token) {
        case ')':
          return {
            type: TYPE_FUNC,
            token: headToken.token,
            name: headToken.token,
            args: tail,
            line,
            offset
          };
        case '(':
          tail.push(this.consumeElement());
          break;
        case '"':
          tail.push(this.consumeString());
          break;
        default:
          if(/^[0-9]*$/.test(token.token)) {
            tail.push({
              type: TYPE_LITERAL,
              token: parseInt(token.token),
              line,
              offset
            });
          } else if (/^[0-9]*\.[0-9]*$/.test(token.token)) {
            return {
              type: TYPE_LITERAL,
              token: parseFloat(token.token),
              line,
              offset
            };
          } else {
            tail.push(
              {...token, type: TYPE_LITERAL}
            );
          }
      }

      lastToken = token;
      token = this.next();
    }

    this.errors.push({
      message: 'Відсутня закриваюча дужка, виправлено',
      line: lastToken ? lastToken.line : (headToken ? headToken.line : line),
      offset: lastToken ? lastToken.offset : (headToken ? headToken.offset : offset),
    });

    return {
      type: TYPE_FUNC,
      name: headToken.token,
      args: tail,
      line,
      offset
    };
  }
}

export default function buildAst(tokens) {
  let builder = new AstBuilder(tokens);

  return builder.build();
}
