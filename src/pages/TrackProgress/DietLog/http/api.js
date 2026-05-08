import api from '../../../../lib/api';

export const getDietLogsApi = (params) => {
    return api.get('/diet/log', { params });
};

export const saveDietLogApi = (data) => {
    return api.post('/diet/log', data);
};

export const deleteDietLogApi = (uuid) => {
    return api.delete(`/diet/log/${uuid}`);
};
