// index.html에서 불러오는 진입점입니다.
import { createElement, render, useState } from "./index.js";

let externalSetCount; // 버튼 클릭 리스너에서 setCount를 호출하기 위해 밖으로 꺼내둡니다.

function Counter() {
  const [count, setCount] = useState(0);
  externalSetCount = setCount;
  return createElement("p", null, `버튼을 눌러보세요: ${count}`);
}

render(createElement(Counter, null), document.getElementById("root"));

// mini-react는 아직 onClick 같은 이벤트 props를 지원하지 않으니,
// 순수 DOM API로 버튼을 하나 만들어서 직접 리스너를 겁니다.
const button = document.createElement("button");
button.textContent = "+1";
button.addEventListener("click", () => {
  externalSetCount((prev) => prev + 1);
});
document.body.appendChild(button);
