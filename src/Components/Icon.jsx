import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Import tất cả các icon bạn muốn sử dụng từ FontAwesome
import { faPlus, faTrashAlt, faEdit, faSearch, faHome, faCog, faUser } from '@fortawesome/free-solid-svg-icons';

// Mỗi icon sẽ được ánh xạ với tên của nó trong iconMap
const iconMap = {
    plus: faPlus,
    trash: faTrashAlt,
    edit: faEdit,
    search: faSearch,
    home: faHome,
    settings: faCog,
    user: faUser,  // Thêm icon user vào
    // Thêm nhiều icon khác nếu cần
};

const Icon = ({ name, className }) => {
    // Lấy icon từ iconMap dựa trên tên
    const icon = iconMap[name];

    // Nếu không có icon phù hợp, trả về null
    if (!icon) {
        console.warn(`Icon with name "${name}" not found!`);
        return null;
    }

    // Render icon FontAwesome với className nếu tìm thấy
    return <FontAwesomeIcon icon={icon} className={className} />;
};

export default Icon;
