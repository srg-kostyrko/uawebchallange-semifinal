import {Runtime} from './runtime';

window.runtime = new Runtime();

let document = window.document;

var scripts = document.getElementsByTagName('script');

for (let i = 0; i < scripts.length; i++) {
  let script = scripts[i];
  if (script.type.match(/^text\/spl$/i)) {
    runtime.run(script.textContent || script.innerText);
  }
}
