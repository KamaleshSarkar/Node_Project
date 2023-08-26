const router = require('express').Router();
const adminController = require('../controller/admin.controller');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname+'-'+Date.now() + 'myimg' + path.extname(file.originalname));
    }
});

const maxSize = 1*1024*1024;

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if(file.mimetype == 'image/jpg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpeg') {
            cb(null, true)
        } else {
            cb(null, false);
            return cb(new Error('only jpg and png allowed'));
        }
    },
    limits: maxSize
})

/* Roots for Login-Registration Page */

router.get('/', adminController.index);
router.get('/register', adminController.register);
router.post('/getRegister', upload.single('image'), adminController.getRegister);
router.get('/template', adminController.template);
router.get('/dashboard', adminController.userAuth, adminController.dashboard);
router.post('/getLogIn', adminController.getLogIn);
router.get('/logout', adminController.logout);

/*  Roots for Add-Delete-Update UserData */

router.get('/userView',adminController.userAuth,adminController.userView)
router.get('/addUsers',adminController.userAuth,adminController.addUsers)
router.post('/user-Add', upload.single('image'), adminController.userAdd);
router.get('/userDelete/:id',adminController.userDelete)
router.get("/userEdit/:id",adminController.userEdit)
router.post('/userUpdate', upload.single('image'), adminController.userUpdate);

/*  Roots for Add-delete-Update FAQ Data */
router.get('/faqTable',adminController.userAuth,adminController.faqTable)
router.get('/faqForm',adminController.userAuth,adminController.faqForm)
router.post('/faqSave', adminController.saveFaq);
router.get('/faqDelete/:id',adminController.faqDelete)
router.get('/faqEdit/:id',adminController.faqEdit)
router.post('/faqUpdate', adminController.faqUpdate);

/*   Roots for Add-delete-Update Blogs Data */ 
router.get('/blogsTable',adminController.blogsTable)
router.get('/blogsForm',adminController.blogsForm)
router.post('/blogSave', upload.single('image'), adminController.blogSave);
router.get('/blogsDelete/:id',adminController.blogsDelete)
router.get('/blogsEdit/:id',adminController.userAuth,adminController.blogsEdit)
router.post('/blogsUpdate', upload.single('image'), adminController.blogsUpdate);










module.exports = router;