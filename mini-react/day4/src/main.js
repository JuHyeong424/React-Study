// index.html에서 불러오는 진입점입니다.
// index.js(day3에서 가져온 코드)에 useEffect를 추가한 뒤,
// 아래 주석을 풀어서 브라우저에서 눈으로 확인해보세요.
//
import { createElement, render, useState, useEffect } from "./index.js";

let externalSetCount;

function Counter() {
  const [count, setCount] = useState(0);
  externalSetCount = setCount;

  useEffect(() => {
    console.log(`effect 실행됨, count = ${count}`);
    document.title = `count: ${count}`;

    return () => {
      console.log(
        `cleanup 실행됨 (다음 count로 넘어가기 직전), 이전 count = ${count}`,
      );
    };
  }, [count]);

  return createElement("p", null, `버튼을 눌러보세요: ${count}`);
}

render(createElement(Counter, null), document.getElementById("root"));

const button = document.createElement("button");
button.textContent = "+1";
button.addEventListener("click", () => {
  externalSetCount((prev) => prev + 1);
});
document.body.appendChild(button);

// // 콘솔을 열어두고 버튼을 눌러보면서, effect와 cleanup이 각각 언제
// // 실행되는지(그리고 어떤 순서로 실행되는지) 직접 관찰해보세요.

console.log(
  "main.js 로드됨 - index.js에 useEffect를 구현한 후 위 주석을 해제하세요.",
);
