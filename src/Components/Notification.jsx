import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX, IconExclamationCircle } from "@tabler/icons-react";

export function showCustomNotification(type = "success", message = "Cập nhật trạng thái thành công!") {
    let config = {
        title: "",
        message: message,
        color: "",
        icon: null,
        autoClose: 3000,
    };

    switch (type) {
        case "success":
            config.title = "Thành Công!";
            config.color = "green";
            config.icon = <IconCheck size={20} />;
            break;
        case "error":
            config.title = "Lỗi!";
            config.color = "red";
            config.icon = <IconX size={20} />;
            break;
        case "warning":
            config.title = "Thông Báo!";
            config.color = "yellow";
            config.icon = <IconExclamationCircle size={20} />;
            break;
        default:
            config.title = "Thông Báo";
            config.color = "blue";
            config.icon = <IconCheck size={20} />;
    }

    showNotification(config);
}