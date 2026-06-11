import { Select } from "antd";

const DeadlineTypeDropdown = ({
    value,
    onChange,
    placeholder = "Select Deadline Type",
    ...props
}) => {
    const options = [
        { value: "duration", label: "Duration (hours)" },
        { value: "day", label: "Day" },
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

export default DeadlineTypeDropdown;
