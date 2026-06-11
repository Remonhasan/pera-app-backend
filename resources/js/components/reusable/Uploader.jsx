import { UploadOutlined } from "@ant-design/icons";
import { Button, Upload, message } from "antd";
import { useState } from "react";

export default function Uploader({
  setData,
  defaultFile = [],
  errorMsg = "",
  type = "image",
  fileType = "image/*",
  maxFileCount = 1,
}) {
  const [fileList, setFileList] = useState(defaultFile);

  const props = {
    name: "file",
    action: "/administrative/file/upload",
    accept: fileType,
    listType: "picture",
    maxCount:maxFileCount,
    headers: {
      "X-CSRF-TOKEN": document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content"),
    },
    beforeUpload(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const img = document.createElement("img");
          img.src = reader.result;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            ctx.fillStyle = "red";
            ctx.textBaseline = "middle";
            ctx.font = "20px Arial";
            ctx.fillText("Passure", 20, 20);

            canvas.toBlob((blob) => {
              const newFile = new File([blob], file.name, { type: file.type });
              resolve(newFile);
            });
          };
        };
      });
    },
    onChange(info) {
      setFileList(info.fileList);
      if (info.file.status === "done") {
        const response = info.file.response;
        setData(type, response.filePath);
        message.success(`${info.file.name} uploaded successfully.`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} upload failed.`);
      }
    },
    onRemove(file) {
      const file_path =
        file.response?.filePath ||
        (file.url ? file.url.split("/storage/")[1] : null);

      if (!file_path) return;

      fetch("/administrative/file/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content"),
        },
        body: JSON.stringify({ filePath: file_path }),
      })
        .then(() => {
          setData(type, "");
          message.success("File deleted successfully.");
        })
        .catch((error) => {
          console.error("Error:", error);
          message.error("Failed to delete file.");
        });
    },
  };

  return (
    <>
      <Upload {...props} fileList={fileList}>
        <Button icon={<UploadOutlined />}>Upload File</Button>
      </Upload>
      {errorMsg && <span style={{ color: "red" }}>{errorMsg}</span>}
    </>
  );
}
