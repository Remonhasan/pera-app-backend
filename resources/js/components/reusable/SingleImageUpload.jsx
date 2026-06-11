import { Upload, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

/** Build browser URL for a path stored on the `public` disk (e.g. uploads/… or storage/…). */
export function storagePublicUrl(path) {
    if (path == null || path === "") return "";
    const s = String(path).trim().replace(/\\/g, "/");
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/storage/")) return s;
    const noLead = s.replace(/^\/+/, "");
    if (noLead.startsWith("storage/")) return `/${noLead}`;
    return `/storage/${noLead}`;
}

// Helper to convert file to base64
const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

export default function SingleImageUpload({ value = null, onChange }) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [fileList, setFileList] = useState([]);

    // Normalize file when value changes
    useEffect(() => {
        const normalizeFile = async (file) => {
            if (!file) return [];

            // Check if file is a string path (existing file from server)
            if (typeof file === "string") {
                const url = storagePublicUrl(file);
                const baseName = file.split("/").pop() || "image";
                const normalized = {
                    uid: "-server-1",
                    name: baseName.length > 24 ? `${baseName.slice(0, 12)}…` : baseName,
                    status: "done",
                    url,
                    thumbUrl: url,
                };
                return [normalized];
            }

            // Check if file is a raw File object (from parent storing originFileObj)
            if (file instanceof File) {
                const normalized = {
                    uid: Date.now().toString(),
                    name: file.name,
                    status: "done",
                    originFileObj: file,
                    type: file.type,
                };
                normalized.thumbUrl = await getBase64(file);
                return [normalized];
            }

            // Otherwise, it's an Ant Design file object - preserve all properties
            const normalized = { ...file };
            normalized.uid = normalized.uid || Date.now().toString();
            normalized.status = "done";

            if (!normalized.type && normalized.originFileObj) {
                normalized.type = normalized.originFileObj.type;
            }

            if (normalized.url) {
                normalized.url = storagePublicUrl(String(normalized.url));
            }

            if (!normalized.thumbUrl) {
                if (normalized.originFileObj) {
                    normalized.thumbUrl = await getBase64(normalized.originFileObj);
                } else if (normalized.url) {
                    normalized.thumbUrl = normalized.url;
                }
            } else if (normalized.thumbUrl) {
                const th = String(normalized.thumbUrl);
                if (!/^https?:\/\//i.test(th)) {
                    normalized.thumbUrl = storagePublicUrl(th);
                }
            }

            return [normalized];
        };

        (async () => {
            const normalizedList = await normalizeFile(value);
            setFileList(normalizedList);
        })();
    }, [value]);

    const handleChange = ({ fileList: next }) => {
        setFileList(next);
        const first = next[0];
        if (!first) {
            onChange?.(null);
            return;
        }
        if (first.originFileObj instanceof File) {
            onChange?.(first.originFileObj);
            return;
        }
        // Server-side file: parent already has the stored path; no update needed
    };

    return (
        <>
            <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                fileList={fileList}
                onChange={handleChange}
                showUploadList={{
                    showPreviewIcon: false,
                    showRemoveIcon: true,
                }}
                onPreview={async (file) => {
                    if (file.originFileObj) {
                        const src = await getBase64(file.originFileObj);
                        setPreviewImage(src);
                        setPreviewOpen(true);
                    } else if (file.thumbUrl) {
                        setPreviewImage(file.thumbUrl);
                        setPreviewOpen(true);
                    } else if (file.url) {
                        setPreviewImage(file.url);
                        setPreviewOpen(true);
                    }
                }}
            >
                {fileList.length < 1 && (
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                )}
            </Upload>

            <Image
                preview={{
                    visible: previewOpen,
                    src: previewImage,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                }}
            />
        </>
    );
}
