import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Modal, Box, Typography, TextField, Button, Grid } from '@mui/material';
import ContractService from '../../Services/Landlord/ContractService';
import UpRoleService from '../../Services/User/UpRoleService';
import Loading from '../Loading';

// Styled component cho ModalContent
const ModalContent = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '1400px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: 24,
    padding: theme.spacing(4),
    borderRadius: 16,
    maxHeight: '95vh',
    overflowY: 'auto',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3),
    },
}));

// Styled component cho lớp phủ loading toàn màn hình
const FullScreenLoadingOverlay = styled(Box)({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Nền mờ để làm nổi bật loading
    zIndex: 1300, // Đảm bảo lớp phủ ở trên tất cả nội dung, kể cả modal (MUI Modal mặc định có zIndex 1300)
});

const WarningMessage = ({ message }) => (
    <Typography color="warning.main" sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
        {message}
    </Typography>
);

const AuthorizationModal = ({ open, onClose, user, selectedRooms, adminData, onSuccess }) => {
    const [contractDetails, setContractDetails] = useState({
        // certificationLocation: '',
        partyAName: '',
        partyABirthDate: '',
        partyAIDNumber: '',
        partyAIDIssueDate: '',
        partyAIDIssuePlace: 'CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI',
        partyAAddress: '',
        partyBId: '1', // Giả sử ID cố định, có thể thay đổi nếu cần
        partyBName: 'Nguyễn Đình Mạnh Hùng',
        partyBAddress: 'Phường Phong An, thị xã Phong Điền, Thừa Thiên Huế',
        partyBBirthDate: '2003-08-02',
        partyBIDNumber: '046203004566',
        partyBIDIssueDate: '2022-08-23',
        partyBIDIssuePlace: 'CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI',
        scopeOfAuthorization: Array.isArray(selectedRooms) ? `${selectedRooms.length} phòng` : '0 phòng',
        startDate: '',
        duration: '',
        effectiveDate: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [warning, setWarning] = useState(null);

    useEffect(() => {
        setContractDetails((prev) => ({
            ...prev,
            scopeOfAuthorization: Array.isArray(selectedRooms) ? `${selectedRooms.length} phòng` : '0 phòng',
        }));
    }, [selectedRooms]);

    useEffect(() => {
        const fetchLandlordLicense = async () => {
            if (!open || !user?.userId) {
                setWarning("Không có thông tin người dùng. Vui lòng nhập thông tin thủ công.");
                return;
            }

            const partyAId = parseInt(user.userId, 10);
            if (isNaN(partyAId) || partyAId <= 0) {
                setWarning("ID người dùng không hợp lệ. Vui lòng nhập thông tin thủ công.");
                return;
            }

            try {
                setIsLoading(true);
                setWarning(null);
                const response = await UpRoleService.getLandlordLicenseById(partyAId);

                const data = response?.data || response;

                if (!data) {
                    setWarning("Không tìm thấy thông tin giấy phép chủ nhà. Vui lòng nhập thông tin thủ công.");
                    return;
                }

                if (data.status !== 1) {
                    setWarning("Không tìm thấy thông tin giấy phép chủ nhà. Vui lòng nhập thông tin thủ công.");
                    return;
                }

                setContractDetails((prev) => ({
                    ...prev,
                    partyAName: data.name || '',
                    partyAAddress: data.address || '',
                    partyABirthDate: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
                    partyAIDNumber: data.cccd || '',
                    partyAIDIssuePlace: 'CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI',
                }));
            } catch (error) {
                console.error('Lỗi khi lấy thông tin bên A:', error.message, error.stack);
                setWarning("Lỗi khi lấy thông tin bên A. Vui lòng nhập thông tin thủ công.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLandlordLicense();
    }, [open, user?.userId]);

    const handleContractDetailChange = (field, value) => {
        setContractDetails((prev) => ({ ...prev, [field]: value }));
    };

    const validateInputs = () => {
        const requiredFields = [
            // { field: 'certificationLocation', label: 'Địa điểm chứng thực' },
            { field: 'partyAName', label: 'Tên bên A' },
            { field: 'partyABirthDate', label: 'Ngày sinh bên A' },
            { field: 'partyAIDNumber', label: 'Số CMND/CCCD bên A' },
            { field: 'partyAIDIssueDate', label: 'Ngày cấp CMND/CCCD bên A' },
            { field: 'partyAIDIssuePlace', label: 'Nơi cấp CMND/CCCD bên A' },
            { field: 'partyAAddress', label: 'Địa chỉ bên A' },
            { field: 'partyBName', label: 'Tên bên B' },
            { field: 'partyBAddress', label: 'Địa chỉ bên B' },
            { field: 'partyBBirthDate', label: 'Ngày sinh bên B' },
            { field: 'partyBIDNumber', label: 'Số CMND/CCCD bên B' },
            { field: 'partyBIDIssueDate', label: 'Ngày cấp CMND/CCCD bên B' },
            { field: 'partyBIDIssuePlace', label: 'Nơi cấp CMND/CCCD bên B' },
            { field: 'startDate', label: 'Ngày bắt đầu' },
            { field: 'duration', label: 'Thời hạn ủy quyền' },
            { field: 'effectiveDate', label: 'Ngày hiệu lực' },
        ];

        for (const { field, label } of requiredFields) {
            if (!contractDetails[field]) {
                return `Vui lòng điền ${label}.`;
            }
        }

        const isValidDate = (date) => {
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            return regex.test(date) && !isNaN(new Date(date).getTime());
        };

        const dateFields = [
            { field: 'partyABirthDate', label: 'Ngày sinh bên A' },
            { field: 'partyAIDIssueDate', label: 'Ngày cấp CMND/CCCD bên A' },
            { field: 'startDate', label: 'Ngày bắt đầu' },
            { field: 'effectiveDate', label: 'Ngày hiệu lực' },
            { field: 'partyBBirthDate', label: 'Ngày sinh bên B' },
            { field: 'partyBIDIssueDate', label: 'Ngày cấp CMND/CCCD bên B' },
        ];

        for (const { field, label } of dateFields) {
            if (!isValidDate(contractDetails[field])) {
                return `${label} phải có định dạng YYYY-MM-DD và hợp lệ.`;
            }
        }

        if (!/^\d{12}$/.test(contractDetails.partyAIDNumber)) {
            return 'Số CMND/CCCD bên A phải có đúng 12 chữ số.';
        }
        if (!/^\d{12}$/.test(contractDetails.partyBIDNumber)) {
            return 'Số CMND/CCCD bên B phải có đúng 12 chữ số.';
        }

        const duration = parseInt(contractDetails.duration, 10);
        if (isNaN(duration) || duration <= 0) {
            return 'Thời hạn phải là số nguyên dương (số tháng).';
        }

        const partyBId = parseInt(contractDetails.partyBId, 10);
        if (isNaN(partyBId) || partyBId <= 0) {
            return 'ID bên B không hợp lệ.';
        }

        return null;
    };

    const handleAuthorize = async () => {
        try {
            const validationError = validateInputs();
            if (validationError) {
                setWarning(validationError);
                return;
            }

            const duration = parseInt(contractDetails.duration, 10);
            const fee = 10000 * (Array.isArray(selectedRooms) ? selectedRooms.length : 0) * duration;

            const payload = {
                contractNumber: `CONTRACT-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                partyAId: parseInt(user.userId, 10),
                partyAName: contractDetails.partyAName,
                partyABirthDate: new Date(contractDetails.partyABirthDate).toISOString(),
                partyAIDNumber: contractDetails.partyAIDNumber,
                partyAIDIssueDate: contractDetails.partyAIDIssueDate,
                partyAIDIssuePlace: contractDetails.partyAIDIssuePlace,
                partyAAddress: contractDetails.partyAAddress,
                partyBId: parseInt(contractDetails.partyBId, 10),
                partyBName: contractDetails.partyBName,
                partyBBirthDate: new Date(contractDetails.partyBBirthDate).toISOString(),
                partyBIDNumber: contractDetails.partyBIDNumber,
                partyBIDIssueDate: contractDetails.partyBIDIssueDate,
                partyBIDIssuePlace: contractDetails.partyBIDIssuePlace,
                partyBAddress: contractDetails.partyBAddress,
                // certificationLocation: contractDetails.certificationLocation,
                scopeOfAuthorization: contractDetails.scopeOfAuthorization,
                startDate: contractDetails.startDate,
                duration: duration.toString(),
                fee: fee,
                feePayer: user.userId.toString(),
                effectiveDate: contractDetails.effectiveDate,
                partyASignature: '',
                partyBSignature: '',
            };

            setIsLoading(true);
            setWarning(null);
            await ContractService.generateAuthorizationContract(payload);
            alert("Ủy quyền thành công!");
            setContractDetails({
                // certificationLocation: '',
                partyAName: '',
                partyABirthDate: '',
                partyAIDNumber: '',
                partyAIDIssueDate: '',
                partyAIDIssuePlace: 'CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI',
                partyAAddress: '',
                partyBId: '1',
                partyBName: 'Nguyễn Đình Mạnh Hùng',
                partyBAddress: 'Phường Phong An, thị xã Phong Điền, Thừa Thiên Huế',
                partyBBirthDate: '2003-08-02',
                partyBIDNumber: '046203004566',
                partyBIDIssueDate: '2022-08-23',
                partyBIDIssuePlace: 'CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI',
                scopeOfAuthorization: Array.isArray(selectedRooms) ? `${selectedRooms.length} phòng` : '0 phòng',
                startDate: '',
                duration: '',
                effectiveDate: '',
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Lỗi khi ủy quyền:', error.message, error.stack);
            setWarning("Lỗi khi ủy quyền: " + (error.message || "Không rõ nguyên nhân"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && (
                <FullScreenLoadingOverlay>
                    <Loading />
                </FullScreenLoadingOverlay>
            )}
            <Modal open={open} onClose={onClose}>
                <ModalContent>
                    {warning && <WarningMessage message={warning} />}
                    <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                        Nhập thông tin hợp đồng ủy quyền
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                                Thông tin bên A (Bên ủy quyền)
                            </Typography>
                            <TextField
                                label="Tên bên A"
                                fullWidth
                                margin="dense"
                                value={contractDetails.partyAName}
                                onChange={(e) => handleContractDetailChange('partyAName', e.target.value)}
                                size="small"
                                required
                            />
                            <TextField
                                label="Ngày sinh bên A"
                                fullWidth
                                margin="dense"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={contractDetails.partyABirthDate}
                                onChange={(e) => handleContractDetailChange('partyABirthDate', e.target.value)}
                                size="small"
                                required
                            />
                            <TextField
                                label="Số CMND/CCCD bên A"
                                fullWidth
                                margin="dense"
                                value={contractDetails.partyAIDNumber}
                                onChange={(e) => handleContractDetailChange('partyAIDNumber', e.target.value)}
                                size="small"
                                required
                                inputProps={{ maxLength: 12, pattern: "\\d{12}" }}
                            />
                            <TextField
                                label="Ngày cấp CMND/CCCD"
                                fullWidth
                                margin="dense"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={contractDetails.partyAIDIssueDate}
                                onChange={(e) => handleContractDetailChange('partyAIDIssueDate', e.target.value)}
                                size="small"
                                required
                            />
                            <TextField
                                label="Nơi cấp CMND/CCCD"
                                fullWidth
                                margin="dense"
                                value={contractDetails.partyAIDIssuePlace}
                                onChange={(e) => handleContractDetailChange('partyAIDIssuePlace', e.target.value)}
                                size="small"
                                required
                            />
                            <TextField
                                label="Địa chỉ bên A"
                                fullWidth
                                margin="dense"
                                value={contractDetails.partyAAddress}
                                onChange={(e) => handleContractDetailChange('partyAAddress', e.target.value)}
                                size="small"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                                Thông tin hợp đồng
                            </Typography>
                            {/* <TextField
                                label="Địa điểm chứng thực"
                                fullWidth
                                margin="dense"
                                value={contractDetails.certificationLocation}
                                onChange={(e) => handleContractDetailChange('certificationLocation', e.target.value)}
                                size="small"
                                required
                            /> */}
                            <TextField
                                label="Phạm vi ủy quyền"
                                fullWidth
                                margin="dense"
                                value={contractDetails.scopeOfAuthorization}
                                disabled
                                size="small"
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'black',
                                        color: '#212121',
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': {
                                        color: '#666666',
                                    },
                                }}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Ngày bắt đầu"
                                fullWidth
                                margin="dense"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={contractDetails.startDate}
                                onChange={(e) => handleContractDetailChange('startDate', e.target.value)}
                                size="small"
                                required
                            />
                            <TextField
                                label="Thời hạn ủy quyền (tháng)"
                                fullWidth
                                margin="dense"
                                type="number"
                                inputProps={{ min: 1 }}
                                value={contractDetails.duration}
                                onChange={(e) => handleContractDetailChange('duration', e.target.value)}
                                size="small"
                                required
                            />
                            <TextField
                                label="Phí ủy quyền (VND)"
                                fullWidth
                                margin="dense"
                                value={contractDetails.duration ? (10000 * (Array.isArray(selectedRooms) ? selectedRooms.length : 0) * parseInt(contractDetails.duration, 10)).toLocaleString('vi-VN') : '0'}
                                disabled
                                size="small"
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'black',
                                        color: '#212121',
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': {
                                        color: '#666666',
                                    },
                                }}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Ngày hiệu lực"
                                fullWidth
                                margin="dense"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={contractDetails.effectiveDate}
                                onChange={(e) => handleContractDetailChange('effectiveDate', e.target.value)}
                                size="small"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                                Thông tin bên B (Bên được ủy quyền)
                            </Typography>
                            <TextField
                                label="Tên bên B"
                                fullWidth
                                margin="dense"
                                value={contractDetails.partyBName}
                                disabled
                                size="small"
                                required
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'black',
                                        color: '#212121',
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': {
                                        color: '#666666',
                                    },
                                }}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Địa chỉ bên B"
                                fullWidth
                                margin="dense"
                                value={contractDetails.partyBAddress}
                                disabled
                                size="small"
                                required
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'black',
                                        color: '#212121',
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': {
                                        color: '#666666',
                                    },
                                }}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Ngày sinh bên B"
                                fullWidth
                                margin="dense"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={contractDetails.partyBBirthDate}
                                disabled
                                size="small"
                                required
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'black',
                                        color: '#212121',
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': {
                                        color: '#666666',
                                    },
                                }}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Số CMND/CCCD bên B"
                                fullWidth
                                margin="dense"
                                value={contractDetails.partyBIDNumber}
                                disabled
                                size="small"
                                required
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'black',
                                        color: '#212121',
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': {
                                        color: '#666666',
                                    },
                                }}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Ngày cấp CMND/CCCD bên B"
                                fullWidth
                                margin="dense"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={contractDetails.partyBIDIssueDate}
                                disabled
                                size="small"
                                required
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'black',
                                        color: '#212121',
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': {
                                        color: '#666666',
                                    },
                                }}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Nơi cấp CMND/CCCD bên B"
                                fullWidth
                                margin="dense"
                                value={contractDetails.partyBIDIssuePlace}
                                disabled
                                size="small"
                                required
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'black',
                                        color: '#212121',
                                    },
                                    '& .MuiInputLabel-root.Mui-disabled': {
                                        color: '#666666',
                                    },
                                }}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" onClick={onClose} size="medium" disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button variant="contained" onClick={handleAuthorize} size="medium" disabled={isLoading}>
                            Xác nhận
                        </Button>
                    </Box>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AuthorizationModal;