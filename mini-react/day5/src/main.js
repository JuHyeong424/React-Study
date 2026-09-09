// index.html에서 불러오는 진입점입니다.
import { createElement, render, useState, useRef } from "./index.js";

let externalSetCount;
let externalMutateRefOnly;

// 화면 갱신과 무관하게, "App 함수가 실제로 몇 번 호출됐는지"를 세는
// 순수 변수. renderCount.current(ref)와 값이 늘 같이 움직이는지 비교해보세요.
let actualCallCount = 0;

function App() {
  actualCallCount += 1;

  const [count, setCount] = useState(0);
  externalSetCount = setCount;

  // 렌더링 횟수를 세지만, 이 값 자체가 바뀐다고 화면이 다시 그려지지는
  // 않는다 - count가 바뀌어서 리렌더링될 때 "따라서" 갱신될 뿐이다.
  const renderCount = useRef(0);
  renderCount.current += 1;

  // 버튼 클릭 핸들러에서 setState 없이 .current만 바꿔볼 수 있도록 노출.
  externalMutateRefOnly = () => {
    renderCount.current += 100;
    console.log(
      `[리렌더링 없이 .current만 변경] renderCount.current = ${renderCount.current} (화면은 아직 안 바뀜)`,
    );
  };

  console.log(
    `App() 실행 - count: ${count}, renderCount.current: ${renderCount.current}, actualCallCount: ${actualCallCount}`,
  );

  return createElement(
    "div",
    null,
    createElement("p", null, `count (state): ${count}`),
    createElement(
      "p",
      null,
      `renderCount.current (ref): ${renderCount.current}`,
    ),
    createElement("p", null, `actualCallCount (순수 변수): ${actualCallCount}`),
  );
}

render(createElement(App, null), document.getElementById("root"));

const plusButton = document.createElement("button");
plusButton.textContent = "+1 (state 변경 → 리렌더링)";
plusButton.addEventListener("click", () => {
  externalSetCount((prev) => prev + 1);
});
document.body.appendChild(plusButton);

const mutateButton = document.createElement("button");
mutateButton.textContent = "ref.current만 변경 (리렌더링 없음)";
mutateButton.addEventListener("click", () => {
  externalMutateRefOnly();
});
document.body.appendChild(mutateButton);

console.log("main.js 로드됨. 콘솔을 열어두고 두 버튼을 번갈아 눌러보세요.");
