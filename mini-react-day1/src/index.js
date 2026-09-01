// Day 1 목표: createElement + 정적 렌더링
//
// 진행 순서 (로드맵의 학습 방식 그대로):
//   1. 그림: element 객체 하나가 어떤 모양이어야 할지, 그리고 render가 그 객체를
//      어떻게 실제 DOM 트리로 바꾸는지 종이에 먼저 그려보세요.
//   2. 아래 두 함수의 동작 스펙(test/day1-spec.js)을 먼저 읽고, 통과시켜야 할
//      조건을 스스로 다시 문장으로 적어보세요.
//   3. 그 다음에 구현하세요. 막히면 test/day1-spec.js의 assert 메시지가 힌트입니다.
//
// 이 파일에는 정답이 없습니다 - 시그니처와 TODO만 남겨뒀어요.

/**
 * @param {string} type - 태그 이름 (예: 'div', 'h1')
 * @param {object|null} props - 속성 객체 (className 등). 없으면 null
 * @param {...(object|string|number)} children - 자식들. element 객체이거나 문자열/숫자
 * @returns {object} element 객체
 */
export function createElement(type, props, ...children) {
  // TODO: 여기를 구현하세요.
  // 힌트가 필요하면 test/day1-spec.js의 케이스 1~3을 먼저 통과시키는 걸 목표로 삼아보세요.

  // 1. children에 텍스트 1개이면 문자열 그대로 내보낸다.
  // 2. children이 여러 개면 배열로 나타낸다.
  let updatedChildren = [...children];
  if (updatedChildren.length === 0) {
    updatedChildren = undefined;
  } else if (updatedChildren.length === 1) {
    updatedChildren = updatedChildren[0];
  }

  // 3. props가 null이어도 동작한다.
  return {
    type: type,
    props: props
      ? {
          className: props.className ? props.className : null,
          children: updatedChildren,
        }
      : {
          children: updatedChildren,
        },
    key: null,
    ref: null,
  };
}

/**
 * @param {object} element - createElement가 반환한 element 객체
 * @param {HTMLElement} container - element를 붙일 실제 DOM 컨테이너
 */
export function render(element, container) {
  // TODO: 여기를 구현하세요.
  // 힌트: element.type으로 태그를 만들고, element.props의 children을 순회하면서
  // 문자열/숫자면 텍스트 노드로, 객체면 재귀적으로 render 하면 됩니다.
  
}
