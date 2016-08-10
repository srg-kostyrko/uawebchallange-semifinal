import {expect} from 'chai';
import execute from '../src/runtime';

describe('Runtime', () => {
  describe('+', () => {
    it('should sum 2 numbers', () => {
      let result = execute('(+ 3 4)');
      expect(result.result).to.equal(7);
    });
    it('should sum multiple numbers', () => {
      let result = execute('(+ 3 4 1 2)');
      expect(result.result).to.equal(10);
    });
    it('should return number if only one arg provided', () => {
      let result = execute('(+ 3)');
      expect(result.result).to.equal(3);
    });
    it('should return 0 if no arg provided', () => {
      let result = execute('(+)');
      expect(result.result).to.equal(0);
    });
  });

  describe('-', () => {
    it('should substruct', () => {
      let result = execute('(- 4 2)');
      expect(result.result).to.equal(2);
    });
    it('should substruct multiple numbers', () => {
      let result = execute('(- 13 4 1 2)');
      expect(result.result).to.equal(6);
    });
    it('should return negated number if one arg provided', () => {
      let result = execute('(- 3)');
      expect(result.result).to.equal(-3);
    });
    it('should return 0 if no arg provided', () => {
      let result = execute('(-)');
      expect(result.result).to.equal(0);
    });
  });

  describe('*', () => {
    it('should multiply', () => {
      let result = execute('(* 4 2)');
      expect(result.result).to.equal(8);
    });
    it('should substruct multiple numbers', () => {
      let result = execute('(* 4 2 2)');
      expect(result.result).to.equal(16);
    });
    it('should return number if one arg provided', () => {
      let result = execute('(* 3)');
      expect(result.result).to.equal(3);
    });
    it('should return 0 if no arg provided', () => {
      let result = execute('(*)');
      expect(result.result).to.equal(0);
    });
  });
  describe('/', () => {
    it('should divide', () => {
      let result = execute('(/ 4 2)');
      expect(result.result).to.equal(2);
    });
    it('should divide multiple numbers', () => {
      let result = execute('(/ 8 2 2)');
      expect(result.result).to.equal(2);
    });
    it('should return number if one arg provided', () => {
      let result = execute('(/ 3)');
      expect(result.result).to.equal(3);
    });
    it('should return 0 if no arg provided', () => {
      let result = execute('(/)');
      expect(result.result).to.equal(0);
    });
    it('should return error if second of further arg is 0', () => {
      let result = execute('(/ 2 0)');
      expect(result.errors).to.have.lengthOf(1);
    });
  });

  describe('%', () => {
    it('should return modulo', () => {
      let result = execute('(% 4 3)');
      expect(result.result).to.equal(1);
    });
    it('should return module for multiple numbers', () => {
      let result = execute('(% 25 10 2)');
      expect(result.result).to.equal(1);
    });
    it('should return number if one arg provided', () => {
      let result = execute('(% 3)');
      expect(result.result).to.equal(3);
    });
    it('should return 0 if no arg provided', () => {
      let result = execute('(%)');
      expect(result.result).to.equal(0);
    });
  });

  describe('=', () => {
    it('should return true if arguments are equal', () => {
      let result = execute('(= 3 3)');
      expect(result.result).to.equal(true);

      result = execute('(= "test" "test")');
      expect(result.result).to.equal(true);
    });
    it('should return false if arguments arenot equal', () => {
      let result = execute('(= 3 4)');
      expect(result.result).to.equal(false);
    });
  });

  describe('>', () => {
    it('should return true if first argument is greater', () => {
      let result = execute('(> 3 2)');
      expect(result.result).to.equal(true);
    });
    it('should return false if first argument is smaller', () => {
      let result = execute('(> 3 4)');
      expect(result.result).to.equal(false);
    });
  });

  describe('<', () => {
    it('should return true if first argument is smaller', () => {
      let result = execute('(< 3 4)');
      expect(result.result).to.equal(true);
    });
    it('should return false if first argument is greater', () => {
      let result = execute('(< 3 2)');
      expect(result.result).to.equal(false);
    });
  });

  describe('print', () => {
    it('should return undefined', ()=>{
      let result = execute('(print "test")');
      expect(result.result).to.be.null;
    });
    it('should add string to output', () => {
      let result = execute('(print "test")');
      expect(result.output).to.have.lengthOf(2);
      expect(result.output[0]).to.equal('test');
    });
  });

  describe('sqrt', () => {
    it('should return square root of first argument', () => {
      let result = execute('(sqrt 100)');
      expect(result.result).to.equal(10);
    });
  });

  describe('if', () => {
    it('should return second argument if condition is true', () => {
      let result = execute('(if (= 2 2) (1) (2))');
      expect(result.result).to.equal(1);
    });
    it('should return third argument if condition is false', () => {
      let result = execute('(if (= 2 3) (1) (2))');
      expect(result.result).to.equal(2);
    });
    it('should return undefined if condition is false and third attribute is missing', () => {
      let result = execute('(if (= 2 3) (1) (2))');
      expect(result.result).to.equal(2);
    });
  });

  describe('define', () =>{
    it('defined function should be callable', () => {
      let result = execute('(define (test) (+ 1 2)) (test)');
      expect(result.result).to.equal(3);
    });

    it('should add args to scope', () => {
      let result = execute('(define (test n) (+ n 2)) (test 2)');
      expect(result.result).to.equal(4);
    });

    it('should support recursive calls', () => {
      let result = execute('(define (fib n)(if (= n 1)(0)(if (= n 2)(1)(+ (fib (- n 1))(fib (- n 2)))))) (fib 6)');
      expect(result.result).to.equal(5);
    });
  });

  describe('set', () => {
    it('should add new variable to scope', () => {
      let result = execute('(set a 2) (a)');
      expect(result.result).to.equal(2);
    });
    it('should support variable update', () => {
      let result = execute('(set a 2) (set a 3)(a)');
      expect(result.result).to.equal(3);
    });
    it('should support assigning variable to variable', () => {
      let result = execute('(set a 2) (set b a) (b)');
      expect(result.result).to.equal(2);
    });
    it('should deref variable while assigning', () => {
      let result = execute('(set a 2) (set b a) (set a 3) (b)');
      expect(result.result).to.equal(2);
    });
  });

  describe('first-class functions', () => {
    it('should support passing function as argument', () => {
      let result = execute('(define (fnarg) (1)) (define (test n)(n)) (test fnarg)');
      expect(result.result).to.equal(1);
    });
  });

  describe('lambda', () => {
    it('should return callable function', () => {
      let result = execute('(set test (lambda (n s) (+ n s))) (test 1 2)');
      expect(result.result).to.equal(3);
    });

    it('should work as closure', () => {
      let result = execute('(define (test n) (lambda (s) (+ n s))) (set add1 (test 1)) (add1 2)');
      expect(result.result).to.equal(3);
    });
  });

  describe('hash-map', () => {
    it('should create empty hash if called without args', () => {
      let result = execute('(hash-map)');
      expect(result.result).to.deep.equal({});
    });
    it('should add properties', () => {
      let result = execute('(hash-map (a 2) (b 3))');
      expect(result.result).to.deep.equal({a: 2, b: 3});
    });
  });

  describe('.', () => {
    it('should get property of hash map', () => {
      let {result} = execute('(. a (hash-map (a 2)))');
      expect(result).to.equal(2);
    });
    it('should return null if property is not in hash map', () => {
      let {result} = execute('(. b (hash-map (a 2)))');
      expect(result).to.equal(null);
    });

    it('should return value at index from array', () => {
      let {result} = execute('(. 1 (array 1 2)');
      expect(result).to.equal(2);
    });
  });

  describe('.=', () => {
    it('should set property and return hash map', () => {
      let {result} = execute('(.= b 2 (hash-map))');
      expect(result).to.deep.equal({b:2});
    });

    it('should set value at index to array', () => {
      let {result} = execute('(.= 1 1 (array 1 2)');
      expect(result).to.deep.equal([1,1]);
    });
  });

  describe('array', () => {
    it('should return empty array if called without args', () => {
      let {result} = execute('(array)');
      expect(result).to.deep.equal([]);
    });

    it('should add arguments to array', () => {
      let {result} = execute('(array 1 2 (+ 1 2))');
      expect(result).to.deep.equal([1,2,3]);
    });
  });

  describe('map', () => {
    it('should walk array calling function on every member', () => {
      let {result} = execute('(map (lambda (n) (+ n 1)) (array 1 2))');
      expect(result).to.deep.equal([2,3]);
    });
  });
});
