// index.html에서 불러오는 진입점입니다.
// index.js(day5에서 가져온 코드)에 useMemo를 추가한 뒤,
// 아래 주석을 풀어서 브라우저에서 눈으로 확인해보세요.
//
import { createElement, render, useState, useMemo } from "./index.js";

let externalSetCount;
let externalSetOther;

function expensiveCompute(count) {
  console.log(`(무거운 계산 실행됨, count=${count})`);
  let total = 0;
  for (let i = 0; i < 1e6; i++) total += i;
  return total + count;
}

function App() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);
  externalSetCount = setCount;
  externalSetOther = setOther;

  // count가 바뀔 때만 재계산되어야 한다 - other가 바뀌어서 리렌더링될
  // 때는 재계산되면 안 된다 (콘솔에 "무거운 계산 실행됨"이 안 찍혀야 함).
  const computed = useMemo(() => expensiveCompute(count), [count]);

  return createElement(
    "p",
    null,
    `count: ${count}, other(관련없음): ${other}, computed: ${computed}`,
  );
}

render(createElement(App, null), document.getElementById("root"));

const countButton = document.createElement("button");
countButton.textContent = "count +1 (재계산 O)";
countButton.addEventListener("click", () => {
  externalSetCount((prev) => prev + 1);
});
document.body.appendChild(countButton);

const otherButton = document.createElement("button");
otherButton.textContent = "other +1 (재계산 X)";
otherButton.addEventListener("click", () => {
  externalSetOther((prev) => prev + 1);
});
document.body.appendChild(otherButton);
//
// // 콘솔을 열어두고 두 버튼을 번갈아 눌러보세요. "count +1" 버튼을 누를
// // 때만 "(무거운 계산 실행됨...)" 로그가 찍히고, "other +1" 버튼을 눌러
// // 리렌더링이 일어날 때는 이 로그가 찍히지 않아야 합니다 - computed
// // 값은 이전 렌더링에서 계산해둔 걸 그대로 재사용하는 것입니다.

console.log(
  "main.js 로드됨 - index.js에 useMemo를 구현한 후 위 주석을 해제하세요.",
);
