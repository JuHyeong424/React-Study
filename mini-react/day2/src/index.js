export function createElement(type, props, ...children) {
  let updatedChildren = [...children];
  if (updatedChildren.length === 0) {
    updatedChildren = undefined;
  } else if (updatedChildren.length === 1) {
    updatedChildren = updatedChildren[0];
  }

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

export function render(element, container) {
  const outer = document.createElement(element.type);
  container.appendChild(outer);
  if (element.props.className) outer.className = element.props.className;

  const renderChildren = (outer, element) => {
    if (Array.isArray(element.props.children)) {
      for (const child of element.props.children) {
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
        }
      }
    } else if (
      typeof element.props.children === "string" ||
      typeof element.props.children === "number"
    ) {
      const textNode = document.createTextNode(element.props.children);
      outer.appendChild(textNode);
    } else if (typeof element.props.children === "object") {
      const inner = document.createElement(element.props.children.type);
      outer.appendChild(inner);
      if (element.props.children.props.className)
        inner.className = element.props.children.props.className;

      renderChildren(inner, element.props.children);
    }
  };

  renderChildren(outer, element);
}
