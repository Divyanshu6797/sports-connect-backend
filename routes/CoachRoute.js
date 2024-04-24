const express=require('express')
const router =express.Router()

const {
  coachmiddle
} =require ('../middleware/coachMiddleware')

const {
  signup,
  login,
  logout
} =require('../controllers/coachController')

router.post('/signup',signup)
router.post('/login',login)
router.get('/logout',logout)

module.exports = router