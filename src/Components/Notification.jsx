import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX, IconExclamationCircle } from "@tabler/icons-react";

export function showCustomNotification(type = "success", message = "Cập nhật trạng thái thành công!") {
    let bgClass = "";
    let config = {
        title: "",
        message: message,
        // color: "",
        icon: null,
        autoClose: 3000,
    };

    switch (type) {
        case "success":
            config.title = "Thành Công!";
            bgClass = "bg-green-500";
            config.icon = <IconCheck size={20} />;
            break;
        case "error":
            config.title = "Lỗi!";
            bgClass = "bg-red-500";
            config.icon = <IconX size={20} />;
            break;
        case "warning":
            config.title = "Thông Báo!";
            bgClass = "bg-yellow-500";
            config.icon = <IconExclamationCircle size={20} />;
            break;
        default:
            config.title = "Thông Báo";
            bgClass = "bg-blue-500";
            config.icon = <IconCheck size={20} />;
    }
    config.className = `${bgClass} text-white`;
    showNotification(config);
}