import { Avatar, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ADMIN_NAVY } from "@/theme/adminColors";

const UserAvatar = ({ items, auth }) => {
    const userImage = auth.user?.image ? `/storage/${auth.user.image}` : null;

    return (
        <Dropdown menu={{ items }} placement="bottomRight" arrow>
            <div
                style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <Avatar
                    src={userImage}
                    icon={!userImage ? <UserOutlined /> : null}
                    size="medium"
                    alt="User"
                    style={{
                        backgroundColor: userImage ? "transparent" : "#ffffff",
                        color: userImage ? "inherit" : ADMIN_NAVY,
                    }}
                />
                {/* <span style={{ fontWeight: "500" }}>
                {auth.user ? auth.user.name : ""}
            </span> */}
            </div>
        </Dropdown>
    );
};
export default UserAvatar;
