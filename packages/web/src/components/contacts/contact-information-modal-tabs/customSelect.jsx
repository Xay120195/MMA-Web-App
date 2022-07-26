import React, { useEffect, useRef, useState } from "react";
import Select, { components } from "react-select";
import { IoCaretDown } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";

const { MenuList, ValueContainer, SingleValue, Placeholder } = components;

const CustomMenuList = ({ selectProps, ...props }) => {
  const { onInputChange, inputValue, onMenuInputFocus } = selectProps;
  const change = useRef(null);
  // Copied from source
  const ariaAttributes = {
    "aria-autocomplete": "list",
    "aria-label": selectProps["aria-label"],
    "aria-labelledby": selectProps["aria-labelledby"],
  };

  return (
    <div>
      <div className="flex flex-row justify-center items-center px-2">
        <IoIosSearch className="text-lg" />
        <input
          className="outline-0 focus:outline-0"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 10,
            border: "none",
            outline: "none",
          }}
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          type="text"
          value={inputValue}
          onChange={(e) => {
            onInputChange(e.currentTarget.value, {
              action: "input-change",
            });

            if (e.currentTarget.value.length === 0) {
              change.current.innerHTML = "RESULTS";
            } else {
              change.current.innerHTML = "SUGGESTED RESULTS";
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.target.focus();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.target.focus();
          }}
          onFocus={onMenuInputFocus}
          placeholder={"Search..."}
          {...ariaAttributes}
        />
      </div>
      <div ref={change} className="text-xs font-medium text-gray-300 mx-2 my-2">
        RESULTS
      </div>
      <MenuList {...props} selectProps={selectProps} />
    </div>
  );
};

const DropdownIndicator = (props) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <IoCaretDown className="text-sm" />
      </components.DropdownIndicator>
    )
  );
};

// Set custom `SingleValue` and `Placeholder` to keep them when searching
const CustomValueContainer = ({ children, selectProps, ...props }) => {
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
    <ValueContainer {...props} selectProps={selectProps}>
      {React.Children.map(children, (child) => {
        return child ? (
          child
        ) : props.hasValue ? (
          <SingleValue
            {...commonProps}
            isFocused={selectProps.isFocused}
            isDisabled={selectProps.isDisabled}
          >
            {selectProps.getOptionLabel(props.getValue()[0])}
          </SingleValue>
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
    </ValueContainer>
  );
};

const SingleSelect = ({
  value,
  options,
  handleSelectChange,
  isEditing,
  name,
  i
}) => {
  const containerRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const onDomClick = (e) => {
    let menu = containerRef.current.querySelector(".select__menu");

    if (
      !containerRef.current.contains(e.target) ||
      !menu ||
      !menu.contains(e.target)
    ) {
      setIsFocused(false);
      setInputValue("");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", onDomClick);

    return () => {
      document.removeEventListener("mousedown", onDomClick);
    };
  }, []);

  return (
    <div ref={containerRef}>
      <Select
        name={name}
        isDisabled={!isEditing}
        onChange={(e, val) => {
          handleSelectChange(e, val, i, `subheader`);
          setIsFocused(false);
        }}
        className="rounded-md w-56 focus:border-gray-100 text-gray-400"
        classNamePrefix="select"
        options={options}
        components={{
          MenuList: CustomMenuList,
          ValueContainer: CustomValueContainer,
          IndicatorSeparator: () => null,
          DropdownIndicator: DropdownIndicator,
        }}
        value={value}
        inputValue={inputValue}
        isSearchable={false}
        onMenuInputFocus={() => setIsFocused(true)}
        onInputChange={(val) => setInputValue(val)}
        {...{
          menuIsOpen: isFocused || undefined,
          isFocused: isFocused || undefined,
        }}
      />
    </div>
  );
};

export default SingleSelect;
