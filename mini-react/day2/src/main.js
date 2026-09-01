// index.html에서 불러오는 진입점입니다.
// index.js(day1에서 가져온 코드)에 함수형 컴포넌트 지원을 추가한 뒤,
// 아래 주석을 풀어서 브라우저에서 눈으로 확인해보세요.
//
// import { createElement, render } from './index.js';
//
// // Day 1에서 만들었던 tree를, 이번엔 "Card"라는 함수형 컴포넌트로 바꿔봅니다.
// // 최종적으로 화면에 보여야 할 모양은 Day 1과 완전히 동일합니다 - 다만 이번엔
// // div/h1/p를 직접 나열하는 대신, Card(props)라는 함수를 통해서 만들어집니다.
// function Card(props) {
//   return createElement(
//     'div',
//     { className: 'card' },
//     createElement('h1', null, props.title),
//     createElement('p', null, props.text)
//   );
// }
//
// const tree = createElement(Card, {
//   title: 'Hello, Mini React',
//   text: '이 문장이 보이면 컴포넌트 렌더링 성공!',
// });
//
// render(tree, document.getElementById('root'));

console.log('main.js 로드됨 - index.js에 함수형 컴포넌트 지원을 구현한 후 위 주석을 해제하세요.');
