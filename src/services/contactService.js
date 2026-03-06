import { apiService } from './api';

export const contactService = {
    submit: async (data) => {
        return await apiService.post('/contact', {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
        });
    },
};
