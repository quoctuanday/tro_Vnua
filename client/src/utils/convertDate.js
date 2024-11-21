import { formatDate } from 'date-fns';

export default function dateConvert(date) {
    return formatDate(new Date(date), 'HH:mm:ss dd/MM/yyyy ');
}
