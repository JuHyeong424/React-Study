export function createElement(type, props, ...children) {
  let updatedChildren = [...children];
  if (updatedChildren.length === 0) {
    updatedChildren = undefined;
  } else if (updatedChildren.length === 1) {
    updatedChildren = updatedChildren[0];
  }

  let updatedProps = { ...props, children: updatedChildren };

  return {
    type: type,
    props: updatedProps,
    key: null,
    ref: null,
  };
}

function renderFunction(element, container) {
  const functionResult = element.type(element.props);
  render(functionResult, container);
}

export function render(element, container) {
  if (typeof element.type === "function") {
    renderFunction(element, container);
    return;
  }

  const outer = document.createElement(element.type);
  container.appendChild(outer);
  if (element.props.className) outer.className = element.props.className;

  const renderChildren = (outer, element) => {
    if (Array.isArray(element.props.children)) {
      for (const child of element.props.children) {
        if (typeof child.type === "function") {
          renderFunction(child, outer);
          continue;
        }

        const inner = document.createElement(child.type);

        outer.appendChild(inner);
        if (child.props.className) inner.className = child.props.className;

        if (
          typeof child.props.children === "string" ||
          typeof child.props.children === "number"
        ) {
          const textNode = document.createTextNode(child.props.children);
          inner.appendChild(textNode);
        } else if (Array.isArray(child.props.children)) {
          renderChildren(inner, child);
        } else if (typeof child.props.children === "object") {
          if (typeof child.props.children.type === "function") {
            renderFunction(child.props.children, inner);
            continue;
          }

          const grandInner = document.createElement(child.props.children.type);
          inner.appendChild(grandInner);
          if (child.props.children.props.className)
            grandInner.className = child.props.children.props.className;

          renderChildren(grandInner, child.props.children);
        }
      }
    } else if (
      typeof element.props.children === "string" ||
      typeof element.props.children === "number"
    ) {
      const textNode = document.createTextNode(element.props.children);

      outer.appendChild(textNode);
    } else if (typeof element.props.children === "object") {
      if (typeof element.props.children.type === "function") {
        renderFunction(element.props.children, outer);
        return;
      }

      const inner = document.createElement(element.props.children.type);
      outer.appendChild(inner);
      if (element.props.children.props.className)
        inner.className = element.props.children.props.className;

      renderChildren(inner, element.props.children);
    }
  };

  renderChildren(outer, element);
}
