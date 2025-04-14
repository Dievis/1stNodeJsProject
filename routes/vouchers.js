const express = require('express');
const {
    addVoucher,
    deleteVoucher,
    updateVoucher,
    getVoucher,
    getAllVouchers,
    getAvailableVouchers,
    redeemVoucher,
    getRedeemedVouchers
} = require('../controllers/voucher');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');
const router = express.Router();

router.get('/available/:userId', getAvailableVouchers);
router.get('/redeemed/:userId', getRedeemedVouchers);
router.post('/redeem', redeemVoucher);

router.get('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), getAllVouchers);
router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), addVoucher);
router.get('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), getVoucher);
router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), updateVoucher);
router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), deleteVoucher);


module.exports = router;
