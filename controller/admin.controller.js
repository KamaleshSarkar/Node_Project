const admin = require("../model/admin.model");
const usersModel = require("../model/users.model");
const faqModel = require("../model/faq.model");
const blogsModel = require("../model/blogs.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");

class AdminController {
  /*< For LogIn-Registration....!> */

  /**
   * @method userAuth
   * @description To authenticate users
   */
  async userAuth(req, res, next) {
    try {
      if (req.user) {
        next();
      } else {
        res.redirect("/admin");
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * @Method Index
   * @Description To Show Login Page
   */
  async index(req, res) {
    try {
      res.render("admin/index", {
        title: "Admin || Login",
        message: req.flash("message"),
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * @method Register
   * @description To Show Registration Form
   */
  async register(req, res) {
    try {
      res.render("admin/register", {
        title: "Admin || Registration",
        message: req.flash("message"),
      });
    } catch (err) {
      throw err;
    }
  }
  /**
   * @method GetRegister
   * @description To Save Registration Data
   */
  async getRegister(req, res) {
    try {
      req.body.firstName = req.body.firstName.trim();
      req.body.lastName = req.body.lastName.trim();
      req.body.email = req.body.email.trim();
      req.body.password = req.body.password.trim();
      if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.email ||
        !req.body.password
      ) {
        console.log("Field Should not be Empty!");
        req.flash("message", "Field Should Not Be Empty!");
        res.redirect("/admin/register");
      }
      req.body.image = req.file.filename;
      req.body.password = bcrypt.hashSync(
        req.body.password,
        bcrypt.genSaltSync(10)
      );
      req.body.fullName = `${req.body.firstName} ${req.body.lastName}`;

      let isEmailExists = await admin.find({ email: req.body.email });
      if (!isEmailExists.length) {
        let data = await admin.create(req.body);
        console.log(data);
        if (data && data._id) {
          console.log("Registration Successfully...!!");
          req.flash("message", "Registration Successful..!!");
          res.redirect("/admin");
        } else {
          console.log("Registration not Successfully...!!");
          req.flash("message", "Registration Not Successful!!");
          res.redirect("/admin/register");
        }
      } else {
        console.log("Email is already Exsist");
        res.redirect("/admin/register");
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * @Method template
   * @Description Basic Template
   */
  async template(req, res) {
    try {
      res.render("admin/template", {
        title: "Admin || Template",
      });
    } catch (err) {
      throw err;
    }
  }
  /**
   * @Method dashboard
   * @Description To Show The Dashboard
   */
  async dashboard(req, res) {
    try {
      console.log(req.user);
      res.render("admin/dashboard", {
        title: "Admin || Dashboard",
        user: req.user,
        message: req.flash("message"),
      });
    } catch (err) {
      throw err;
    }
  }
  /**
   * @method login
   * @description Post the login page
   */

  async getLogIn(req, res) {
    try {
      let isUserExists = await admin.findOne({
        email: req.body.email,
      });
      if (isUserExists) {
        const hashPassword = isUserExists.password;
        if (bcrypt.compareSync(req.body.password, hashPassword)) {
          //token creation

          const token = jwt.sign(
            {
              id: isUserExists._id,
              email: isUserExists.email,
              fullName: isUserExists.fullName,
              image: isUserExists.image,
            },
            "ME3DS8TY2N",
            { expiresIn: "20m" }
          );
          req.flash("message", "Welcome" + " " + isUserExists.fullName);

          //set your cookie

          res.cookie("userToken", token);
          res.redirect("/admin/dashboard");
        } else {
          console.log("Wrong Password..");
        }
      } else {
        console.log("Email Does not exists");
      }
    } catch (error) {
      throw error;
    }
  }
  /**
   * @method logout
   * @description delete cookies
   */
  async logout(req, res) {
    console.log("Cookies======>" + req.cookies);
    res.clearCookie("userToken");
    console.log("Cookie Cleared!");
    res.redirect("/admin");
  }
  /*< For User Managemnt...!> */
  /**
   * @method usersView
   * @description Shows the List of users registered
   */
  async userView(req, res) {
    try {
      let Data = await usersModel.find({ isDeleted: false });
      res.render("admin/userView", {
        title: "Admin || User Data View",
        message: req.flash("message"),
        user: req.user,
        Data,
      });
    } catch (err) {
      throw err;
    }
  }
  /**
   * @method addUser
   * @description Shows the page to Add User
   */
  async addUsers(req, res) {
    try {
      res.render("admin/userAdd", {
        title: "Admin || User",
        user: req.user,
        message: req.flash("message"),
      });
    } catch (err) {
      throw err;
    }
  }
  /**
   * @method addtUser
   * @description takes the data from the add-user form
   */
  async userAdd(req, res) {
    try {
      req.body.firstName = req.body.firstName.trim();
      req.body.lasttName = req.body.lastName.trim();
      req.body.email = req.body.email.trim();
      if (!req.body.firstName || !req.body.lastName || !req.body.email) {
        console.log("Field Should be not Empty");
        res.redirect("/admin/userView");
      }
      req.body.image = req.file.filename;
      req.body.fullName = `${req.body.firstName} ${req.body.lastName}`;
      let isEmailExists = await usersModel.find({ email: req.body.email });
      if (!isEmailExists.length) {
        let userData = await usersModel.create(req.body);
        if (userData && userData._id) {
          console.log("User Data Added Successfully");
          req.flash("message", "User data Added Successfully!!");
          res.redirect("/admin/userView");
        } else {
          console.log("User Data Added not Successfully");
          res.redirect("/admin/userView");
        }
      } else {
        console.log("Email is already exsist");
        res.redirect("/admin/userView");
      }
    } catch (err) {
      throw err;
    }
  }
  /**
   * @method userDelete
   * @description Soft Deleting the Users
   */
  async userDelete(req, res) {
    try {
      let dataDelete = await usersModel.findByIdAndUpdate(req.params.id, {
        isDeleted: true,
      });
      if (dataDelete && dataDelete._id) {
        console.log("User Data Deleted");
        req.flash("message", "Data Deleted!!");
        res.redirect("/admin/userView");
      } else {
        console.log("User Data not Deleted");
        req.flash("message", "Data Not Deleted!");
        res.redirect("/admin/userView");
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * @method userEdit
   * @description Editing the details of the users
   */
  async userEdit(req, res) {
    try {
      let Data = await usersModel.find({ _id: req.params.id });
      console.log(Data[0], "Edit Data");
      res.render("admin/userUpdate", {
        title: "Admin || Edit",
        message: req.flash("message"),
        user: req.user,
        response: Data[0],
      });
    } catch (err) {
      throw err;
    }
  }
  /**
   * @method userUpdate
   * @description
   */
  async userUpdate(req, res) {
    try {
      let data = await usersModel.find({ _id: req.body.id });
      let isEmailExists = await usersModel.find({
        email: req.body.email,
        _id: { $ne: req.body.id },
      });
      console.log(isEmailExists.length, "isEmailexists");
      console.log(isEmailExists);

      if (!isEmailExists.length) {
        req.body.image = req.file.filename;
        req.body.fullName = `${req.body.firstName} ${req.body.lastName}`;
        let studentUpdate = await usersModel.findByIdAndUpdate(
          req.body.id,
          req.body
        );
        if (req.file && req.file.filename) {
          console.log(req.file, "req.file");
          fs.unlinkSync(`./public/uploads/${data[0].image}`);
        }

        console.log(req.body, "req.body");
        console.log(studentUpdate, "studentUpdate");

        if (studentUpdate && studentUpdate._id) {
          console.log("User Updated");
          req.flash("message", "Data Updated!!");
          res.redirect("/admin/userView");
        } else {
          console.log("Something Went Wrong");
          req.flash("message", "Data Not Updated!");
          res.redirect("/admin/userView");
        }
      }
    } catch (err) {
      throw err;
    }
  }

  /*<For FAQ Management....!> */

  /**
   * @method FAQ
   * @description Show FAQ Tables
   */
  async faqTable(req, res) {
    try {
      let Data = await faqModel.find({ isDeleted: false });
      res.render("admin/faqView", {
        message: req.flash("message"),
        user: req.user,
        title: "Admin || FAQ-List",
        Data,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * @method FAQ Add
   * @description To show FAQ form
   */

  async faqForm(req, res) {
    try {
      res.render("admin/faqAdd", {
        message: req.flash("message"),
        user: req.user,
        title: "Admin || FAQ-Form",
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * @method FAQ Save
   * @description To save FAQ Data
   */

  async saveFaq(req, res) {
    try {
      req.body.question = req.body.question.trim();
      req.body.answer = req.body.answer.trim();

      if (!req.body.question || !req.body.answer) {
        console.log("Field Should Not Empty..!");
        res.redirect("/admin/faqForm");
      }

      let Data = await faqModel.create(req.body);
      if (Data && Data._id) {
        console.log("Question Added...!");
        req.flash("message", "Question Added Successful!!");
        res.redirect("/admin/faqTable");
      } else {
        console.log("Question added failled!!");
        req.flash("message", "Data entry Not Successful!!");
        res.redirect("/admin/faqTable");
      }
    } catch (err) {
      throw err;
    }
  }
  /**
   * @method:FAQ Delete
   * @description: To Soft Delete FAQ
   */
  async faqDelete(req, res) {
    try {
      let faqDelete = await faqModel.findByIdAndUpdate(req.params.id, {
        isDeleted: true,
      });
      if (faqDelete && faqDelete._id) {
        console.log("FAQ Data deleted...!!");
        req.flash("message", "FAQ Deleted!!");
        res.redirect("/admin/faqTable");
      } else {
        console.log("FAQ Data not deleted deleted...!!");
        res.redirect("/admin/faqTable");
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * @method:FAQ Edit
   * @description: To Shot Edit-Page
   */
  async faqEdit(req, res) {
    try {
      let Data = await faqModel.find({ _id: req.params.id });
      res.render("admin/faqUpdate", {
        title: "FAQ || Edit",
        message: req.flash("message"),
        user: req.user,
        response: Data[0],
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * @method faqUpdate
   * @description
   */
  async faqUpdate(req, res) {
    try {
      // let data = await AdminFaq.find({_id: req.body.id});
      let questionUpdate = await faqModel.findByIdAndUpdate(
        req.body.id,
        req.body
      );
      if (questionUpdate && questionUpdate._id) {
        console.log("FAQ Updated");
        req.flash("message", "Data Updated!!");
        res.redirect("/admin/faqTable");
      } else {
        console.log("Something Went Wrong");
        req.flash("message", "Data Not Updated!");
        res.redirect("/admin/faqTable");
      }
    } catch (err) {
      throw err;
    }
  }

  /*<For FAQ Management....!> */

  /**
   * @method BLOG Tables
   * @description To Show BLOGS Data
   */
  async blogsTable(req, res) {
    try {
      let Data = await blogsModel.find({ isDeleted: false });
      res.render("admin/blogsView", {
        message: req.flash("message"),
        user: req.user,
        title: "Admin || BLOG-List",
        Data,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * @method BLOGS Form
   * @description To Show BLOGS form
   */

  async blogsForm(req, res) {
    try {
      res.render("admin/blogsAdd", {
        message: req.flash("message"),
        user: req.user,
        title: "Admin || BLOG-Form",
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * @method: Save Blogs
   * @description: To Save Blogs Data
   */
  async blogSave(req, res) {
    try {
      req.body.title = req.body.title.trim();
      req.body.writer = req.body.writer.trim();
      req.body.content = req.body.content.trim();
      if (!req.body.title || !req.body.writer || !req.body.content) {
        console.log("Field Should be not empty");
        res.redirect("/admin/blogsTable");
      }
      req.body.image = req.file.filename;
      let Data = await blogsModel.create(req.body);
      if (Data && Data._id) {
        console.log("Blogs Are Added");
        req.flash("message", "BLOGS Added Successfully..!!");
        res.redirect("/admin/blogsTable");
      } else {
        console.log("Blogs Are not Added");
        req.flash("message", "BLOGS Added Unsuccessfull..!!");
        res.redirect("/admin/blogsTable");
      }
    } catch (err) {
      throw err;
    }
  }
  /**
   * @method: BLOGS Delete ..(Soft Delete)
   * @description: To Delete BLOGS data
   */

  async blogsDelete(req,res){
    try {
      
      let deleteBlog=await blogsModel.findByIdAndUpdate(req.params.id,{isDeleted:true})
      if(deleteBlog && deleteBlog._id){
        console.log('Blogs Deleted..!');
        req.flash('message','BLOGS Deleted Successfully..!')
        res.redirect('/admin/blogsTable')
      }else{
        console.log('Blogs not Deleted..!');
        req.flash('message','BLOGS Deleted unsuccessfully..!')
        res.redirect('/admin/blogsTable')
      }
    } catch (err) {
      throw err
    }
  }

  /**
   * @method:BLOGS Edit
   * @description: To Show Blogs Edit Page
   */
  async blogsEdit(req, res) {
    try {
      let Data = await blogsModel.find({ _id: req.params.id });
      res.render('admin/blogsUpdate', {
        title: 'BLOG || Edit',
        message: req.flash('message'),
        user: req.user,
        response: Data[0]
      })
    } catch (err) {
      throw err;
    }
  }
  
   /**
   * @method blogqUpdate
   * @description 
   */
   async blogsUpdate(req, res) {
    try {
      req.body.image = req.file.filename;
      let blogsUpdate = await blogsModel.findByIdAndUpdate(req.body.id, req.body);

      if (req.file && req.body.filename) {
        fs.unlinkSync(`./public/uploads/${data[0].image}`);
      }
     if (blogsUpdate && blogsUpdate._id) {
        console.log('Blog Updated');
        req.flash('message', 'Data Updated!!');
        res.redirect('/admin/blogsTable');
      } else {
        console.log('Something Went Wrong');
        req.flash('message', 'Data Not Updated!');
        res.redirect('/admin/blogsTable');
      }
    }
    catch (err) {
      throw err;
    }
  }
}
module.exports = new AdminController();
