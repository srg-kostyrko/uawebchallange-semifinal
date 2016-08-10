import {isNil, sum, reduce, subtract, multiply, any, equals, divide, modulo, gt, lt, map, not, and, or, max, merge, prop, is, concat, find, difference} from 'ramda';
import {default as hashSum} from 'hash-sum';
import {v1} from 'uuid';

const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

const io = require('socket.io-client');

const signalingUrl = 'https://sandbox.simplewebrtc.com:443/';
const rtcConfig = {'iceServers': [
  {'url': 'stun:23.21.150.121'},
  {url:'stun:stun01.sipphone.com'},
  {url:'stun:stun.ekiga.net'},
  {url:'stun:stun.fwdnet.net'},
  {url:'stun:stun.ideasip.com'},
  {url:'stun:stun.iptel.org'},
  {url:'stun:stun.rixtelecom.se'},
  {url:'stun:stun.schlund.de'},
  {url:'stun:stun.l.google.com:19302'},
  {url:'stun:stun1.l.google.com:19302'},
  {url:'stun:stun2.l.google.com:19302'},
  {url:'stun:stun3.l.google.com:19302'},
  {url:'stun:stun4.l.google.com:19302'},
  {url:'stun:stunserver.org'},
  {url:'stun:stun.softjoys.com'},
  {url:'stun:stun.voiparound.com'},
  {url:'stun:stun.voipbuster.com'},
  {url:'stun:stun.voipstunt.com'},
  {url:'stun:stun.voxgratia.org'},
  {url:'stun:stun.xten.com'},
  {
  	url: 'turn:numb.viagenie.ca',
  	credential: 'muazkh',
  	username: 'webrtc@live.com'
  },
  {
  	url: 'turn:192.158.29.39:3478?transport=udp',
  	credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  	username: '28224511:1379330808'
  },
  {
  	url: 'turn:192.158.29.39:3478?transport=tcp',
  	credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  	username: '28224511:1379330808'
  }
]};
const connection = { 'optional': [{'DtlsSrtpKeyAgreement': true}] };
const sdpConstraints = isChrome ? {
  optional: [],
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  }
} : {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

let processArguments = [
  'concat',
  '+',
  '-',
  '*',
  '/',
  '%',
  '=',
  '>',
  '<',
  'sqrt',
  'array',
  'array-map',
  'array-map2',
  'array-first',
  'array-diff',
  'document',
  '.',
  '.=',
  '.call',
  'hash-sum',
  '?',
  'same',
  'not',
  'and',
  'or',
  'push',
  'array-merge',
  'hash-keys',
  'cb',
  'json-str',
  'user-media',
  'peer-candidate',
  'webrtc-offer',
  'webrtc-answer',
  'webrtc-parse',
  'object-url',
  'location-update',
  'window-before-unload'
];

let functions = {
  'concat': (...args) => {
    if (!args.length) {
      return '';
    }

    return reduce(concat, '', args);
  },
  '+': (...args) => {
    if (!args.length) {
      return 0;
    }
    return sum(args);
  },
  '-': (a, ...rest) => {
    if (isNil(a)) {
      return 0;
    }
    if (rest.length == 0) {
      return -a;
    }
    return reduce(subtract, a, rest);
  },
  '*': (a, ...rest) => {
    if (isNil(a)) {
      return 0;
    }
    return reduce(multiply, a, rest);
  },
  '/': (a, ...rest) => {
    if (isNil(a)) {
      return 0;
    }
    if (any(equals(0))(rest)) {
      throw 'Ділення на нуль';
    }
    return reduce(divide, a, rest);
  },
  '%': (a, ...rest) => {
    if (isNil(a)) {
      return 0;
    }
    return reduce(modulo, a, rest);
  },
  '=': equals,
  '>': gt,
  '<': lt,
  'print': function(...args) {
    args.forEach((arg) => {
      this.output.push(this.exec(arg));
    });

    return null;
  },
  'sqrt': Math.sqrt,
  'if': function(condition, trueExpr, falseExpr) {
    let conditionResult = this.exec(condition);
    if (conditionResult) {
      return this.exec(trueExpr);
    } else {
      return this.exec(falseExpr);
    }
  },
  'define': function(functionDefinition, functionBody) {
    this.registerUserFunction(functionDefinition.token, functionDefinition.args, functionBody);
  },
  'set': function(varName, value) {
    this.addToScope(varName.token, this.exec(value));
  },
  'lambda': function(functionDefinition, functionBody) {
    let args = [functionDefinition];
    if (functionDefinition.args) {
      args = args.concat(functionDefinition.args);
    }
    return this.createFunction({
      name: 'lambda',
      args: args,
      body: functionBody
    });
  },
  'hash-map': function(...args) {
    let map = {};
    args.forEach((arg) => {
      map[this.exec(arg.name)] = this.exec(arg.args[0]);
    });
    return map;
  },
  'hash-keys': function(hashMap) {
    if (isNil(hashMap)) {
      return [];
    }
    return Object.keys(hashMap);
  },
  '.': function(property, hashMap) {
    if (isNil(hashMap)) {
      return null;
    }
    if (property in hashMap) {
      return hashMap[property];
    }
    return null;
  },
  '.=': function(property, value, hashMap) {
    hashMap[property] = value;

    return hashMap;
  },
  '.call': function(property, hashMap, ...args) {
    if (isNil(hashMap)) {
      return null;
    }

    if (property in hashMap) {
      return hashMap[property].apply(hashMap, args);
    }
    return null;
  },
  'array': function(...args) {
    return args;
  },
  'push': function(value, arr) {
    arr.push(value);
    return arr;
  },
  'array-merge': function(a, b) {
    if (isNil(a)) {
      a = [];
    }
    if (isNil(b)) {
      b = [];
    }
    return a.concat(b);
  },

  'apply': function(fn, args) {
    if (!prop('is_user_func', fn)) {
      fn = this.exec(fn);
    }
    if (!is(Array, args)) {
      args = this.exec(args);
    }
    return this.callUserFunc(fn, args);
  },

  'cb': function(fn) {
    return (...args) => {
      try {
        this.callUserFunc(fn, args);
      } catch (e) {
        if (e) {
          this.errors.push({
            message: e,
          });
        }
      }
      this.processOutput();
    };
  },

  'array-map': function(fn, arr) {
    if (isNil(arr)) {
      return [];
    }
    return map((el) => {
      return this.callUserFunc(fn, [el]);
    }, arr);
  },
  'array-map2': function(fn, arr, arr2) {
    let limit = max(arr.length, arr2.length);
    let result = [];

    for (let i = 0; i < limit; ++i) {
      result.push(this.callUserFunc(fn, [arr[i], arr2[i]]));
    }

    return result;
  },
  'array-first': function(fn, arr) {
    console.log(arr);
    if(isNil(arr)) {
      return null;
    }
    return find((el) => {
      console.log('find', el);
      return this.callUserFunc(fn, [el]);
    })(arr);
  },
  'array-diff': function(a, b) {
    return difference(a, b);
  },

  'all': function(...args) {
    let result = null;
    if (args) {
      args.forEach((arg) => {
        result = this.exec(arg);
      });
    }

    return result;
  },

  'module': function(name, depends, body) {
    let moduleName = this.exec(name);
    let dependencies = [];
    if (depends.name) {
      dependencies.push(depends.name);
    }
    if (depends.args) {
      depends.args.forEach((arg) => {
        dependencies.push(arg.token);
      });
    }
    this.createModule(moduleName, dependencies, body);
  },

  'document': function(fnName, ...args) {
    return document[fnName].apply(document, args);
  },
  'location-search': function() {
    return location.search && location.search.split('?')[1];
  },
  'location-update': function(name) {
    var newUrl = location.pathname + '?' + name;
    history.replaceState({foo: 'bar'}, null, newUrl);
  },
  'location-origin': function() {
    return location.origin;
  },

  'hash-sum': function(value) {
    return hashSum(value);
  },
  '?' : isNil,
  'same': function(a, b) {
    return a === b;
  },
  'not': not,
  'and': and,
  'or': function(a, b) {
    return a || b;
  },
  'json-str': function(value) {
    return JSON.stringify(value);
  },
  'uuid': function() {
    return v1();
  },
  // web rtc
  'webrtc-signaling-connection': function() {
    return io.connect(signalingUrl);
  },
  'peer-connection': function() {
    return new RTCPeerConnection(rtcConfig, connection);
  },
  'peer-candidate': function(data) {
    return new RTCIceCandidate(data);
  },
  'user-media': function(success, error) {
    getUserMedia({video: true, audio: true}, success, error);
  },
  'webrtc-offer': function(peer, success, error) {
    peer.createOffer(function (desc) {
      peer.setLocalDescription(desc, function () {}, function () {});
      success(desc);
    },
    function () { error("Не можу створити webrtc offer"); },
    sdpConstraints);
  },
  'webrtc-answer': function(peer, success, error) {
    peer.createAnswer(function (desc) {
      peer.setLocalDescription(desc, function () {}, function () {});
      success(desc);
    },
    function () { error("Не можу створити webrtc answer"); },
    sdpConstraints);
  },

  'webrtc-parse': function (desc) {
    if (is(String, desc)) {
      desc = JSON.parse(answer);
    }
    return new RTCSessionDescription(desc);
  },
  'object-url': function(stream) {
    return URL.createObjectURL(stream);
  }
};

export function functionExists(name) {
  return name in functions;
}

export function call(name, args = [], runtime) {
  if (processArguments.indexOf(name) >= 0) {
    let processedArgs = [];
    args.forEach((arg) => {
      processedArgs.push(runtime.exec(arg));
    });
    args = processedArgs;
  }

  return functions[name].call(runtime, ...args);
}
