// Day 5 목표: useRef
//
// useRef는 useState처럼 "렌더링 사이에 값을 기억"하지만, 결정적으로 다른 점이
// 하나 있습니다 - 그 값이 바뀌어도 리렌더링을 트리거하지 않는다는 것.
// (useMemo/useCallback은 다음 날 다룹니다.)
//
// 실행: node test/day5-spec.js
//
// 이 파일에도 구현은 없습니다 - src/index.js에 useRef를 직접 추가해서
// 아래 케이스들을 통과시켜보세요.

import { JSDOM } from "jsdom";
import { createElement, render, useState, useRef } from "../src/index.js";

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

// 체크포인트: useRef(초기값)은 { current: 초기값 } 형태의 객체여야 한다.
run("체크포인트: useRef 반환 형태", () => {
  let captured;
  function App() {
    captured = useRef("init");
    return createElement("p", null, "hi");
  }
  render(createElement(App, null), freshContainer());

  assert(
    typeof captured === "object" && captured !== null,
    "useRef는 객체를 반환해야 한다",
  );
  assert(captured.current === "init", ".current는 초기값과 같아야 한다");
});

// 케이스 1: 리렌더링 사이에도 매번 "같은" 객체 참조가 반환되어야 한다.
run("케이스 1: 리렌더링 사이에도 같은 객체 참조를 유지한다", () => {
  let firstRef, secondRef;
  let setCount;
  function App() {
    const [count, setCountFn] = useState(0);
    setCount = setCountFn;
    const ref = useRef("hello");
    if (count === 0) firstRef = ref;
    else secondRef = ref;
    return createElement("p", null, String(count));
  }
  const container = freshContainer();
  render(createElement(App, null), container);
  setCount(1);

  assert(
    firstRef === secondRef,
    "리렌더링 전후로 useRef가 반환한 객체는 동일한 참조여야 한다",
  );
});

// 케이스 2: .current를 바꾸는 것만으로는 리렌더링이 일어나면 안 되고,
// 다른 이유로 리렌더링이 일어났을 때 그 값이 유지되어야 한다.
run(
  "케이스 2: .current를 바꿔도 자동으로 리렌더링되지 않지만, 값은 유지된다",
  () => {
    let renderCount = 0;
    let myRef;
    let setCount;
    function App() {
      renderCount++;
      const [count, setCountFn] = useState(0);
      setCount = setCountFn;
      myRef = useRef(0);
      return createElement("p", null, String(count));
    }
    const container = freshContainer();
    render(createElement(App, null), container);
    assert(renderCount === 1, "첫 렌더링 후 렌더 횟수는 1이어야 한다");

    myRef.current = 999;
    assert(
      renderCount === 1,
      ".current를 바꾸는 것만으로는 리렌더링이 일어나면 안 된다",
    );

    setCount(1); // count는 다른 값이므로 정상적으로 리렌더링을 트리거한다
    assert(
      renderCount === 2,
      "setState로 인한 리렌더링은 정상적으로 일어나야 한다",
    );
    assert(
      myRef.current === 999,
      "리렌더링 후에도 .current에 저장해둔 값이 유지되어야 한다",
    );
  },
);

console.log(`\n결과: ${passed}개 통과, ${failed}개 실패`);
if (failed > 0) process.exitCode = 1;

// ---
// 참고 (강제로 테스트하지는 않지만 꼭 직접 확인해볼 것):
//
// 1. useRef를 useState로 대체하면 안 되는 이유를 직접 실험해보세요.
//    (예: useRef 대신 useState(0)를 쓰고 .current 대신 [value, setValue]를
//    쓰면, 케이스 2에서 어떤 차이가 생기나요? 렌더링 횟수를 세는 카운터나
//    setInterval의 id 저장처럼 "값은 바뀌어야 하는데 화면은 갱신되면 안
//    되는" 상황에서 useState를 쓰면 무슨 문제가 생기는지 생각해볼 것.)
//
// 2. 지금 mini-react는 useRef를 DOM 노드에 연결하는 것(`<div ref={myRef}>`
//    처럼 써서 실제 DOM 엘리먼트에 접근하는 것)은 지원하지 않습니다.
//    createElement가 만드는 객체에는 `ref` 필드가 이미 있지만 render()가
//    이걸 전혀 안 씁니다. 왜 v1 스코프에서 제외했는지, 지원하려면 render를
//    어떻게 고쳐야 할지 생각해보세요.
