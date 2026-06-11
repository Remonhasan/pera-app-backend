import { Select } from "antd";

const SubmissionTypeDropdown = ({
    value,
    onChange,
    placeholder = "Select Submission Type",
    ...props
}) => {
    const options = [
        { value: "text", label: "Text" },
        { value: "file", label: "File" },
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

export default SubmissionTypeDropdown;
