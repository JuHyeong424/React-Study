// Day 4 목표: useEffect 훅
//
// useState가 "값을 기억하는" 훅이었다면, useEffect는 "렌더링이 끝난 뒤에
// 부수효과(side effect)를 실행하는" 훅입니다. 의존성 배열(deps)에 따라
// 실행 여부가 달라지고, cleanup 함수가 다음 실행 전에 호출된다는 점이 핵심입니다.
//
// 실행: node test/day4-spec.js
//
// 이 파일에도 구현은 없습니다 - src/index.js에 useEffect를 직접 추가해서
// 아래 케이스들을 통과시켜보세요.

import { JSDOM } from "jsdom";
import { createElement, render, useState, useEffect } from "../src/index.js";

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

// 체크포인트: useEffect에 넘긴 콜백은 렌더링이 끝난 뒤 실행되어야 한다.
run("체크포인트: useEffect 콜백 실행", () => {
  let effectRan = false;
  function App() {
    useEffect(() => {
      effectRan = true;
    });
    return createElement("p", null, "hello");
  }
  render(createElement(App, null), freshContainer());

  assert(effectRan === true, "렌더링 후 useEffect 콜백이 실행되어야 한다");
});

// 케이스 1: 의존성 배열을 안 넘기면, 리렌더링될 때마다 매번 다시 실행되어야 한다.
run("케이스 1: 의존성 배열 없음 - 매 렌더링마다 실행", () => {
  let runCount = 0;
  let setCount;
  function App() {
    const [count, setCountFn] = useState(0);
    setCount = setCountFn;
    useEffect(() => {
      runCount++;
    });
    return createElement("p", null, String(count));
  }
  const container = freshContainer();
  render(createElement(App, null), container);
  assert(runCount === 1, "첫 렌더링 후 1번 실행되어야 한다");

  setCount(1);
  assert(runCount === 2, "리렌더링될 때마다 다시 실행되어야 한다");
});

// 케이스 2: 빈 배열([])을 넘기면, 처음 한 번만 실행되고 이후로는 실행되면 안 된다.
run("케이스 2: 빈 의존성 배열 - 처음 한 번만 실행", () => {
  let runCount = 0;
  let setCount;
  function App() {
    const [count, setCountFn] = useState(0);
    setCount = setCountFn;
    useEffect(() => {
      runCount++;
    }, []);
    return createElement("p", null, String(count));
  }
  const container = freshContainer();
  render(createElement(App, null), container);
  assert(runCount === 1, "첫 렌더링 후 1번 실행되어야 한다");

  setCount(1);
  setCount(2);
  assert(runCount === 1, "빈 배열이면 리렌더링해도 다시 실행되면 안 된다");
});

// 케이스 3: 의존성 배열 안의 값이 바뀌었을 때만 다시 실행되어야 한다.
run("케이스 3: 의존성 배열 값 비교", () => {
  let runCount = 0;
  let setCount, setOther;
  function App() {
    const [count, setCountFn] = useState(0);
    const [other, setOtherFn] = useState("a");
    setCount = setCountFn;
    setOther = setOtherFn;
    useEffect(() => {
      runCount++;
    }, [count]);
    return createElement("p", null, `${count}-${other}`);
  }
  const container = freshContainer();
  render(createElement(App, null), container);
  assert(runCount === 1, "첫 렌더링 후 1번 실행되어야 한다");

  setOther("b"); // count는 그대로, other만 바뀜
  assert(runCount === 1, "의존성(count)이 안 바뀌었으면 다시 실행되면 안 된다");

  setCount(1); // count가 바뀜
  assert(runCount === 2, "의존성(count)이 바뀌면 다시 실행되어야 한다");
});

// 케이스 4: 콜백이 함수를 반환하면(cleanup), 다음 실행 직전에 그 함수가 먼저 호출되어야 한다.
run("케이스 4: cleanup 함수는 다음 effect 실행 전에 호출된다", () => {
  let effectCalls = 0;
  let cleanupCalls = 0;
  let setCount;
  function App() {
    const [count, setCountFn] = useState(0);
    setCount = setCountFn;
    useEffect(() => {
      effectCalls++;
      return () => {
        cleanupCalls++;
      };
    }, [count]);
    return createElement("p", null, String(count));
  }
  const container = freshContainer();
  render(createElement(App, null), container);
  assert(
    effectCalls === 1 && cleanupCalls === 0,
    "처음 렌더링에서는 cleanup이 아직 호출되면 안 된다",
  );

  setCount(1);
  assert(
    effectCalls === 2 && cleanupCalls === 1,
    "count가 바뀌면, 새 effect가 실행되기 전에 이전 cleanup이 먼저 호출되어야 한다",
  );
});

console.log(`\n결과: ${passed}개 통과, ${failed}개 실패`);
if (failed > 0) process.exitCode = 1;

// ---
// 참고 (강제로 테스트하지는 않지만 꼭 직접 확인해볼 것):
// 위 케이스 4에서, 만약 컴포넌트가 완전히 사라지는(언마운트되는) 순간에도
// cleanup이 호출되어야 할까요? 지금 mini-react는 "루트를 통째로 지우고
// 다시 그리는" 방식이라 개별 컴포넌트 단위의 언마운트라는 개념 자체가
// 없습니다. 이게 왜 v1 스코프 밖인지, 실제 React라면 이 문제를 어떻게
// 해결하는지(Fiber, 컴포넌트 인스턴스) 한번 생각해보세요.
