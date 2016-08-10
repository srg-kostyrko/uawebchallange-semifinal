import buildAst, {TYPE_EMPTY, TYPE_LITERAL, TYPE_STRING, TYPE_FUNC} from './ast';
import tokenize from './lexer';
import {functionExists, call} from './core-functions';
import {reverse, last, map, isNil, is, prop, propOr, reduce, repeat} from 'ramda';

export class Runtime {
  constructor() {
    this.errors = [];
    this.output = [];
    this.stack = [];
    this.stackLevel = 0;
    this.scope = {};
    this.modules = {};
    this.loadingModules = {};
    this.moduleResolve = {};
  }

  resolveModule(name) {
    if (name in this.loadingModules){
      return this.loadingModules[name];
    }
    this.loadingModules[name] = new Promise((resolve, reject) => {
      this.moduleResolve[name] = resolve;
      this.loadModule(name);
    });
    return this.loadingModules[name];
  }

  loadModule(name) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        this.run(xhr.responseText);
      }
    };
    xhr.open("GET", '/src/spl/' + name + '.spl', true);
    xhr.send();
  }

  createModule(name, depends, body) {
    if (depends.length > 0) {
      Promise.all(map((depName) => {
        return this.resolveModule(depName);
      }, depends)).then(() => {
        this.doCreateModule(name, body);
      }).catch(() => this.processOutput());
    } else {
      this.doCreateModule(name, body);
    }
  }
  doCreateModule(name, body) {
    // console.log(name, body);
    var scope = {};
    this.startScopeWith(scope);
    this.exec(body);
    this.modules[name] = this.scope;
    this.stopScope();
    if (name in this.moduleResolve) {
      this.moduleResolve[name](true);
    }
    this.processOutput();
  }

  createFunction({name, args, body}) {
    return {
      type: TYPE_FUNC,
      name,
      args: args || [],
      body,
      is_user_func: true,
      __scope__: this.scope
    };
  }

  registerUserFunction(name, args, body) {
    this.addToScope(name, this.createFunction({name, args, body}));
  }

  run(input) {
    this.ast = buildAst(tokenize(input));
    this.parseErrors = this.ast.errors;
    let result = '';
    if (!this.ast.failed) {
      this.ast.elements.forEach((element) => {
        if (this.errors.length > 0) {
          return;
        }
        try {
          result = this.exec(element);
        } catch (e) {
          console.log(e);
        }
      });
      if (this.errors.length > 0) {
        result = '';
        this.stack = [];
      }
    }
    this.ast = null;
    return this.processOutput(result);
  }

  processOutput(result) {
    this.output && map((out) => console.log(out), this.output);
    this.errors && map((error) => console.log(error), this.errors);
    this.parseError && map((error) => console.log(error), this.parseErrors);

    let toReturn = {
      result,
      output: [...this.output],
      errors: [...this.errors],
      parseErrors: [...this.parseErrors],
      stack: [...this.stack]
    };
    this.output = [];
    this.errors = [];
    this.parseErrors = [];
    this.stack = [];
    return toReturn;
  }

  functionExists(name) {
    return functionExists(name);
  }

  exec(element) {
    if (isNil(element)) {
      return element;
    }
    switch (element.type) {
      case TYPE_EMPTY:
        return null;
      case TYPE_STRING:
        return element.token;
      case TYPE_LITERAL:
        if (this.isInModule(element.token)) {
          return this.getInModule(element.token);
        }
        if (this.isInScope(element.token)) {
          return this.getInScope(element.token);
        }
        return element.token;
      case TYPE_FUNC:
        return this.call(element);
    }
    return element;
  }

  callUserFunc(func, args = []) {
    this.stack.push(
      repeat(' ', this.stackLevel).join('') +
      func.name + '(' + map(prop('token'), propOr([], 'args', func)).join(', ') + ')'
    );

    let fnArgs = {};
    if (func.args) {
      for (let i = 0; i < func.args.length; ++i) {
        fnArgs[func.args[i].token] = this.exec(args[i]);
      }
    }

    this.stackLevel++;
    this.startScopeWith(func.__scope__);
    for (let key in fnArgs) {
      this.addToScope(key, fnArgs[key]);
    }
    let result = this.exec(func.body);
    this.stopScope();
    this.stackLevel--;
    return result;
  }

  call(element) {
    let funcName = element.name;
    // console.log(funcName);
    if (this.isInModule(funcName)) {
      let moduleElement = this.getInModule(funcName);
      if (moduleElement.is_user_func) {
        return this.callUserFunc(moduleElement, element.args);
      } else {
        return this.exec(moduleElement);
      }
    }
    if (element.is_user_func) {
      return this.callUserFunc(this.getInScope(funcName));
    }
    if (this.isInScope(funcName)) {
      let scopeElement = this.getInScope(funcName);
      if (scopeElement.is_user_func) {
        return this.callUserFunc(scopeElement, element.args);
      } else {
        return this.exec(scopeElement);
      }
    }
    this.stack.push(
      repeat(' ', this.stackLevel).join('') +
      funcName + '(' + map(prop('token'), propOr([], 'args', element)).join(', ') + ')'
      + element.line + ':' + element.offset
    );
    this.stackLevel++;
    if (functionExists(funcName)) {
      try {
        let result = call(funcName, element.args, this);
        this.stackLevel--;
        return result;
      } catch (e) {
        if (e) {
          this.errors.push({
            message: e,
            line: element.line,
            offset: element.offset,
            stack: [...this.stack]
          });
        }
        throw '';
      }
    }

    this.errors.push({
      message: 'Виклик невизначенної функції ' + funcName,
      line: element.line,
      offset: element.offset,
      stack: [...this.stack]
    });
    throw '';
  }

  isInScope(name) {
    return name in this.scope;
  }
  getInScope(name) {
    return this.scope[name];
  }

  startScope() {
    let constructor = function(){};
    constructor.prototype = this.scope;
    let oldScope = this.scope;
    this.scope = new constructor();
    this.scope.__parent__ = oldScope;
  }
  startScopeWith(lexicalScope) {
    let constructor = function(){};
    constructor.prototype = lexicalScope;
    let oldScope = this.scope;
    this.scope = new constructor();
    this.scope.__parent__ = oldScope;
  }
  stopScope() {
    this.scope = this.scope.__parent__;
  }
  addToScope(name, value) {
    this.scope[name] = value;
  }
  isInModule(name) {
    return is(String, name) ? name.indexOf(':') > 0 : false;
  }
  getInModule(name) {
    let [module, fn] = name.split(':');
    if (module in this.modules) {
      if (fn in this.modules[module]) {
        return this.modules[module][fn];
      } else {
        this.errors.push({
          message: 'Функція ' + fn + ' не візначена в модулі ' + module
        });
      }
    } else {
      this.errors.push({
        message: 'Модуль ' + module + ' не існує або не загружено',
      });
    }
  }
}

export default function execute(input) {
  let runtime = new Runtime();
  let t0 = Date.now();
  let result = runtime.run(input);
  let t1 = Date.now();
  result.time = (t1 - t0).toFixed(2) + 'ms';
  return result;
}
