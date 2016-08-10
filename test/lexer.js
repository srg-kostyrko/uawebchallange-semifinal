import {expect} from 'chai';
import tokenize from '../src/lexer';

describe('Lexer', () => {

  it('should return empty array for empty input', () => {
    expect(tokenize('')).to.be.empty;
  });

  it('should return empty array for string of spaces, tabs and newlines', () => {
    expect(tokenize('   \n\r\t')).to.be.empty;
  });

  it('should return token as array of token, line and offset', () => {
    let token = tokenize('=')[0];
    expect(token.token).to.equal('=');
    expect(token.line).to.equal(1);
    expect(token.offset).to.equal(1);
  });

  it('should return correct line in token', () => {
    let token = tokenize('\n\n=')[0];
    expect(token.line).to.equal(3);
  });
  it('should return correct offset in token', () => {
    let token = tokenize('   =')[0];
    expect(token.offset).to.equal(4);

    token = tokenize(' \n  =')[0];
    expect(token.offset).to.equal(3);
  });

  it('should retrun 3 tokens for correct strings - 2 qoutes and string content', () => {
    let tokens = tokenize('"test"');

    expect(tokens).to.have.lengthOf(3);
    expect(tokens[0].token).to.equal('"');
    expect(tokens[1].token).to.equal('test');
    expect(tokens[2].token).to.equal('"');
  });

  it('should retrun 3 tokens for empty string', () => {
    let tokens = tokenize('""');

    expect(tokens).to.have.lengthOf(3);
    expect(tokens[0].token).to.equal('"');
    expect(tokens[1].token).to.equal('');
    expect(tokens[2].token).to.equal('"');
  });



  it('should consume any symbols within string', () => {
    let tokens = tokenize('"() \n\t\r"');

    expect(tokens).to.have.lengthOf(3);
  });
});
