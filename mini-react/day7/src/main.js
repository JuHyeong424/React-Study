// index.html에서 불러오는 진입점입니다.
// index.js(day6에서 가져온 코드)에 useCallback을 추가한 뒤,
// 아래 주석을 풀어서 브라우저에서 눈으로 확인해보세요.
//
import { createElement, render, useState, useCallback } from "./index.js";

let externalSetCount;
let externalSetOther;
let previousHandler;

function App() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);
  externalSetCount = setCount;
  externalSetOther = setOther;

  // count가 바뀔 때만 새 함수가 만들어져야 한다 - other가 바뀌어서
  // 리렌더링될 때는 이전 렌더링과 "같은 함수 참조"가 재사용되어야 한다.
  const handleClick = useCallback(() => {
    console.log(`클릭! count = ${count}`);
  }, [count]);

  const isSameReference = handleClick === previousHandler;
  console.log(
    isSameReference
      ? "(이전 렌더링과 같은 함수 참조를 재사용함)"
      : "(새 함수가 만들어짐)",
  );
  previousHandler = handleClick;

  return createElement("p", null, `count: ${count}, other(관련없음): ${other}`);
}

render(createElement(App, null), document.getElementById("root"));

const countButton = document.createElement("button");
countButton.textContent = "count +1 (새 함수 생성 O)";
countButton.addEventListener("click", () => {
  externalSetCount((prev) => prev + 1);
});
document.body.appendChild(countButton);

const otherButton = document.createElement("button");
otherButton.textContent = "other +1 (함수 재사용)";
otherButton.addEventListener("click", () => {
  externalSetOther((prev) => prev + 1);
});
document.body.appendChild(otherButton);
//
// // 콘솔을 열어두고 두 버튼을 번갈아 눌러보세요. "other +1"을 누르면
// // "이전 렌더링과 같은 함수 참조를 재사용함"이 찍혀야 하고, "count +1"을
// // 누르면 "새 함수가 만들어짐"이 찍혀야 합니다.

console.log(
  "main.js 로드됨 - index.js에 useCallback을 구현한 후 위 주석을 해제하세요.",
);
