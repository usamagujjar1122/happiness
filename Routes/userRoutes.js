const express = require('express')
const router = express.Router()
const {
  signup,
  login,
  loaduser,
  test,
  forgot_step_1,
  forgot_step_2,
  forgot_step_3,
  deposit_request,
  withdraw_request,
  admin_get_deposits,
  approve_deposit,
  reject_deposit,
  admin_get_withdraws,
  approve_withdraw,
  reject_withdraw,
  add_event,
  purchase_ticket,
  load_expired_events,
  draw,
  noti_del,
  noti_read,
  payment_methods,
  add_payment_method,
  del_payment_method,
  admin_get_events,
  edit_event,
  admin_delete_event,
  admin_get_users,
  admin_delete_user,
  edit_user,
  admin_login,
  create_admin,
  edit_profile_1,
  edit_profile_2,
  edit_profile_3,
  save_listing,
  generate_msg,
  update_auto_generate,
  payment
} = require("../Controllers/userController")
router.get('/test', test)
router.get('/loaduser', loaduser)
router.post('/signup', signup)
router.post('/login', login)
router.get('/loaduser', loaduser)
router.post('/forgot_step_1', forgot_step_1)
router.post('/forgot_step_2', forgot_step_2)
router.post('/forgot_step_3', forgot_step_3)
router.post('/deposit_request', deposit_request)
router.post('/withdraw_request', withdraw_request)
router.post('/payment', payment)
router.post('/purchase_ticket', purchase_ticket)
router.post('/noti_del', noti_del)
router.get('/noti_read', noti_read)



// Admin side
router.get('/admin_get_deposits', admin_get_deposits)
router.post('/approve_deposit', approve_deposit)
router.post('/reject_deposit', reject_deposit)

router.get('/admin_get_withdraws', admin_get_withdraws)
router.post('/approve_withdraw', approve_withdraw)
router.post('/reject_withdraw', reject_withdraw)

router.post('/add_event', add_event)
router.post('/edit_event', edit_event)
router.post('/admin_delete_event', admin_delete_event)
router.post('/admin_delete_user', admin_delete_user)
router.post('/edit_user', edit_user)

router.get('/load_expired_events', load_expired_events)
router.post('/draw', draw)

router.get('/payment_methods', payment_methods)
router.post('/add_payment_method', add_payment_method)
router.post('/del_payment_method', del_payment_method)

router.get('/admin_get_events', admin_get_events)
router.get('/admin_get_users', admin_get_users)

router.post('/admin_login', admin_login)
router.post('/create_admin', create_admin)







module.exports = router