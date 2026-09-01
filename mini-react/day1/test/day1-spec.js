// createElement가 통과해야 하는 동작들.
// "따라치지 않기" 원칙에 따라 구현은 없고 기대 동작만 적어뒀습니다.
// 터미널에서: node test/day1-spec.js (또는 npm test)
//
// 규칙 (실제 React의 실제 동작 방식과 동일하게 감):
//   - 자식이 0개면 props.children은 undefined
//   - 자식이 1개면 props.children은 그 값 그대로 (배열로 감싸지 않음)
//   - 자식이 2개 이상이면 props.children은 배열
//   - 텍스트 자식은 별도 래핑(TEXT_ELEMENT 등) 없이 문자열/숫자 그대로 둔다

import { createElement } from '../src/index.js';

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

// 케이스 1: 텍스트 자식 하나 → children은 배열이 아니라 문자열 그대로
const el1 = createElement('h1', null, 'Hello');
assert(el1 && el1.type === 'h1', "타입은 'h1'이어야 한다");
assert(el1?.props?.children === 'Hello', "자식이 1개면 children은 배열이 아니라 'Hello' 값 그대로여야 한다");

// 케이스 2: props와 여러 자식(중첩 element 포함) → children은 배열
const el2 = createElement(
  'div',
  { className: 'box' },
  createElement('span', null, 'a'),
  createElement('span', null, 'b')
);
assert(el2?.props?.className === 'box', 'className이 props에 그대로 전달되어야 한다');
assert(Array.isArray(el2?.props?.children), '자식이 2개 이상이면 children은 배열이어야 한다');
assert(el2?.props?.children?.length === 2, '자식은 2개여야 한다');
assert(el2?.props?.children?.[0]?.type === 'span', '첫 번째 자식의 type은 span이어야 한다');

// 케이스 3: props가 null이어도 동작 (자식 1개 → 배열 아님)
const el3 = createElement('p', null, 'text');
assert(el3?.props?.children === 'text', 'props가 null이어도 children은 정상 동작해야 한다 (배열 아님)');

// 케이스 4: 자식이 없는 경우 → children은 undefined
const el4 = createElement('br', null);
assert(el4?.props?.children === undefined, '자식이 없으면 children은 undefined여야 한다');

console.log(`\n결과: ${passed}개 통과, ${failed}개 실패`);
if (failed > 0) process.exitCode = 1;

// ---
// render()는 실제 DOM이 필요해서 이 파일에서는 검증하지 않습니다.
// index.html을 브라우저로 열어서 src/main.js의 주석을 해제한 뒤,
// 화면에 "Hello, Mini React"와 카드 UI가 그려지는지 눈으로 확인하세요.
//
// 주의: render를 구현할 때 children이 이제 "배열일 수도, 단일 값일 수도, undefined일 수도"
// 있다는 걸 감안해야 합니다. (예: 배열이 아니면 [child] 하나로 통일해서 순회하는 식으로 처리)
