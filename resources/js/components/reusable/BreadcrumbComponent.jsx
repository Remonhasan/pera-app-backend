import React from "react";
import { Breadcrumb } from "antd";
import { motion, AnimatePresence } from 'framer-motion';

const BreadcrumbComponent = ({ title, items }) => {
    return (
        <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.2 }}
                className="breadcrumbs" style={{
                    margin: "20px 16px 0px 16px",
                    padding: "0 16px",
                    background: "#fff",
                    borderRadius: 10
                }}>
              <h3 className="p-0">{title}</h3>
              <Breadcrumb items={items} />
        </motion.div>

    );
};

export default BreadcrumbComponent;
