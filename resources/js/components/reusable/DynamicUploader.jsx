import { Upload, Radio, message, Image, Select, Input } from "antd";
import {
    CloudUploadOutlined,
    FileTextOutlined,
    FilePdfOutlined,
    DeleteOutlined,
    PlusOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Dragger } = Upload;

// Helper to convert file to base64
const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

const fileTypeConfig = {
    Pdf: {
        accept: ".pdf",
        mimeType: "application/pdf",
        label: "PDF",
    },
    Doc: {
        accept: ".doc,.docx",
        mimeType:
            "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        label: "DOC",
    },
    ppt: {
        accept: ".ppt,.pptx",
        mimeType:
            "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
        label: "PPT",
    },
    Video: {
        accept: ".mp4,.mpg,.mpeg,.webm,.ogg,.avi,.mov,.flv,.swf,.mkv,.wmv",
        mimeType: "video/*",
        label: "VIDEO",
    },
    Audio: {
        accept: ".mp3,.wav,.wma,.aac",
        mimeType: "audio/*",
        label: "AUDIO",
    },
    Image: {
        accept: ".jpg,.jpeg,.png,.svg,.webp,.gif",
        mimeType: "image/*",
        label: "IMAGE",
    },
};

export default function DynamicUploader({
    value = null,
    onChange,
    defaultFileType = null,
    errorMsg = "",
}) {
    const [fileType, setFileType] = useState(defaultFileType || null);
    const [fileList, setFileList] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [videoSourceType, setVideoSourceType] = useState(null);
    const [videoLink, setVideoLink] = useState("");
  
    // Extract metadata from value object when loading existing files
    useEffect(() => {
        if (value && typeof value === "object" && !(value instanceof File)) {
            // Set fileType from value metadata if not already set
            if (value.file_type && !fileType) {
                setFileType(value.file_type);
            }
            // Set videoSourceType for video files
            if (value.video_source && !videoSourceType) {
                setVideoSourceType(value.video_source);
            }
            // Set videoLink for link-based videos
            if (value.isLink && value.url && !videoLink) {
                setVideoLink(value.url);
            }
        }
    }, [value, fileType, videoSourceType, videoLink]);

    // Normalize file when value changes
    useEffect(() => {
        const normalizeFile = async (file) => {
            if (!file) {
                setFileList([]);
                return;
            }

            // Check if file is a string path (existing file from server)
            if (typeof file === "string") {
                const normalized = {
                    uid: Date.now().toString(),
                    name: file.split("/").pop() || "file",
                    status: "done",
                    url: file.startsWith("http") ? file : `/storage/${file}`,
                };
                setFileList([normalized]);
                return;
            }

            // Check if file is a raw File object
            if (file instanceof File) {
                const normalized = {
                    uid: Date.now().toString(),
                    name: file.name,
                    status: "done",
                    originFileObj: file,
                    type: file.type,
                };
                // For images, get base64 for preview
                if (file.type.startsWith("image/")) {
                    try {
                        const base64 = await getBase64(file);
                        normalized.thumbUrl = base64;
                    } catch (error) {
                        console.error(
                            "Error converting image to base64:",
                            error,
                        );
                    }
                }
                setFileList([normalized]);
                return;
            }

            // Otherwise, it's an Ant Design file object (with metadata)
            const normalized = { ...file };
            normalized.uid = normalized.uid || Date.now().toString();
            normalized.status = normalized.status || "done";

            // Preserve metadata from existing files
            if (file.file_type) normalized.file_type = file.file_type;
            if (file.video_source) normalized.video_source = file.video_source;
            if (file.isLink) normalized.isLink = file.isLink;
            if (file.linkType) normalized.linkType = file.linkType;
            // Use original_file_name if available, otherwise keep existing name
            if (file.original_file_name && !normalized.name) {
                normalized.name = file.original_file_name;
            }

            setFileList([normalized]);
        };

        normalizeFile(value);
    }, [value]);

    const handleFileTypeChange = (value) => {
        setFileType(value || null);
        setFileList([]);
        setVideoSourceType(null);
        setVideoLink("");
        if (onChange) {
            onChange(null);
        }
    };

    const handleVideoSourceTypeChange = (value) => {
        setVideoSourceType(value);
        setFileList([]);
        setVideoLink("");
        if (onChange) {
            onChange(null);
        }
    };

    const uploadProps = {
        name: "file",
        accept: fileType ? fileTypeConfig[fileType].accept : "",
        maxCount: 1,
        fileList: fileList,
        beforeUpload: (file) => {
            // Validate file type
            if (!fileType) {
                message.error("Please select a file type first.");
                return Upload.LIST_IGNORE;
            }

            const config = fileTypeConfig[fileType];
            const fileExtension =
                "." + file.name.split(".").pop().toLowerCase();
            const acceptedExtensions = config.accept.split(",");

            if (
                !acceptedExtensions.some((ext) => fileExtension === ext.trim())
            ) {
                message.error(
                    `Please upload a ${config.label} file. Accepted formats: ${config.accept}`,
                );
                return Upload.LIST_IGNORE;
            }

            // Prevent automatic upload
            return false;
        },
        onChange: async (info) => {
            const newFileList = [...info.fileList];

            // Process the last file
            if (newFileList.length > 0) {
                const lastFile = newFileList[newFileList.length - 1];

                // For images, get base64 for preview
                if (
                    lastFile.originFileObj &&
                    lastFile.originFileObj.type.startsWith("image/")
                ) {
                    try {
                        const base64 = await getBase64(lastFile.originFileObj);
                        lastFile.thumbUrl = base64;
                    } catch (error) {
                        console.error(
                            "Error converting image to base64:",
                            error,
                        );
                    }
                }

                // For audio/video files, create object URL
                if (lastFile.originFileObj) {
                    const fileMimeType = lastFile.originFileObj.type;
                    if (
                        fileMimeType.startsWith("audio/") ||
                        fileMimeType.startsWith("video/")
                    ) {
                        try {
                            const objectUrl = URL.createObjectURL(
                                lastFile.originFileObj,
                            );
                            lastFile.url = objectUrl;
                            lastFile.thumbUrl = objectUrl;
                            // Store the URL in the file object for persistence
                            lastFile.originFileObj._objectUrl = objectUrl;
                        } catch (error) {
                            console.error("Error creating object URL:", error);
                        }
                    }
                }

                lastFile.status = "done";
                // Preserve original filename from File object
                if (lastFile.originFileObj && lastFile.originFileObj.name) {
                    lastFile.name = lastFile.originFileObj.name;
                }
                setFileList([lastFile]);

                // Pass the file object to parent with original filename preserved
                if (onChange) {
                    const fileToPass = lastFile.originFileObj || lastFile;
                    // If it's a File object, wrap it with name property and metadata for Video/Audio
                    if (fileToPass instanceof File) {
                        const payload = {
                            originFileObj: fileToPass,
                            name: fileToPass.name,
                            type: fileToPass.type,
                        };
                        if (fileType === "Video" || fileType === "Audio") {
                            payload.file_type = fileType;
                            payload.video_source =
                                fileType === "Video"
                                    ? "Attach Video"
                                    : "Attach Audio";
                        }
                        onChange(payload);
                    } else {
                        const payload = { ...fileToPass };
                        if (fileType === "Video" || fileType === "Audio") {
                            payload.file_type = payload.file_type || fileType;
                            payload.video_source =
                                payload.video_source || videoSourceType;
                        }
                        onChange(payload);
                    }
                }
            } else {
                setFileList([]);
                if (onChange) {
                    onChange(null);
                }
            }
        },
        onRemove: () => {
            // Clean up object URLs before removing
            fileList.forEach((file) => {
                if (file.url && file.url.startsWith("blob:")) {
                    URL.revokeObjectURL(file.url);
                }
            });
            setFileList([]);
            if (onChange) {
                onChange(null);
            }
        },
    };

    const formatDate = (date) => {
        if (!date)
            return new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        return new Date(date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const renderFileCard = () => {
        if (fileList.length === 0) return null;

        const file = fileList[0];
        const fileName = file.name || "Untitled";
        const fileDate = formatDate(
            file.lastModified ? new Date(file.lastModified) : new Date(),
        );

        // For images, use picture-card style
        if (fileType === "Image") {
            return (
                <>
                    <Upload
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false}
                        fileList={fileList}
                        onChange={uploadProps.onChange}
                        onRemove={uploadProps.onRemove}
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
                            onVisibleChange: (visible) =>
                                setPreviewOpen(visible),
                        }}
                    />
                </>
            );
        }

        // For PDF/Doc/Ppt, show card design
        if (fileType === "Pdf" || fileType === "Doc" || fileType === "ppt") {
            const FileIcon =
                fileType === "Pdf"
                    ? FilePdfOutlined
                    : FileTextOutlined; // Use FileTextOutlined for both Doc and Ppt
            const fileUrl =
                file.thumbUrl ||
                file.url ||
                (file.originFileObj
                    ? URL.createObjectURL(file.originFileObj)
                    : null);

            const iconGradient =
                fileType === "Pdf"
                    ? "linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)"
                    : fileType === "Doc"
                      ? "linear-gradient(135deg, #4285F4 0%, #34A853 100%)"
                      : fileType === "ppt"
                        ? "linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)" // Orange gradient for PPT
                        : "linear-gradient(135deg, #4285F4 0%, #34A853 100%)";

            const handleFileClick = () => {
                if (!fileUrl) return;

                if (fileType === "Pdf") {
                    // Open PDF in new tab
                    window.open(fileUrl, "_blank");
                } else {
                    // Download other files (Doc, Ppt, etc.)
                    const link = document.createElement("a");
                    link.href = fileUrl;
                    link.download = fileName || "file";
                    link.target = "_blank";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };

            return (
                <div
                    style={{
                        marginTop: "12px",
                        border: "1px solid #1e3a5f",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        background:
                            "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
                        boxShadow: "0 2px 8px rgba(4, 76, 66, 0.1)",
                        position: "relative",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(4, 76, 66, 0.15)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.borderColor = "#162f4d";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(4, 76, 66, 0.1)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "#1e3a5f";
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                background: iconGradient,
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                boxShadow: "0 2px 8px rgba(66, 133, 244, 0.25)",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <FileIcon
                                style={{
                                    fontSize: "20px",
                                    color: "#ffffff",
                                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
                                    position: "relative",
                                    zIndex: 1,
                                }}
                            />
                        </div>
                        <div
                            style={{
                                flex: 1,
                                minWidth: 0,
                                cursor: fileUrl ? "pointer" : "default",
                            }}
                            onClick={handleFileClick}
                            title={
                                fileType === "Pdf"
                                    ? "Click to view in new tab"
                                    : fileType === "ppt" || fileType === "Doc"
                                      ? "Click to download"
                                      : "Click to download"
                            }
                        >
                            <div
                                style={{
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    background:
                                        "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    marginBottom: "2px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {fileName}
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    fontWeight: "400",
                                }}
                            >
                                {fileDate}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setFileList([]);
                                if (onChange) {
                                    onChange(null);
                                }
                            }}
                            style={{
                                background:
                                    "linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)",
                                border: "1px solid #ffcccb",
                                cursor: "pointer",
                                padding: "4px 6px",
                                color: "#ff4d4f",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                transition: "all 0.2s ease",
                                boxShadow: "0 1px 3px rgba(255, 77, 79, 0.1)",
                                width: "28px",
                                height: "28px",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                    "linear-gradient(135deg, #ff4d4f 0%, #ee5a6f 100%)";
                                e.currentTarget.style.color = "#ffffff";
                                e.currentTarget.style.borderColor = "#ff4d4f";
                                e.currentTarget.style.boxShadow =
                                    "0 2px 6px rgba(255, 77, 79, 0.3)";
                                e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                    "linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)";
                                e.currentTarget.style.color = "#ff4d4f";
                                e.currentTarget.style.borderColor = "#ffcccb";
                                e.currentTarget.style.boxShadow =
                                    "0 1px 3px rgba(255, 77, 79, 0.1)";
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            <DeleteOutlined />
                        </button>
                    </div>
                </div>
            );
        }

        // For Video and Audio
        if (fileType === "Video" || fileType === "Audio") {
            let fileUrl =
                file.url || file.thumbUrl || file.originFileObj?._objectUrl;

            // If no URL exists, create one from originFileObj
            if (!fileUrl && file.originFileObj) {
                try {
                    fileUrl = URL.createObjectURL(file.originFileObj);
                    // Store it in the file object for future use
                    file.url = fileUrl;
                    file.thumbUrl = fileUrl;
                    if (file.originFileObj) {
                        file.originFileObj._objectUrl = fileUrl;
                    }
                } catch (error) {
                    console.error("Error creating object URL:", error);
                    return null;
                }
            }

            if (!fileUrl) {
                console.warn("No file URL available for audio/video");
                return null;
            }

            // Get the actual MIME type from the file
            const mimeType =
                file.originFileObj?.type ||
                file.type ||
                (fileType === "Audio" ? "audio/mpeg" : "video/mp4");

            if (fileType === "Video") {
                // Check if it's a link-based video
                if (file.isLink && file.url) {
                    const linkUrl = file.url;
                    let embedUrl = linkUrl;

                    // Handle YouTube links
                    if (
                        file.linkType === "Youtube Link" ||
                        linkUrl.includes("youtube.com") ||
                        linkUrl.includes("youtu.be")
                    ) {
                        // Convert YouTube URL to embed format
                        let videoId = "";
                        if (linkUrl.includes("youtube.com/watch?v=")) {
                            videoId = linkUrl.split("v=")[1]?.split("&")[0];
                        } else if (linkUrl.includes("youtu.be/")) {
                            videoId = linkUrl
                                .split("youtu.be/")[1]
                                ?.split("?")[0];
                        } else if (linkUrl.includes("youtube.com/embed/")) {
                            videoId = linkUrl.split("embed/")[1]?.split("?")[0];
                        }
                        if (videoId) {
                            embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        }
                    }

                    return (
                        <div
                            style={{
                                marginTop: "12px",
                                border: "1px solid #1e3a5f",
                                borderRadius: "8px",
                                padding: "12px",
                                background:
                                    "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
                                boxShadow: "0 2px 8px rgba(4, 76, 66, 0.1)",
                                position: "relative",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            color: "#1e3a5f",
                                            marginBottom: "4px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {file.name ||
                                            `${file.linkType} - ${linkUrl.substring(0, 50)}...`}
                                    </div>
                                    <div
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(linkUrl);
                                                message.success("Link copied to clipboard!");
                                            } catch {
                                                message.error("Could not copy link");
                                            }
                                        }}
                                        style={{
                                            fontSize: "12px",
                                            color: "#06A77D",
                                            wordBreak: "break-all",
                                            cursor: "pointer",
                                            padding: "6px 8px",
                                            margin: "-6px -8px",
                                            borderRadius: "6px",
                                            transition: "background 0.2s, color 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(4, 76, 66, 0.06)";
                                            e.currentTarget.style.color = "#1e3a5f";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = "#06A77D";
                                        }}
                                        title="Click to copy link"
                                    >
                                        {linkUrl}
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(linkUrl);
                                            message.success("Link copied to clipboard!");
                                        } catch {
                                            message.error("Could not copy link");
                                        }
                                    }}
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #e8f5f3 0%, #d4ede9 100%)",
                                        border: "1px solid #1e3a5f",
                                        cursor: "pointer",
                                        padding: "6px 8px",
                                        color: "#1e3a5f",
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "6px",
                                        transition: "all 0.2s ease",
                                        boxShadow: "0 1px 3px rgba(4, 76, 66, 0.15)",
                                        width: "32px",
                                        height: "32px",
                                        flexShrink: 0,
                                    }}
                                    title="Copy link"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)";
                                        e.currentTarget.style.color = "#ffffff";
                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(4, 76, 66, 0.3)";
                                        e.currentTarget.style.transform = "scale(1.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            "linear-gradient(135deg, #e8f5f3 0%, #d4ede9 100%)";
                                        e.currentTarget.style.color = "#1e3a5f";
                                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(4, 76, 66, 0.15)";
                                        e.currentTarget.style.transform = "scale(1)";
                                    }}
                                >
                                    <CopyOutlined />
                                </button>
                                <button
                                    onClick={() => {
                                        setFileList([]);
                                        setVideoLink("");
                                        if (onChange) {
                                            onChange(null);
                                        }
                                    }}
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)",
                                        border: "1px solid #ffcccb",
                                        cursor: "pointer",
                                        padding: "6px 8px",
                                        color: "#ff4d4f",
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "6px",
                                        transition: "all 0.2s ease",
                                        boxShadow:
                                            "0 1px 3px rgba(255, 77, 79, 0.1)",
                                        width: "32px",
                                        height: "32px",
                                        flexShrink: 0,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            "linear-gradient(135deg, #ff4d4f 0%, #ee5a6f 100%)";
                                        e.currentTarget.style.color = "#ffffff";
                                        e.currentTarget.style.borderColor =
                                            "#ff4d4f";
                                        e.currentTarget.style.boxShadow =
                                            "0 2px 6px rgba(255, 77, 79, 0.3)";
                                        e.currentTarget.style.transform =
                                            "scale(1.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            "linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)";
                                        e.currentTarget.style.color = "#ff4d4f";
                                        e.currentTarget.style.borderColor =
                                            "#ffcccb";
                                        e.currentTarget.style.boxShadow =
                                            "0 1px 3px rgba(255, 77, 79, 0.1)";
                                        e.currentTarget.style.transform =
                                            "scale(1)";
                                    }}
                                >
                                    <DeleteOutlined />
                                </button>
                            </div>
                        </div>
                    );
                }

                // Regular video file upload
                return (
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                        <video
                            controls
                            style={{
                                maxWidth: "100%",
                                maxHeight: "300px",
                                borderRadius: "8px",
                            }}
                        >
                            <source src={fileUrl} type={mimeType} />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );
            }

            if (fileType === "Audio") {
                // Link-based audio: show link info and delete only (no audio player)
                if (file.isLink && file.url) {
                    const linkUrl = file.url;
                    return (
                        <div
                            style={{
                                marginTop: "12px",
                                border: "1px solid #1e3a5f",
                                borderRadius: "8px",
                                padding: "12px",
                                background:
                                    "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
                                boxShadow: "0 2px 8px rgba(4, 76, 66, 0.1)",
                                position: "relative",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            color: "#1e3a5f",
                                            marginBottom: "4px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {file.name ||
                                            `${file.linkType || "Link"} - ${linkUrl.substring(0, 50)}...`}
                                    </div>
                                    <div
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(linkUrl);
                                                message.success("Link copied to clipboard!");
                                            } catch {
                                                message.error("Could not copy link");
                                            }
                                        }}
                                        style={{
                                            fontSize: "12px",
                                            color: "#06A77D",
                                            wordBreak: "break-all",
                                            cursor: "pointer",
                                            padding: "6px 8px",
                                            margin: "-6px -8px",
                                            borderRadius: "6px",
                                            transition: "background 0.2s, color 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(4, 76, 66, 0.06)";
                                            e.currentTarget.style.color = "#1e3a5f";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = "#06A77D";
                                        }}
                                        title="Click to copy link"
                                    >
                                        {linkUrl}
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(linkUrl);
                                            message.success("Link copied to clipboard!");
                                        } catch {
                                            message.error("Could not copy link");
                                        }
                                    }}
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #e8f5f3 0%, #d4ede9 100%)",
                                        border: "1px solid #1e3a5f",
                                        cursor: "pointer",
                                        padding: "6px 8px",
                                        color: "#1e3a5f",
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "6px",
                                        transition: "all 0.2s ease",
                                        boxShadow: "0 1px 3px rgba(4, 76, 66, 0.15)",
                                        width: "32px",
                                        height: "32px",
                                        flexShrink: 0,
                                    }}
                                    title="Copy link"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            "linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)";
                                        e.currentTarget.style.color = "#ffffff";
                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(4, 76, 66, 0.3)";
                                        e.currentTarget.style.transform = "scale(1.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            "linear-gradient(135deg, #e8f5f3 0%, #d4ede9 100%)";
                                        e.currentTarget.style.color = "#1e3a5f";
                                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(4, 76, 66, 0.15)";
                                        e.currentTarget.style.transform = "scale(1)";
                                    }}
                                >
                                    <CopyOutlined />
                                </button>
                                <button
                                    onClick={() => {
                                        setFileList([]);
                                        setVideoLink("");
                                        if (onChange) {
                                            onChange(null);
                                        }
                                    }}
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)",
                                        border: "1px solid #ffcccb",
                                        cursor: "pointer",
                                        padding: "6px 8px",
                                        color: "#ff4d4f",
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "6px",
                                        transition: "all 0.2s ease",
                                        boxShadow:
                                            "0 1px 3px rgba(255, 77, 79, 0.1)",
                                        width: "32px",
                                        height: "32px",
                                        flexShrink: 0,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            "linear-gradient(135deg, #ff4d4f 0%, #ee5a6f 100%)";
                                        e.currentTarget.style.color = "#ffffff";
                                        e.currentTarget.style.borderColor = "#ff4d4f";
                                        e.currentTarget.style.boxShadow =
                                            "0 2px 6px rgba(255, 77, 79, 0.3)";
                                        e.currentTarget.style.transform = "scale(1.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            "linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)";
                                        e.currentTarget.style.color = "#ff4d4f";
                                        e.currentTarget.style.borderColor = "#ffcccb";
                                        e.currentTarget.style.boxShadow =
                                            "0 1px 3px rgba(255, 77, 79, 0.1)";
                                        e.currentTarget.style.transform = "scale(1)";
                                    }}
                                >
                                    <DeleteOutlined />
                                </button>
                            </div>
                        </div>
                    );
                }

                // Attached audio file: show audio player
                return (
                    <div
                        style={{
                            marginTop: "12px",
                            border: "1px solid #1e3a5f",
                            borderRadius: "8px",
                            padding: "12px",
                            background:
                                "linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)",
                            boxShadow: "0 2px 8px rgba(4, 76, 66, 0.1)",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <audio
                                    key={fileUrl} // Force re-render when URL changes
                                    controls
                                    style={{ width: "100%" }}
                                    preload="auto"
                                    onLoadedMetadata={(e) => {
                                        // Ensure metadata is loaded
                                        if (e.target.readyState >= 2) {
                                            console.log(
                                                "Audio loaded, duration:",
                                                e.target.duration,
                                            );
                                        }
                                    }}
                                    onError={(e) => {
                                        console.error(
                                            "Audio loading error:",
                                            e,
                                        );
                                    }}
                                >
                                    <source src={fileUrl} type={mimeType} />
                                    Your browser does not support the audio tag.
                                </audio>
                            </div>
                            <button
                                onClick={() => {
                                    // Clean up object URL
                                    if (
                                        file.url &&
                                        file.url.startsWith("blob:")
                                    ) {
                                        URL.revokeObjectURL(file.url);
                                    }
                                    setFileList([]);
                                    if (onChange) {
                                        onChange(null);
                                    }
                                }}
                                style={{
                                    background:
                                        "linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)",
                                    border: "1px solid #ffcccb",
                                    cursor: "pointer",
                                    padding: "6px 8px",
                                    color: "#ff4d4f",
                                    fontSize: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "6px",
                                    transition: "all 0.2s ease",
                                    boxShadow:
                                        "0 1px 3px rgba(255, 77, 79, 0.1)",
                                    width: "32px",
                                    height: "32px",
                                    flexShrink: 0,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                        "linear-gradient(135deg, #ff4d4f 0%, #ee5a6f 100%)";
                                    e.currentTarget.style.color = "#ffffff";
                                    e.currentTarget.style.borderColor =
                                        "#ff4d4f";
                                    e.currentTarget.style.boxShadow =
                                        "0 2px 6px rgba(255, 77, 79, 0.3)";
                                    e.currentTarget.style.transform =
                                        "scale(1.05)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        "linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)";
                                    e.currentTarget.style.color = "#ff4d4f";
                                    e.currentTarget.style.borderColor =
                                        "#ffcccb";
                                    e.currentTarget.style.boxShadow =
                                        "0 1px 3px rgba(255, 77, 79, 0.1)";
                                    e.currentTarget.style.transform =
                                        "scale(1)";
                                }}
                            >
                                <DeleteOutlined />
                            </button>
                        </div>
                    </div>
                );
            }
        }

        return null;
    };

    return (
        <div>
            <style>{`
                .dynamic-uploader-radio .ant-radio-wrapper .ant-radio-checked .ant-radio-inner {
                    border-color: #1e3a5f !important;
                }
                .dynamic-uploader-radio .ant-radio-wrapper .ant-radio-checked .ant-radio-inner::after {
                    background-color: #1e3a5f !important;
                    transform: scale(0.875);
                }
                .dynamic-uploader-radio .ant-radio-wrapper:hover .ant-radio-inner {
                    border-color: #1e3a5f !important;
                }
                .dynamic-uploader-radio .ant-radio-wrapper .ant-radio-inner {
                    border-color: #d9d9d9;
                }
                .dynamic-uploader-radio .ant-radio-wrapper .ant-radio-checked::after {
                    border-color: #1e3a5f !important;
                }
                .dynamic-uploader-select .ant-select-selector {
                    border-radius: 8px !important;
                    border: 1.5px solid #d9d9d9 !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%) !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
                    height: 42px !important;
                    padding: 4px 11px !important;
                }
                .dynamic-uploader-select .ant-select-selector:hover {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 2px 8px rgba(4, 76, 66, 0.12) !important;
                    transform: translateY(-1px);
                }
                .dynamic-uploader-select.ant-select-focused .ant-select-selector {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(4, 76, 66, 0.12) !important;
                    background: #ffffff !important;
                }
                .dynamic-uploader-select .ant-select-selection-item {
                    line-height: 32px !important;
                    font-weight: 500 !important;
                    color: #262626 !important;
                }
                .dynamic-uploader-select .ant-select-selection-placeholder {
                    line-height: 32px !important;
                    color: #8c8c8c !important;
                    font-weight: 400 !important;
                }
                .dynamic-uploader-select .ant-select-arrow {
                    color: #1e3a5f !important;
                    font-size: 14px !important;
                }
                .dynamic-uploader-input {
                    border-radius: 8px !important;
                    border: 1.5px solid #d9d9d9 !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%) !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
                }
                .dynamic-uploader-input:hover {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 2px 8px rgba(4, 76, 66, 0.12) !important;
                    transform: translateY(-1px);
                }
                .dynamic-uploader-input:focus {
                    border-color: #1e3a5f !important;
                    box-shadow: 0 0 0 3px rgba(4, 76, 66, 0.12) !important;
                    background: #ffffff !important;
                }
                .dynamic-uploader-section {
                    background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%) !important;
                    border: 1.5px solid #e8f5e9 !important;
                    border-radius: 12px !important;
                    padding: 24px !important;
                    box-shadow: 0 4px 16px rgba(4, 76, 66, 0.08), 0 0 0 1px rgba(4, 76, 66, 0.04) !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .dynamic-uploader-section:hover {
                    box-shadow: 0 6px 24px rgba(4, 76, 66, 0.12), 0 0 0 1px rgba(4, 76, 66, 0.06) !important;
                }
                .dynamic-uploader-label {
                    font-weight: 600 !important;
                    color: #1e3a5f !important;
                    font-size: 14px !important;
                    margin-bottom: 8px !important;
                    display: block !important;
                }
            `}</style>
            <h2
                style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                    color: "#262626",
                }}
            ></h2>

            <div
                className="dynamic-uploader-section"
                style={{ marginTop: "16px" }}
            >
                <div style={{ marginBottom: "20px" }}>
                    <label className="dynamic-uploader-label">File Type</label>
                    <Select
                        className="dynamic-uploader-select"
                        value={fileType || undefined}
                        onChange={handleFileTypeChange}
                        style={{
                            width: "100%",
                        }}
                        size="large"
                        placeholder="Select File Type"
                        allowClear
                        options={[
                            { value: "Pdf", label: "Pdf" },
                            { value: "Doc", label: "Doc" },
                            { value: "ppt", label: "PPT" },
                            { value: "Video", label: "Video" },
                            { value: "Audio", label: "Audio" },
                            // { value: "Image", label: "Image" },
                        ]}
                    />
                </div>

                {fileType === "Video" && (
                    <div
                        style={{
                            marginBottom:
                                fileType === "Video" &&
                                videoSourceType !== null &&
                                videoSourceType !== "Attach Video" &&
                                (videoSourceType === "Youtube Link" ||
                                    videoSourceType === "Drive Link" ||
                                    videoSourceType === "Custom Link")
                                    ? "20px"
                                    : "0",
                        }}
                    >
                        <label className="dynamic-uploader-label">
                            Video Source
                        </label>
                        <Select
                            className="dynamic-uploader-select"
                            value={videoSourceType}
                            onChange={handleVideoSourceTypeChange}
                            style={{ width: "100%" }}
                            size="large"
                            placeholder="Select Video Source"
                            allowClear
                            options={[
                                {
                                    value: "Youtube Link",
                                    label: "Youtube Link",
                                },
                                { value: "Drive Link", label: "Drive Link" },
                                { value: "Custom Link", label: "Custom Link" },
                            ]}
                        />
                    </div>
                )}

                {fileType === "Audio" && (
                    <div
                        style={{
                            marginBottom:
                                fileType === "Audio" &&
                                videoSourceType !== null &&
                                videoSourceType !== "Attach Audio" &&
                                (videoSourceType === "Drive Link" ||
                                    videoSourceType === "Custom Link")
                                    ? "20px"
                                    : "0",
                        }}
                    >
                        <label className="dynamic-uploader-label">
                            Audio Source
                        </label>
                        <Select
                            className="dynamic-uploader-select"
                            value={videoSourceType}
                            onChange={handleVideoSourceTypeChange}
                            style={{ width: "100%" }}
                            size="large"
                            placeholder="Select Audio Source"
                            allowClear
                            options={[
                                { value: "Drive Link", label: "Drive Link" },
                                { value: "Custom Link", label: "Custom Link" },
                            ]}
                        />
                    </div>
                )}

                {fileType === "Video" &&
                    videoSourceType !== "Attach Video" &&
                    (videoSourceType === "Youtube Link" ||
                        videoSourceType === "Drive Link" ||
                        videoSourceType === "Custom Link") && (
                        <div>
                            <label className="dynamic-uploader-label">
                                {videoSourceType}
                            </label>
                            <Input
                                className="dynamic-uploader-input text-input"
                                placeholder={`Enter ${videoSourceType}`}
                                value={videoLink}
                                onChange={(e) => {
                                    const newLink = e.target.value;
                                    setVideoLink(newLink);
                                    // Update onChange immediately when link changes
                                    if (newLink.trim()) {
                                        const linkFile = {
                                            uid: Date.now().toString(),
                                            name: `${videoSourceType} - ${newLink.substring(0, 30)}...`,
                                            status: "done",
                                            url: newLink.trim(),
                                            isLink: true,
                                            linkType: videoSourceType,
                                            file_type: "Video",
                                            video_source: videoSourceType,
                                        };
                                        setFileList([linkFile]);
                                        if (onChange) {
                                            onChange(linkFile);
                                        }
                                    } else {
                                        // Clear if link is empty
                                        setFileList([]);
                                        if (onChange) {
                                            onChange(null);
                                        }
                                    }
                                }}
                                size="large"
                                onPressEnter={() => {
                                    if (videoLink.trim()) {
                                        // Handle link submission
                                        const linkFile = {
                                            uid: Date.now().toString(),
                                            name: `${videoSourceType} - ${videoLink.substring(0, 30)}...`,
                                            status: "done",
                                            url: videoLink.trim(),
                                            isLink: true,
                                            linkType: videoSourceType,
                                            file_type: "Video",
                                            video_source: videoSourceType,
                                        };
                                        setFileList([linkFile]);
                                        if (onChange) {
                                            onChange(linkFile);
                                        }
                                    }
                                }}
                            />
                        </div>
                    )}

                {fileType === "Audio" &&
                    videoSourceType !== "Attach Audio" &&
                    (videoSourceType === "Drive Link" ||
                        videoSourceType === "Custom Link") && (
                        <div>
                            <label className="dynamic-uploader-label">
                                {videoSourceType}
                            </label>
                            <Input
                                className="dynamic-uploader-input text-input"
                                placeholder={`Enter ${videoSourceType}`}
                                value={videoLink}
                                onChange={(e) => {
                                    const newLink = e.target.value;
                                    setVideoLink(newLink);
                                    if (newLink.trim()) {
                                        const linkFile = {
                                            uid: Date.now().toString(),
                                            name: `${videoSourceType} - ${newLink.substring(0, 30)}...`,
                                            status: "done",
                                            url: newLink.trim(),
                                            isLink: true,
                                            linkType: videoSourceType,
                                            file_type: "Audio",
                                            video_source: videoSourceType,
                                        };
                                        setFileList([linkFile]);
                                        if (onChange) {
                                            onChange(linkFile);
                                        }
                                    } else {
                                        setFileList([]);
                                        if (onChange) {
                                            onChange(null);
                                        }
                                    }
                                }}
                                size="large"
                                onPressEnter={() => {
                                    if (videoLink.trim()) {
                                        const linkFile = {
                                            uid: Date.now().toString(),
                                            name: `${videoSourceType} - ${videoLink.substring(0, 30)}...`,
                                            status: "done",
                                            url: videoLink.trim(),
                                            isLink: true,
                                            linkType: videoSourceType,
                                            file_type: "Audio",
                                            video_source: videoSourceType,
                                        };
                                        setFileList([linkFile]);
                                        if (onChange) {
                                            onChange(linkFile);
                                        }
                                    }
                                }}
                            />
                        </div>
                    )}
            </div>

            {fileList.length === 0 &&
            fileType &&
            (fileType !== "Video" && fileType !== "Audio" ||
                (fileType === "Video" &&
                    videoSourceType === "Attach Video") ||
                (fileType === "Audio" &&
                    videoSourceType === "Attach Audio")) ? (
                <Dragger
                    {...uploadProps}
                    style={{
                        padding: "24px 20px",
                        minHeight: "180px",
                        width: "100%",
                        marginTop: "10px",
                    }}
                >
                    <p
                        className="ant-upload-drag-icon"
                        style={{ marginBottom: "8px" }}
                    >
                        <CloudUploadOutlined
                            style={{ fontSize: "36px", color: "#8c8c8c" }}
                        />
                    </p>
                    <p
                        className="ant-upload-text"
                        style={{
                            fontSize: "15px",
                            fontWeight: "bold",
                            color: "#262626",
                            marginBottom: "4px",
                        }}
                    >
                        Click or Drag to Upload
                    </p>
                    <p
                        className="ant-upload-hint"
                        style={{ fontSize: "11px", color: "#8c8c8c" }}
                    >
                        Assignments file PDF | Docs | PPT | Video | Audio | Image
                    </p>
                </Dragger>
            ) : fileList.length > 0 ? (
                renderFileCard()
            ) : null}

            {errorMsg && (
                <div style={{ color: "red", marginTop: "8px" }}>{errorMsg}</div>
            )}
        </div>
    );
}
