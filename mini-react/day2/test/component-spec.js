// Day 2 목표: 함수형 컴포넌트 지원
//
// 지금까지 element.type은 항상 문자열(태그 이름)이었습니다.
// 이제 element.type이 함수일 수도 있게 됩니다 — 그 함수를 "컴포넌트"라고 부릅니다.
// render는 type이 함수인 경우, document.createElement로 태그를 만드는 대신
// 그 함수를 호출해서(props를 넘겨서) 반환된 element를 대신 렌더링해야 합니다.
//
// 실행 전 준비: npm install jsdom (이미 했다면 생략)
// 실행: node test/component-spec.js
//
// 이 파일에도 구현은 없습니다 - src/index.js의 createElement, render를
// 직접 확장해서 아래 케이스들을 통과시켜보세요.
// 케이스 하나가 에러를 던져도 나머지 케이스 결과는 볼 수 있도록 try/catch로 감쌌습니다.

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

function run(name, fn) {
  try {
    fn();
  } catch (e) {
    console.error(`❌ FAIL (에러 발생 - ${name}):`, e.message);
    failed++;
  }
}

function freshContainer() {
  return dom.window.document.createElement('div');
}

// 체크포인트: createElement 자체는 수정이 필요 없을 수도 있습니다.
// type이 함수든 문자열이든, createElement는 그냥 그대로 저장하기만 하면 되니까요.
// 단, 여기서 props.foo처럼 className이 아닌 임의의 props도 잘 전달되는지 같이 확인합니다.
run('체크포인트: type이 함수여도 저장되는지', () => {
  function Dummy() {}
  const el = createElement(Dummy, { foo: 'bar' });
  assert(el.type === Dummy, 'type에 함수 자체가 그대로 저장되어야 한다');
  assert(el.props.foo === 'bar', 'className이 아닌 임의의 props(foo)도 그대로 전달되어야 한다');
});

// 케이스 1: 최상위 엘리먼트가 함수 컴포넌트인 경우
run('케이스 1: 최상위가 함수 컴포넌트', () => {
  function Greeting(props) {
    return createElement('h1', null, props.text);
  }
  const container = freshContainer();
  render(createElement(Greeting, { text: 'Hello, Component' }), container);

  const h1 = container.children[0];
  assert(h1?.tagName?.toLowerCase() === 'h1', '컴포넌트가 반환한 h1이 실제로 렌더링되어야 한다');
  assert(h1?.textContent === 'Hello, Component', '컴포넌트에 전달한 props가 결과에 반영되어야 한다');
});

// 케이스 2: 여러 엘리먼트를 감싸서 반환하는 컴포넌트 (day1의 main.js 예시를 컴포넌트로 옮긴 버전)
run('케이스 2: 여러 엘리먼트를 반환하는 컴포넌트', () => {
  function Card(props) {
    return createElement(
      'div',
      { className: 'card' },
      createElement('h1', null, props.title),
      createElement('p', null, props.text)
    );
  }
  const container = freshContainer();
  render(
    createElement(Card, {
      title: 'Hello, Mini React',
      text: '이 문장이 보이면 컴포넌트 렌더링 성공!',
    }),
    container
  );

  const div = container.children[0];
  assert(div?.className === 'card', '컴포넌트 내부 최상위 div의 className이 적용되어야 한다');
  assert(div?.children.length === 2, 'div의 자식은 h1, p 2개여야 한다');
  assert(div?.children[0]?.textContent === 'Hello, Mini React', 'h1 텍스트가 props대로 나와야 한다');
  assert(
    div?.children[1]?.textContent === '이 문장이 보이면 컴포넌트 렌더링 성공!',
    'p 텍스트가 props대로 나와야 한다'
  );
});

// 케이스 3: DOM 엘리먼트의 "자식이 1개"인 자리에 함수 컴포넌트가 들어있는 경우
run('케이스 3: 단일 자식 자리에 컴포넌트', () => {
  function Label(props) {
    return createElement('span', null, props.children);
  }
  const container = freshContainer();
  render(
    createElement('div', { className: 'outer' }, createElement(Label, null, 'inside')),
    container
  );

  const outerDiv = container.children[0];
  assert(outerDiv?.children.length === 1, 'div 안에 컴포넌트가 렌더링한 결과가 자식으로 있어야 한다');
  const span = outerDiv?.children[0];
  assert(span?.tagName?.toLowerCase() === 'span', '컴포넌트가 반환한 span이 실제로 만들어져야 한다');
  assert(span?.textContent === 'inside', '컴포넌트에 넘긴 children(props.children)이 그대로 렌더링되어야 한다');
});

// 케이스 4: 배열로 나열된 형제 엘리먼트 중 하나가 함수 컴포넌트인 경우
run('케이스 4: 배열 형제 중 하나가 컴포넌트', () => {
  function Highlight(props) {
    return createElement('em', null, props.children);
  }
  const container = freshContainer();
  render(
    createElement(
      'p',
      null,
      createElement(Highlight, null, 'important'),
      createElement('span', null, ' text after')
    ),
    container
  );

  const p = container.children[0];
  assert(p?.children.length === 2, 'p 안에는 em, span 2개가 자식 엘리먼트로 있어야 한다');
  assert(p?.children[0]?.tagName?.toLowerCase() === 'em', '배열 안에 있던 컴포넌트도 정상적으로 렌더링되어야 한다');
  assert(p?.children[0]?.textContent === 'important', 'em의 내용이 props.children과 일치해야 한다');
});

console.log(`\n결과: ${passed}개 통과, ${failed}개 실패`);
if (failed > 0) process.exitCode = 1;
