import { Select } from "antd";

const PageTypeDropdown = ({
    value,
    onChange,
    placeholder = "Select Page Type",
    ...props
}) => {
    const options = [
        { value: "homepage", label: "Homepage" },
        { value: "about", label: "About" },
        { value: "course", label: "Course" },
        { value: "course-details", label: "Course Details" },
        { value: "contact-us", label: "Contact Us" },
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

export default PageTypeDropdown;
