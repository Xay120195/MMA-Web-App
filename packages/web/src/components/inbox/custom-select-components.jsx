import { AiOutlinePlus } from "react-icons/ai";
import React, { useEffect, useRef, useState } from "react";
import { components } from "react-select";
const {
  MenuList,
  ValueContainer,
  SingleValue,
  Placeholder,
  MultiValueLabel,
  MultiValueContainer,
  MultiValue,
} = components;

export const CustomMenuList = ({ selectProps, ...props }) => {
  const { onInputChange, inputValue, onMenuInputFocus } = selectProps;
  const change = useRef(null);
  // Copied from source
  const ariaAttributes = {
    "aria-autocomplete": "list",
    "aria-label": selectProps["aria-label"],
    "aria-labelledby": selectProps["aria-labelledby"],
  };

  return (
    <div className="absolute bg-white w-full z-50" style={{ zIndex: "1000" }}>
      <div ref={change} className="bg-white text-xs font-medium text-gray-300 mx-2 my-2">
        OPTIONS
      </div>
      <MenuList {...props} selectProps={selectProps} />
    </div>
  );
};

export const CustomValueContainer = ({ children, selectProps, ...props }) => {
  const commonProps = {
    cx: props.cx,
    clearValue: props.clearValue,
    getStyles: props.getStyles,
    getValue: props.getValue,
    hasValue: props.hasValue,
    isMulti: props.isMulti,
    isRtl: props.isRtl,
    options: props.options,
    selectOption: props.selectOption,
    setValue: props.setValue,
    selectProps,
    theme: props.theme,
  };

  return (
    <MultiValueContainer {...props} selectProps={selectProps}>
      {React.Children.map(children, (child) => {
        return child ? (
          child
        ) : props.hasValue ? (
          <MultiValue
            {...commonProps}
            isFocused={selectProps.isFocused}
            isDisabled={selectProps.isDisabled}
          >
            {selectProps.getOptionLabel(props.getValue()[0])}
          </MultiValue>
        ) : (
          <Placeholder
            {...commonProps}
            key="placeholder"
            isDisabled={selectProps.isDisabled}
            data={props.getValue()}
          >
            {selectProps.placeholder}
          </Placeholder>
        );
      })}
    </MultiValueContainer>
  );
};
