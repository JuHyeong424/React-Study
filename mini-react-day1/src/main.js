// index.html에서 불러오는 진입점입니다.
// index.js를 구현한 뒤, 아래 주석을 풀어서 브라우저에서 눈으로 확인해보세요.
//
import { createElement, render } from "./index.js";

const tree = createElement(
  "div",
  { className: "card" },
  createElement("h1", null, "Hello, Mini React"),
  createElement("p", null, "이 문장이 보이면 정적 렌더링 성공!"),
);

render(tree, document.getElementById("root"));

console.log("main.js 로드됨 - index.js 구현 후 위 주석을 해제하세요.");
