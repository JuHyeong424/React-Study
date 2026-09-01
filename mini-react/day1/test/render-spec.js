// render()가 통과해야 하는 동작들.
// render는 실제 DOM API가 필요해서, jsdom으로 브라우저 DOM을 흉내내서 테스트합니다.
//
// 실행 전 준비: npm install jsdom (한 번만)
// 실행: node test/render-spec.js
//
// "따라치지 않기" 원칙에 따라 구현은 없고 기대 동작만 적어뒀습니다.

import { JSDOM } from 'jsdom';
import { createElement, render } from '../src/index.js';

const dom = new JSDOM('<!doctype html><div id="app"></div>');
globalThis.document = dom.window.document;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('✅ PASS:', message);
    passed++;
  } else {
    console.error('❌ FAIL:', message);
    failed++;
  }
}

function freshContainer() {
  return dom.window.document.createElement('div');
}

// 케이스 1: main.js와 동일한 시나리오 (자식 여러 개, 각각 텍스트 자식 1개씩)
{
  const container = freshContainer();
  const tree = createElement(
    'div',
    { className: 'card' },
    createElement('h1', null, 'Hello, Mini React'),
    createElement('p', null, '이 문장이 보이면 정적 렌더링 성공!')
  );
  render(tree, container);

  assert(container.children.length === 1, 'container 바로 아래에 div 하나만 있어야 한다');
  const divEl = container.children[0];
  assert(divEl?.tagName.toLowerCase() === 'div', '최상위 태그는 div여야 한다');
  assert(divEl?.className === 'card', "div의 class는 'card'여야 한다");
  assert(divEl?.children.length === 2, 'div의 자식은 2개(h1, p)여야 한다');

  const h1 = divEl?.children[0];
  assert(h1?.tagName.toLowerCase() === 'h1', '첫 번째 자식은 h1이어야 한다');
  assert(h1?.textContent === 'Hello, Mini React', "h1의 텍스트는 'Hello, Mini React'여야 한다");

  const p = divEl?.children[1];
  assert(p?.tagName.toLowerCase() === 'p', '두 번째 자식은 p여야 한다');
  assert(
    p?.textContent === '이 문장이 보이면 정적 렌더링 성공!',
    'p의 텍스트가 정확해야 한다'
  );
}

// 케이스 2: 자식이 1개인데, 그 자식이 텍스트가 아니라 엘리먼트인 경우
// (예: <div class="outer"><section>...</section></div> - div는 section 하나만 자식으로 가짐)
{
  const container = freshContainer();
  const tree = createElement(
    'div',
    { className: 'outer' },
    createElement('section', null, createElement('span', null, 'a'), createElement('span', null, 'b'))
  );
  render(tree, container);

  const outerDiv = container.children[0];
  assert(outerDiv?.tagName.toLowerCase() === 'div', '최상위는 div여야 한다');
  assert(
    outerDiv?.children.length === 1,
    'div의 자식이 1개(section)여도 사라지지 않고 렌더링되어야 한다'
  );

  const section = outerDiv?.children[0];
  assert(section?.tagName.toLowerCase() === 'section', 'div의 자식은 section이어야 한다');
  assert(section?.children.length === 2, 'section의 자식은 span 2개여야 한다');
  assert(section?.children[0]?.textContent === 'a', '첫 번째 span 텍스트는 a여야 한다');
  assert(section?.children[1]?.textContent === 'b', '두 번째 span 텍스트는 b여야 한다');
}

// 케이스 3: 자식이 없는 경우 (예: <br />)
{
  const container = freshContainer();
  const tree = createElement('br', null);
  render(tree, container);

  const br = container.children[0];
  assert(br?.tagName.toLowerCase() === 'br', 'br 태그가 만들어져야 한다');
  assert(br?.childNodes.length === 0, '자식이 없으면 내부에 텍스트 노드 등이 생기면 안 된다');
}

// 케이스 4: className이 없는 엘리먼트 (props가 null)
// 주의: JS에서 element.className = undefined 를 하면 실제로는 "undefined"라는
// 문자열이 class 속성값으로 들어가 버리는 함정이 있습니다. 이 케이스가 그걸 잡아냅니다.
{
  const container = freshContainer();
  const tree = createElement('h1', null, 'no class here');
  render(tree, container);

  const h1 = container.children[0];
  assert(
    h1?.className === '' || h1?.getAttribute('class') === null,
    "className이 없는 엘리먼트에는 class=\"undefined\" 같은 값이 들어가면 안 된다"
  );
}

// 케이스 5: className이 최상위 엘리먼트가 아니라 자식(비-root) 엘리먼트에 있는 경우
// (지금까지 케이스는 전부 className이 최상위 div에만 있었죠 - 자식에도 있으면 어떻게 될까요?)
{
  const container = freshContainer();
  const tree = createElement(
    'div',
    { className: 'card' },
    createElement('span', { className: 'highlight' }, 'hi')
  );
  render(tree, container);

  const div = container.children[0];
  assert(div?.className === 'card', '최상위 div의 className은 여전히 적용되어야 한다');

  const span = div?.children[0];
  assert(span?.tagName.toLowerCase() === 'span', 'div의 자식은 span이어야 한다');
  assert(
    span?.className === 'highlight',
    '자식(비-root) 엘리먼트의 className도 똑같이 적용되어야 한다'
  );
}

console.log(`\n결과: ${passed}개 통과, ${failed}개 실패`);
if (failed > 0) process.exitCode = 1;
