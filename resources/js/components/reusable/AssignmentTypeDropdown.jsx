import { Select } from "antd";

const AssignmentTypeDropdown = ({
    value,
    onChange,
    placeholder = "Select Type",
    ...props
}) => {
    const options = [
        { value: "assignment", label: "Assignment" },
        { value: "activity", label: "Activity" },
    ];

    return (
        <Select
            className="input-select"
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            options={options}
            {...props}
        />
    );
};

export default AssignmentTypeDropdown;
