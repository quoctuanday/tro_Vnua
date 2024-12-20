const axios = require('axios');
const crypto = require('crypto');
const Room = require('../models/Room');
const moment = require('moment-timezone');
const {
    vnp_Api,
    vnp_Url,
    vnp_ReturnUrlRoom,
    vnp_ReturnUrlRoommate,
    vnp_HashSecret,
    vnp_TmnCode,
} = require('../config/env/index');
const Roommate = require('../models/Roommate');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(
            /%20/g,
            '+'
        );
    }
    return sorted;
}

class PaymentController {
    // Vnpay
    async createPayment(req, res) {
        var ipAddr =
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        const data = req.body.data;
        console.log('ipaddr:', ipAddr, data);

        var tmnCode = vnp_TmnCode;
        var secretKey = vnp_HashSecret;
        var vnpUrl = vnp_Url;
        if (data.type) {
            var returnUrl = vnp_ReturnUrlRoom;
        } else {
            var returnUrl = vnp_ReturnUrlRoommate;
        }

        var date = new Date();
        console.log(date);
        var createDate = moment(date)
            .tz('Asia/Ho_Chi_Minh')
            .format('YYYYMMDDHHmmss');
        var orderId = data.roomId;
        var amount = 10000;
        var bankCode = 'VNBANK';

        var orderInfo = 'Khong co thong tin';

        var orderType = 'fashion';
        var locale = 'vn';
        var currCode = 'VND';
        var vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = orderType;
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var hmac = crypto.createHmac('sha512', secretKey);
        var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
        console.log('vnp_Params:', vnp_Params);
        console.log('signData:', signData);
        console.log('vnp_SecureHash:', signed);

        res.json({ vnpUrl: vnpUrl });
    }

    async callbackVnpay(req, res) {
        const type = req.body.data.type;
        var vnp_Params = req.query;
        var secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        var secretKey = vnp_HashSecret;
        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require('crypto');
        var hmac = crypto.createHmac('sha512', secretKey);
        var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash === signed) {
            var roomId = vnp_Params['vnp_TxnRef'];
            var rspCode = vnp_Params['vnp_ResponseCode'];
            if (type) {
                console.log(roomId);

                Room.findByIdAndUpdate(roomId, { isCheckout: true }).then(
                    (room) => {
                        console.log('update checkout successful');
                    }
                );
            } else {
                console.log(roomId);
                Roommate.findByIdAndUpdate(roomId, { isCheckout: true }).then(
                    (room) => {
                        console.log('update checkout successful');
                    }
                );
            }

            res.status(200).json({ RspCode: '00', Message: 'success' });
        } else {
            res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
        }
    }
}
module.exports = new PaymentController();
