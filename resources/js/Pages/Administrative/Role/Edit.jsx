import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useForm, usePage } from "@inertiajs/react";
import { Button, Card, Checkbox, Col, Drawer, Form, Input, Row } from "antd";
import { useState } from "react";

export default function Edit({ role }) {
    const title = "Edit Role";
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { permission } = usePage().props;

    const rolePermissions = role.permissions
        ? role.permissions.map((p) => p.id)
        : [];

    const { data, setData, put, processing, errors } = useForm({
        name: role.name ?? "",
        permissions: rolePermissions,
    });

    const showLoading = () => {
        setOpen(true);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 800);
    };

    const handleSubmit = () => {
        put(route("administrative.role.update", role.id), {
            onSuccess: () => setOpen(false),
        });
    };

    const onChange = (checkedValues) => {
        setData("permissions", checkedValues);
    };

    // Filter out Marital Status Management and Gender Management sections
    const filteredPermissions = permission
        ? permission.filter((group) => {
              const groupLabel = (group.label?.toLowerCase() || "").trim();
              return (
                  groupLabel !== "marital status management" &&
                  groupLabel !== "gender management"
              );
          })
        : [];

    // Group permissions by management label to combine same management groups
    const groupedPermissions = filteredPermissions.reduce((acc, group) => {
        const label = group.label;
        if (!acc[label]) {
            acc[label] = {
                label: label,
                options: [],
            };
        }
        // Merge options from groups with the same label
        if (group.options && Array.isArray(group.options)) {
            acc[label].options = [...acc[label].options, ...group.options];
        }
        return acc;
    }, {});

    // Convert grouped object back to array
    const options = Object.values(groupedPermissions);

    // Get all permission values
    const allPermissionValues = options.flatMap((group) =>
        group.options ? group.options.map((opt) => opt.value) : []
    );

    // Check if all permissions are selected
    const isAllSelected =
        allPermissionValues.length > 0 &&
        allPermissionValues.every((value) => data.permissions.includes(value));

    // Handle select all checkbox
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setData("permissions", allPermissionValues);
        } else {
            setData("permissions", []);
        }
    };

    return (
        <div>
            <Button
                color="primary"
                variant="outlined"
                icon={<EditOutlined />}
                onClick={showLoading}
            ></Button>
            <Drawer
                closable
                destroyOnClose
                title={<p>{title}</p>}
                placement="right"
                open={open}
                loading={loading}
                size={"large"}
                onClose={() => setOpen(false)}
                headerStyle={{
                    backgroundColor: "#1e3a5f",
                    color: "#ffffff",
                    borderBottom: "none",
                }}
                bodyStyle={{
                    padding: "24px",
                }}
                footer={
                    <div style={{ textAlign: "right" }}>
                        <Button
                            type="default"
                            icon={<CloseOutlined />}
                            onClick={() => setOpen(false)}
                            style={{ marginRight: 8 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => handleSubmit()}
                            loading={processing}
                            className="submit-btn"
                            style={{
                                backgroundColor: "#1e3a5f",
                                borderColor: "#1e3a5f",
                            }}
                        >
                            Submit
                        </Button>
                    </div>
                }
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    id="submitForm"
                    initialValues={{ remember: true }}
                    autoComplete="off"
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="name"
                                label="Role Name"
                                initialValue={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "The Role Name field is required.",
                                    },
                                ]}
                                help={
                                    <span style={{ color: "red" }}>
                                        {errors.name}
                                    </span>
                                }
                            >
                                <Input
                                    value={data.name}
                                    className="text-input"
                                    placeholder="Enter Role Name"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24}>
                            <Form.Item>
                                <Checkbox
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    className="select-all-checkbox"
                                >
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "15px",
                                        }}
                                    >
                                        Select All Permissions
                                    </span>
                                </Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Checkbox.Group
                        onChange={onChange}
                        value={data.permissions}
                    >
                        <Row gutter={[16, 16]}>
                            {options
                                ? options.map((group) => (
                                      <Col
                                          xs={24}
                                          sm={24}
                                          md={12}
                                          lg={12}
                                          xl={12}
                                          key={group.label}
                                      >
                                          <Card
                                              title={group.label}
                                              className="permission-checkbox-card"
                                              headStyle={{
                                                  backgroundColor: "#1e3a5f",
                                                  color: "#ffffff",
                                                  borderBottom:
                                                      "2px solid #93c5fd",
                                                  borderRadius: "8px 8px 0 0",
                                                  fontWeight: 600,
                                                  fontSize: "15px",
                                                  padding: "12px 16px",
                                              }}
                                              bodyStyle={{
                                                  padding: "16px",
                                                  backgroundColor: "#fafafa",
                                                  borderRadius: "0 0 8px 8px",
                                              }}
                                          >
                                              {group.options.map((option) => (
                                                  <div
                                                      key={option.value}
                                                      className="permission-checkbox-item"
                                                  >
                                                      <Checkbox
                                                          key={option.value}
                                                          value={option.value}
                                                      >
                                                          {option.label}
                                                      </Checkbox>
                                                  </div>
                                              ))}
                                          </Card>
                                      </Col>
                                  ))
                                : ""}
                        </Row>
                    </Checkbox.Group>
                </Form>
            </Drawer>
            <style>{`
                /* Deep green header styling */
                .ant-drawer-header {
                    background-color: #1e3a5f !important;
                }
                .ant-drawer-header .ant-drawer-title {
                    color: #ffffff !important;
                }
                .ant-drawer-header .ant-drawer-close {
                    color: #ffffff !important;
                }
                .ant-drawer-header .ant-drawer-close:hover {
                    color: rgba(255, 255, 255, 0.8) !important;
                }
                
                /* Permission Card Styling */
                .permission-checkbox-card {
                    border-radius: 8px !important;
                    overflow: hidden !important;
                    box-shadow: 0 2px 8px rgba(4, 76, 66, 0.1) !important;
                    transition: all 0.3s ease !important;
                    border: 1px solid rgba(4, 76, 66, 0.1) !important;
                    margin-bottom: 16px !important;
                }
                
                .permission-checkbox-card:hover {
                    box-shadow: 0 4px 16px rgba(4, 76, 66, 0.2) !important;
                    transform: translateY(-2px) !important;
                }
                
                .permission-checkbox-card .ant-card-head-title {
                    color: #ffffff !important;
                    font-weight: 600 !important;
                }
                
                .permission-checkbox-item {
                    padding: 8px 0 !important;
                    transition: all 0.2s ease !important;
                }
                
                .permission-checkbox-item:hover {
                    background-color: rgba(150, 232, 115, 0.1) !important;
                    border-radius: 4px !important;
                    padding-left: 8px !important;
                    margin-left: -8px !important;
                    margin-right: -8px !important;
                }
                
                .permission-checkbox-item .ant-checkbox-wrapper {
                    width: 100% !important;
                    padding: 4px 0 !important;
                    font-size: 14px !important;
                    color: #262626 !important;
                }
                
                .permission-checkbox-item .ant-checkbox-wrapper:hover {
                    color: #1e3a5f !important;
                }
                
                .permission-checkbox-item .ant-checkbox-checked .ant-checkbox-inner {
                    background-color: #1e3a5f !important;
                    border-color: #1e3a5f !important;
                }
                
                .permission-checkbox-item .ant-checkbox-wrapper:hover .ant-checkbox-inner {
                    border-color: #93c5fd !important;
                }
                
                .permission-checkbox-item .ant-checkbox-checked .ant-checkbox-inner::after {
                    border-color: #ffffff !important;
                }
                
                /* Select All Checkbox Styling */
                .select-all-checkbox {
                    padding: 12px 16px !important;
                    background-color: rgba(4, 76, 66, 0.05) !important;
                    border-radius: 8px !important;
                    border: 1px solid rgba(4, 76, 66, 0.2) !important;
                    transition: all 0.3s ease !important;
                }
                
                .select-all-checkbox:hover {
                    background-color: rgba(4, 76, 66, 0.1) !important;
                    border-color: #1e3a5f !important;
                }
                
                .select-all-checkbox .ant-checkbox-checked .ant-checkbox-inner {
                    background-color: #1e3a5f !important;
                    border-color: #1e3a5f !important;
                }
                
                .select-all-checkbox .ant-checkbox-wrapper:hover .ant-checkbox-inner {
                    border-color: #93c5fd !important;
                }
            `}</style>
        </div>
    );
}
