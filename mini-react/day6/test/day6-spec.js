// Day 6 목표: useMemo
//
// useMemo는 "계산 비용이 큰 값"을 매 렌더링마다 다시 계산하지 않고, 의존성
// 배열이 바뀔 때만 다시 계산해서 기억해두는 훅입니다. useEffect의 deps 비교
// 로직과 닮았지만, 결정적으로 다른 점이 있습니다 - useEffect는 "실행 안
// 함"이 곧 "아무것도 안 함"이었지만, useMemo는 계산을 스킵하더라도 값은
// 반드시 반환해야 합니다 (그것도 "이전 렌더링에서 계산해둔 바로 그 값").
//
// 실행: node test/day6-spec.js
//
// 이 파일에도 구현은 없습니다 - src/index.js에 useMemo를 직접 추가해서
// 아래 케이스들을 통과시켜보세요.

import { JSDOM } from "jsdom";
import { createElement, render, useState, useMemo } from "../src/index.js";

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

// 체크포인트: useMemo(계산함수, deps)는 계산 함수의 반환값을 그대로 돌려줘야 한다.
run("체크포인트: useMemo 반환값", () => {
  let captured;
  function App() {
    captured = useMemo(() => 1 + 1, []);
    return createElement("p", null, "hi");
  }
  render(createElement(App, null), freshContainer());

  assert(captured === 2, "useMemo는 계산 함수의 반환값을 그대로 반환해야 한다");
});

// 케이스 1: 의존성 배열이 안 바뀌면, 계산 함수를 다시 실행하지 않고 "이전
// 렌더링에서 계산해둔 값"을 그대로 재사용해야 한다.
// (계산 함수 호출 횟수 + 객체 참조 동일성으로 검증)
run("케이스 1: deps가 안 바뀌면 재계산하지 않는다", () => {
  let computeCount = 0;
  let firstValue, secondValue;
  let setCount;
  function App() {
    const [count, setCountFn] = useState(0);
    setCount = setCountFn;

    // count와 무관한 고정 deps를 넘겨서, count가 바뀌어도 이 useMemo는
    // 재계산되면 안 된다.
    const value = useMemo(() => {
      computeCount++;
      return { label: "fixed" };
    }, ["fixed"]);

    if (count === 0) firstValue = value;
    else secondValue = value;

    return createElement("p", null, String(count));
  }
  const container = freshContainer();
  render(createElement(App, null), container);
  setCount(1);

  assert(
    computeCount === 1,
    "deps가 바뀌지 않으면 계산 함수는 딱 한 번만 실행되어야 한다",
  );
  assert(
    firstValue === secondValue,
    "deps가 안 바뀌면 이전 렌더링과 같은 참조를 반환해야 한다",
  );
});

// 케이스 2: 의존성 배열의 값이 바뀌면, 계산 함수를 다시 실행해서 새 값을
// 반환해야 한다.
run("케이스 2: deps가 바뀌면 재계산한다", () => {
  let computeCount = 0;
  let firstValue, secondValue;
  let setCount;
  function App() {
    const [count, setCountFn] = useState(0);
    setCount = setCountFn;

    const value = useMemo(() => {
      computeCount++;
      return { doubled: count * 2 };
    }, [count]);

    if (count === 0) firstValue = value;
    else secondValue = value;

    return createElement("p", null, String(count));
  }
  const container = freshContainer();
  render(createElement(App, null), container);
  setCount(1);

  assert(computeCount === 2, "deps가 바뀌면 계산 함수가 다시 실행되어야 한다");
  assert(
    firstValue !== secondValue,
    "deps가 바뀌면 새로운 참조(재계산된 값)를 반환해야 한다",
  );
  assert(secondValue.doubled === 2, "재계산된 값은 최신 count를 반영해야 한다");
});

console.log(`\n결과: ${passed}개 통과, ${failed}개 실패`);
if (failed > 0) process.exitCode = 1;

// ---
// 참고 (강제로 테스트하지는 않지만 꼭 직접 확인해볼 것):
//
// 1. useMemo(fn, deps)를 그냥 fn()으로 바꿔서(=매번 새로 계산해서) 쓰면
//    안 되는 이유를 생각해보세요. 지금 mini-react는 렌더링 자체가 이미
//    "루트를 통째로 다시 그리는" 비효율적인 방식인데, 그 위에서 useMemo가
//    실제로 아끼는 건 무엇일까요? (힌트: DOM 재생성 비용이 아니라 "계산"
//    비용 - 배열 정렬, 필터링처럼 순수 JS 연산.)
//
// 2. useMemo(fn, [])처럼 빈 배열을 넘기면, 첫 렌더링 이후로는 절대
//    재계산되지 않아야 합니다. 케이스 1처럼 직접 실험해서 확인해보세요.
