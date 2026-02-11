import moment from 'moment';
import { DATE_FORMAT, DATE_TIME_FORMAT, TIME_FORMAT } from './constants';

export const formatDate = (
    date: string | Date | number
): string => {
    return moment(date).format(DATE_FORMAT);
};

export const formatDateTime = (date: string | Date | number): string => {
    return moment(date).format(DATE_TIME_FORMAT);
};

export const formatTime = (date: string | Date | number): string => {
    return moment(date).format(TIME_FORMAT);
};
