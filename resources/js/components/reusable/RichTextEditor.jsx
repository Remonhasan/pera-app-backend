import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function RichTextEditor({ value, onChange, placeholder, ...props }) {
    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                [{ font: [] }],
                [{ size: [] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                ],
                ["link", "image", "video"],
                [{ color: [] }, { background: [] }],
                [{ align: [] }],
                ["clean"],
            ],
        }),
        []
    );

    const formats = [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
        "video",
        "color",
        "background",
        "align",
    ];

    return (
        <div className="rich-text-editor-wrapper">
            <ReactQuill
                theme="snow"
                value={value || ""}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{
                    backgroundColor: "#fff",
                }}
                {...props}
            />
            <style>{`
                .rich-text-editor-wrapper .quill {
                    border-radius: 6px;
                    overflow: hidden;
                }
                .rich-text-editor-wrapper .ql-container {
                    min-height: 200px;
                    font-size: 14px;
                }
                .rich-text-editor-wrapper .ql-editor {
                    min-height: 200px;
                }
                .rich-text-editor-wrapper .ql-toolbar {
                    border-top-left-radius: 6px;
                    border-top-right-radius: 6px;
                    border-color: #d9d9d9;
                }
                .rich-text-editor-wrapper .ql-container {
                    border-bottom-left-radius: 6px;
                    border-bottom-right-radius: 6px;
                    border-color: #d9d9d9;
                }
                .rich-text-editor-wrapper .ql-toolbar:hover,
                .rich-text-editor-wrapper .ql-container:hover {
                    border-color: #1e3a5f;
                }
                .rich-text-editor-wrapper .ql-toolbar.ql-snow,
                .rich-text-editor-wrapper .ql-container.ql-snow {
                    border-color: #d9d9d9;
                }
                .rich-text-editor-wrapper .ql-toolbar.ql-snow:hover,
                .rich-text-editor-wrapper .ql-container.ql-snow:hover {
                    border-color: #1e3a5f;
                }
                .rich-text-editor-wrapper .ql-editor.ql-blank::before {
                    color: #bfbfbf;
                    font-style: normal;
                }
            `}</style>
        </div>
    );
}
