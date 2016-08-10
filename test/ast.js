import {expect} from 'chai';
import tokenize from '../src/lexer';
import buildAst, {TYPE_EMPTY, TYPE_LITERAL, TYPE_STRING, TYPE_FUNC} from '../src/ast';

describe('AstBuilder', () => {
  it('should return empty list for empty input', () => {
    let ast = buildAst(tokenize(''));

    expect(ast.elements).to.have.lengthOf(0);
  });

  it('should return EMPTY token for ()', () => {
    let ast = buildAst(tokenize('()'));

    expect(ast.elements).to.have.lengthOf(1);

    expect(ast.elements[0].type).to.equal(TYPE_EMPTY);
  });

  it('should return EMPTY token and error for (', () => {
    let ast = buildAst(tokenize('('));

    expect(ast.elements).to.have.lengthOf(1);
    expect(ast.elements[0].type).to.equal(TYPE_EMPTY);
    expect(ast.errors).to.have.lengthOf(1);
  });

  it('should return empty list and error for single )', () => {
    let ast = buildAst(tokenize(')'));

    expect(ast.elements).to.have.lengthOf(0);
    expect(ast.errors).to.have.lengthOf(1);
  });

  it('should return LITERAL element for single value in ()', () => {
    let ast = buildAst(tokenize('(0)'));

    expect(ast.elements).to.have.lengthOf(1);
    expect(ast.elements[0].type).to.equal(TYPE_LITERAL);
    expect(ast.elements[0].token).to.equal(0);
  });

  it('should return STRING element for string value in ()', () => {
    let ast = buildAst(tokenize('("test")'));

    expect(ast.elements).to.have.lengthOf(1);
    expect(ast.elements[0].type).to.equal(TYPE_STRING);
    expect(ast.elements[0].token).to.equal('test');
  });

  it('should return STRING element and error for non closed string value in ()', () => {
    let ast = buildAst(tokenize('("test)'));

    expect(ast.elements).to.have.lengthOf(1);
    expect(ast.elements[0].type).to.equal(TYPE_STRING);
    expect(ast.elements[0].token).to.equal('test)');
    expect(ast.errors).to.have.lengthOf(1);
  });

  it('should return error for single string value', () => {
    let ast = buildAst(tokenize('"test"'));

    expect(ast.elements).to.have.lengthOf(0);
    expect(ast.errors).to.have.lengthOf(1);
  });

  it('should return error for missing (', () => {
    let ast = buildAst(tokenize('test'));

    expect(ast.elements).to.have.lengthOf(0);
    expect(ast.errors).to.have.lengthOf(1);
  });

  it('should parse strings in arguments', () => {
    let ast = buildAst(tokenize('(if "test")'));

    expect(ast.elements).to.have.lengthOf(1);
    expect(ast.elements[0].args).to.have.lengthOf(1);
    expect(ast.elements[0].args[0].type).to.equal(TYPE_STRING);
  });

  it('should parse nested elements', () => {
    let ast = buildAst(tokenize('(+ (* 1 2) 4)'));

    expect(ast.elements).to.have.lengthOf(1);
    expect(ast.elements[0].args).to.have.lengthOf(2);
    expect(ast.elements[0].args[0].type).to.equal(TYPE_FUNC);

    ast = buildAst(tokenize('(+ (* (/ 4 5) 2) 4)'));

    expect(ast.elements).to.have.lengthOf(1);
    expect(ast.elements[0].args).to.have.lengthOf(2);
    expect(ast.elements[0].args[0].type).to.equal(TYPE_FUNC);
    expect(ast.elements[0].args[0].args[0].type).to.equal(TYPE_FUNC);
  });

  it('should return FUNC element for functions', () => {
    let ast = buildAst(tokenize('(+ 2 3)'));
    expect(ast.elements).to.have.lengthOf(1);
    expect(ast.elements[0].type).to.equal(TYPE_FUNC);
  });
});
