import { Upload, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

// Helper to convert file to base64
const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

export default function MultipleImageUpload({ value = [], onChange }) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [fileList, setFileList] = useState([]);

    // Normalize files when value changes
    useEffect(() => {
        const normalizeFiles = async (files) => {
            if (!files || !files.length) return [];
            const normalizedList = await Promise.all(
                files.map(async (file) => {
                    // Check if file is a string path (existing file from server)
                    if (typeof file === 'string') {
                        const normalized = {
                            uid: Date.now().toString() + Math.random(),
                            name: file.split('/').pop() || 'file',
                            status: "done",
                            url: file.startsWith('http') ? file : `/storage/${file}`,
                            thumbUrl: file.startsWith('http') ? file : `/storage/${file}`,
                        };
                        return normalized;
                    }

                    // Check if file is a raw File object (from parent storing originFileObj)
                    if (file instanceof File) {
                        const normalized = {
                            uid: Date.now().toString() + Math.random(),
                            name: file.name,
                            status: "done",
                            originFileObj: file,
                            type: file.type,
                        };
                        normalized.thumbUrl = await getBase64(file);
                        return normalized;
                    }

                    // Otherwise, it's an Ant Design file object - preserve all properties
                    const normalized = { ...file };
                    normalized.uid =
                        normalized.uid || Date.now().toString() + Math.random();
                    normalized.status = "done";

                    if (!normalized.type && normalized.originFileObj) {
                        normalized.type = normalized.originFileObj.type;
                    }

                    // Ensure url is set and convert to full URL if it's a relative path
                    if (normalized.url && !normalized.url.startsWith('http') && !normalized.url.startsWith('/storage/')) {
                        normalized.url = `/storage/${normalized.url}`;
                    }

                    if (!normalized.thumbUrl) {
                        if (normalized.originFileObj) {
                            normalized.thumbUrl = await getBase64(
                                normalized.originFileObj
                            );
                        } else if (normalized.url) {
                            normalized.thumbUrl = normalized.url;
                        }
                    } else if (normalized.thumbUrl && !normalized.thumbUrl.startsWith('http') && !normalized.thumbUrl.startsWith('/storage/')) {
                        // Ensure thumbUrl is also a full URL
                        normalized.thumbUrl = `/storage/${normalized.thumbUrl}`;
                    }

                    return normalized;
                })
            );
            return normalizedList;
        };

        (async () => {
            const normalizedList = await normalizeFiles(value);
            setFileList(normalizedList);
        })();
    }, [value]);

    return (
        <>
            <Upload
                listType="picture-card"
                multiple
                beforeUpload={() => false} // prevent automatic upload
                fileList={fileList}
                onChange={({ fileList }) => onChange(fileList)}
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
                <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                </div>
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
