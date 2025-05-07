const OverviewService = () => {
    const API_URL = 'https://localhost:8000/api/landlord/Overview';

    const getLandlordOverview = async (landlordId, token) => {
        try {
            const response = await fetch(`${API_URL}?landlordId=${landlordId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: You are not a landlord or your session has expired.');
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error fetching landlord overview');
            }

            return await response.json();
        } catch (error) {
            throw new Error(error.message || 'Network error or server is unreachable');
        }
    };

    return {
        getLandlordOverview,
    };
};

export default OverviewService;