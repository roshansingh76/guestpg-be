import { Router } from 'express'
import {
  getAmenitiesList,
  getPhotoCategoriesList,
  getExpenseCategoriesList,
} from '../controllers/master.controller'

const router = Router()

// Public routes for master data
router.get('/amenities', getAmenitiesList)
router.get('/photo-categories', getPhotoCategoriesList)
router.get('/expense-categories', getExpenseCategoriesList)

export default router
