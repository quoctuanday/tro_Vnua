function formatTimeDifference(inputTime) {
    const now = new Date();
    const time = new Date(inputTime);
    const diff = now - time;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));

    let result;

    switch (true) {
        case minutes < 60:
            result = `${minutes} phút trước`;
            break;
        case hours < 24:
            result = `${hours} giờ trước`;
            break;
        case days < 30:
            result = `${days} ngày trước`;
            break;
        default:
            result = `${months} tháng trước`;
            break;
    }

    return result;
}

export default formatTimeDifference;
