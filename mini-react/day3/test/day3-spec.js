// Day 3 목표: useState 훅
import { JSDOM } from "jsdom";
import { createElement, render, useState } from "../src/index.js";

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

run("체크포인트: useState 반환 형태", () => {
  let captured;
  function Counter() {
    captured = useState(0);
    return createElement("p", null, String(captured[0]));
  }
  render(createElement(Counter, null), freshContainer());

  assert(Array.isArray(captured), "useState는 배열을 반환해야 한다");
  assert(captured.length === 2, "배열의 길이는 2([state, setState])여야 한다");
  assert(captured[0] === 0, "첫 번째 값은 초기값과 같아야 한다");
  assert(
    typeof captured[1] === "function",
    "두 번째 값은 함수(setState)여야 한다",
  );
});

run("케이스 1: 여러 개의 useState가 서로 섞이지 않는다", () => {
  let countState, nameState;
  function Profile() {
    countState = useState(0);
    nameState = useState("mini");
    return createElement("p", null, `${countState[0]}-${nameState[0]}`);
  }
  render(createElement(Profile, null), freshContainer());

  assert(countState[0] === 0, "첫 번째 useState의 초기값은 0이어야 한다");
  assert(nameState[0] === "mini", "두 번째 useState의 초기값은 mini여야 한다");
});

run("케이스 2: setState 호출 시 화면이 갱신된다", () => {
  let setCount;
  function Counter() {
    const [count, setCountFn] = useState(0);
    setCount = setCountFn;
    return createElement("p", null, `count: ${count}`);
  }
  const container = freshContainer();
  render(createElement(Counter, null), container);

  assert(container.textContent === "count: 0", "처음엔 초기값이 그려져야 한다");
  setCount(1);
  assert(
    container.textContent === "count: 1",
    "setState 호출 후 새 값이 화면에 반영되어야 한다",
  );
});

run("케이스 3: 상태는 리렌더링 사이에 유지된다", () => {
  let setCount;
  function Counter() {
    const [count, setCountFn] = useState(0);
    setCount = setCountFn;
    return createElement("p", null, `count: ${count}`);
  }
  const container = freshContainer();
  render(createElement(Counter, null), container);

  setCount(1);
  setCount(2);
  setCount(3);

  assert(
    container.textContent === "count: 3",
    "여러 번 연속으로 setState해도 매번 초기값(0)이 아니라 누적된 값이 반영되어야 한다",
  );
});

console.log(`\n결과: ${passed}개 통과, ${failed}개 실패`);
if (failed > 0) process.exitCode = 1;

// ---
// 참고 (강제로 테스트하지는 않지만 꼭 직접 실험해볼 것):
// 훅은 항상 "같은 순서로" 호출되어야 합니다.
//   function Bad(props) {
//     if (props.flag) {
//       const [a, setA] = useState('a');
//     }
//     const [b, setB] = useState('b');
//     ...
//   }
// props.flag가 렌더링마다 바뀐다면, b가 저장되는 슬롯 번호도 매번 바뀝니다.
// 왜 그런지, 그 결과 어떤 문제가 생기는지 직접 실험해보고 설명해보세요.
