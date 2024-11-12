async function getCoordinates(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
    )}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.length > 0) {
        const location = data[0];
        return {
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
        };
    } else {
        throw new Error('Không tìm thấy tọa độ cho địa chỉ này.');
    }
}

export default getCoordinates;
