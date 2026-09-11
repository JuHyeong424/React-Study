// Day 7 목표: useCallback
//
// useCallback(fn, deps)은 "함수를 기억"하는 훅입니다. 컴포넌트가 리렌더링될
// 때마다 화살표 함수 `() => {...}`는 매번 새로운 함수 객체로 만들어지는데
// (내용이 똑같아 보여도 참조는 항상 다릅니다), useCallback은 deps가 안
// 바뀌었으면 "이번에 새로 만들어진 함수"를 버리고 "이전 렌더링에서
// 넘겨줬던 바로 그 함수"를 그대로 돌려줍니다.
//
// 핵심 질문: useCallback(fn, deps)은 useMemo(() => fn, deps)로 표현할 수
// 있을까요? ("함수도 값이다"라는 관점.) 힌트로만 남겨두고 강제하진
// 않습니다 - 직접 구현해보면서 판단해보세요.
//
// 실행: node test/day7-spec.js
//
// 이 파일에도 구현은 없습니다 - src/index.js에 useCallback을 직접 추가해서
// 아래 케이스들을 통과시켜보세요.

import { JSDOM } from "jsdom";
import { createElement, render, useState, useCallback } from "../src/index.js";

const dom = new JSDOM('<!doctype html><div id="app"></div>');
globalThis.document = dom.window.document;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log("✅ PASS:", message);
    passed++;
  } else {
    console.error("❌ FAIL:", message);
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
  return dom.window.document.createElement("div");
}

// 체크포인트: useCallback(fn, deps)은 함수를 그대로 반환해야 한다.
run("체크포인트: useCallback 반환값", () => {
  let captured;
  function App() {
    captured = useCallback(() => "hi", []);
    return createElement("p", null, "hi");
  }
  render(createElement(App, null), freshContainer());

  assert(typeof captured === "function", "useCallback은 함수를 반환해야 한다");
  assert(captured() === "hi", "반환된 함수는 원래 함수와 똑같이 동작해야 한다");
});

// 케이스 1: 의존성 배열이 안 바뀌면, 이번 렌더링에서 "새로 만들어진 함수"가
// 아니라 "이전 렌더링에서 넘겼던 함수" 참조를 그대로 반환해야 한다.
run("케이스 1: deps가 안 바뀌면 이전 함수 참조를 재사용한다", () => {
  let firstFn, secondFn;
  let setCount;
  function App() {
    const [count, setCountFn] = useState(0);
    setCount = setCountFn;

    // 매 렌더링마다 새로운 화살표 함수가 만들어지지만, deps(['fixed'])는
    // count와 무관하게 항상 같다 - 그러니 count가 바뀌어도 이 함수
    // 참조는 바뀌면 안 된다.
    const handleClick = useCallback(() => {
      console.log("clicked");
    }, ["fixed"]);

    if (count === 0) firstFn = handleClick;
    else secondFn = handleClick;

    return createElement("p", null, String(count));
  }
  const container = freshContainer();
  render(createElement(App, null), container);
  setCount(1);

  assert(
    firstFn === secondFn,
    "deps가 안 바뀌면 이전 렌더링에서 넘겼던 함수와 같은 참조를 반환해야 한다",
  );
});

// 케이스 2: 의존성 배열의 값이 바뀌면, 이번 렌더링에서 새로 넘긴 함수를
// 반환해야 한다.
run("케이스 2: deps가 바뀌면 새 함수를 반환한다", () => {
  let firstFn, secondFn;
  let setCount;
  function App() {
    const [count, setCountFn] = useState(0);
    setCount = setCountFn;

    const handleClick = useCallback(() => {
      console.log("count is", count);
    }, [count]);

    if (count === 0) firstFn = handleClick;
    else secondFn = handleClick;

    return createElement("p", null, String(count));
  }
  const container = freshContainer();
  render(createElement(App, null), container);
  setCount(1);

  assert(
    firstFn !== secondFn,
    "deps가 바뀌면 이번 렌더링에서 새로 만든 함수를 반환해야 한다",
  );
});

console.log(`\n결과: ${passed}개 통과, ${failed}개 실패`);
if (failed > 0) process.exitCode = 1;

// ---
// 참고 (강제로 테스트하지는 않지만 꼭 직접 확인해볼 것):
//
// 1. useCallback(fn, deps)를 useMemo(() => fn, deps)로 구현할 수 있는지
//    직접 시도해보세요. 되든 안 되든, 왜 그런지 스스로 설명할 수 있어야
//    합니다.
//
// 2. useCallback이 없다면 어떤 문제가 생길까요? 예를 들어 자식 컴포넌트에게
//    이벤트 핸들러 함수를 props로 넘기고, 그 자식이 "props가 이전과
//    같으면 리렌더링을 건너뛴다"는 최적화를 한다고 가정해보세요 (지금
//    mini-react는 이런 최적화 자체가 없지만, 실제 React의 React.memo가
//    하는 일입니다). useCallback 없이 매번 새 함수를 넘기면 그 최적화가
//    왜 무력화되는지 생각해보세요.
