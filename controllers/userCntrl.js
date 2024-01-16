const User = require('../model/userModel')
const nodemailer = require('nodemailer')
const Product = require('../model/productModel')
const categoryModel = require('../model/categoryModel')
const asyncHandler = require('express-async-handler')
const Order = require('../model/orderModel')
const Banner=require('../model/bannerModel')

const bcrypt = require('bcryptjs')





const generateHashedPassword = async (password) => {
    const saltRounds = 10; // Number of salt rounds
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};


//load index

const loadIndex = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user;
        const product = await Product.find({ isDeleted: false, status: true })
        const user = await User.findById(userId)
        const banner=await Banner.find()

        const category = await categoryModel.find()
        res.render('index', { user, product, category: category ,banner})
    } catch (error) {
        console.log("error happens in userController loadIndex function ", error);
       


    }
})


//user login

const loginUser = async (req, res) => {

    try {
        res.render('login', { message: '' })
    } catch (error) {
        console.log("login user error");

    }
}
const emailForgot = asyncHandler(async (req, res) => {
    try {

        res.render('forgotOTP')
    } catch (error) {

    }
})

//user register

const registerUser = async (req, res) => {
    console.log('mmmmmmm', req);
    try {
        if (req.query.id) {
            req.session.referel = req.query.id;
            console.log(req.session.referel, "sessionnnnn");
          }

      
        res.render('registration')
    } catch (error) {
        console.log(error.message);

    }

}
function generateOtp() {
    var digits = '1234567890';
    var otp = ''
    for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)]
    }
    return otp
}

//email otp verification

const createUser = asyncHandler(async (req, res) => {
    try {
        const email = req.body.email;
        console.log('+++++++++++++++++++++=', req.body);
        const findUser = await User.findOne({ email: email })
        if (!findUser) {
            //create a new user
            const otp = generateOtp();
            console.log('----------------------------', otp);
            const transporter = nodemailer.createTransport({
                service: "gmail",
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.AUTH_EMAIL,
                    pass: process.env.AUTH_PASS
                },
            });
            const info = await transporter.sendMail({
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "verify Your Account",
                text: `your OTP is:${otp}`,
                html: `<b> <h4> Your OTP ${otp}<h4>  <br> <a href="/emailOTP/">Click here</a><b>`,
            })
            if (info) {
                req.session.userOTP = otp;
                console.log("this is the session otp", req.session.userOTP);


                req.session.userData = req.body;
                console.log(' iam a here at session');
                // console.log('this is user data',req.session.userData);
                // console.log('this is req.body data',req.session.userData);

                res.render('emailOtp', { email: req.body.email, message: null })
                // console.log("message sent: %s",info.message);
            } else {
                //user already exist
                res.render('registration', { errMessage: "User Already exist", message: '' })
            }
        }
    } catch (error) {
        console.log("Create user error", error.message);

    }
});


const resendOTP = asyncHandler(async (req, res) => {
    try {
        const email = req.body.email;
        const findUser = await User.findOne({ email: email });

        if (!findUser) {
            const otp = generateOtp();
            const transporter = nodemailer.createTransport({
                service: "gmail",  // Corrected the service name
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.AUTH_EMAIL,
                    pass: process.env.AUTH_PASS
                }
            });

            const info = await transporter.sendMail({
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Resend Verification OTP",
                text: `Your OTP is: ${otp}`,
                html: `<b><h4>Your OTP is ${otp}</h4><br><a href="/user/emailOTP">Click here</a></b>` // Removed the extra slash
            });

            if (info) {
                req.session.userOTP = otp;
                res.json({ success: true, message: "Email sent successfully" }); // Corrected "succes" to "success"
            } else {
                res.json({ success: false, message: "Email error" }); // Corrected "succes" to "success"
            }
        } else {
            res.json({ success: false, message: "Email is already verified." }); // Corrected "succes" to "success"
        }
    } catch (error) {
        console.log("error in resend otp function", error);
    }
});


// User verify
const verifyUser = asyncHandler(async (req, res) => {
    try {
        console.log('hhhhhhhhhhhh');

        const { email, password } = req.body;
        const findUser = await User.findOne({ email });

        if (findUser.isBlocked) {
            return res.render('login', { message: 'Your account has been Blocked' });
        }

        if (findUser && (await findUser.isPasswordMatched(password))) {
            req.session.user = findUser._id;
            console.log('Successful login');
            return res.redirect("/");
        } else {
            console.log('Error in login user');
            return res.render("login", { message: 'Invalid email or password' });
        }
    } catch (error) {
        console.log("Error in userController verifyUser function:", error);
    }
});



// Email verified
const emailVerified = async (req, res) => {
    try {
        console.log('req.body of email ::::');
        console.log(req.body.otp);

        const enteredOTP = req.body.otp;
        console.log('this is the entered otp', enteredOTP);
        console.log('this is the session otp', req.session.userOTP);

        // Check if OTP is expired
        const currentTimestamp = Date.now();
        const otpTimestamp = req.session.otpTimestamp;
        const otpExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds

        if (currentTimestamp - otpTimestamp > otpExpirationTime) {
            console.log('OTP has expired');
            return res.render('emailOtp', { message: 'OTP has expired. Please request a new one.' });
        }

        if (enteredOTP === req.session.userOTP) {
            const user = req.session.userData;
            console.log(user, 'this is user data');

            const saveUserData = new User({
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                password: user.password,
            });

            if (req.session.referel) {
                const id = req.session.referel;
                console.log(id, 'this is id ');
                const referUser = await User.findById(id);
                saveUserData.wallet = 200;
                referUser.wallet += 200;

                const history = {
                    amount: 200,
                    status: 'credit',
                    timestamp: Date.now(),
                };

                saveUserData.history.push(history);
                referUser.history.push(history);

                const user = await User.findById(req.session.referel);
                user.wallet += 200;
                user.history.push(history);
                await user.save();
            }

            const savedUser = await saveUserData.save();
            req.session.user = savedUser._id;
            console.log('this is saved user data >>>>>>>>>>>>>>>>>>>>>>>>', savedUser);

            return res.redirect('/');
        } else {
            console.log('Invalid OTP');
            return res.render('emailOtp', { message: 'Entered OTP is invalid. Please enter the correct OTP.' });
        }
    } catch (error) {
        console.log('User email verification error', error);
        return res.status(500).send('Internal Server Error');
    }
};



//user logout

const logout = asyncHandler(async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) throw err;
            res.redirect('/login')
        })
    } catch (error) {
        console.log("error during logout:", error);
        res.status(500).send("Internal Server Error")

    }

})
// //User search

// const searchProduct = async (req, res) => {
//     try {
//         console.log(req.body);
//         const limit = 8; // Number of products per page
//         const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page number
//         const product = await Product.find()
//             .skip((page - 1) * limit)  // Skip the results from previous pages
//             .limit(limit);  // Limit the number of results to "limit"

//         const totalProduct = await Product.countDocuments();
//         const totalPages = Math.ceil(totalProduct / limit);
//         console.log("hai");




//         const userid = req.session.userId
//         const search = req.body.search;

//         const categoryload = await categoryModel.find({
//             name: { $regex: new RegExp(search, "i") },
//         });
//         console.log(categoryload);
//         const productlist = await Product.find({
//             title: { $regex: new RegExp(search, "i") },
//         });
//         console.log(productlist);
//         if (productlist.length > 0) {
//             res.render("index", {
//                 product: productlist,
//                 category: categoryload,
//                 userid,
//                 page, totalPages, limit

//             });
//         } else if (categoryload.length > 0) {
//             const product = await productModel.find({
//                 category: categoryload[0].name,
//             });
//             res.render("index", {
//                 product: product,
//                 category: categoryload,
//                 userid,
//                 page, totalPages, limit

//             });
//         } else {
//             res.render("index", {
//                 product: productlist,
//                 category: categoryload,
//                 userid,
//                 page, totalPages, limit

//             });
//         }
//     } catch (error) {
//         res.status(500).send("An error occurred.");
//     }
// };

//User Profile Creation

const userProfile = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)
        const orders = await Order.find({ userId: userId }).sort({ createdOn: -1 });



        console.log(user);
        res.render('userProfile', { user, orders })
    } catch (error) {
        console.log('Error in the userProfile', error);

    }
})

//Edit Profile

const editProfile = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user
        const user = await User.findById(userId)

        res.render('editProfile', { user })
    } catch (error) {
        console.log('Error in the editProfile', error);
    }
})

//Update user Profile

const updateProfile = asyncHandler(async (req, res) => {
    try {
        const { id, username, email, mobile } = req.body
        const user = await User.findById(id)
        const similarUser = await User.find({
            $and:
                [{ _id: { $ne: user._id } },
                { $or: [{ username }, { email }] }]
        })
        if (similarUser.length == 0) {
            user.username = username
            user.email = email
            user.mobile = mobile
            await user.save()
            res.redirect('/profile')
        } else {
            console.log('User already exist');
        }
    } catch (error) {
        console.log('Error in update user function', error);

    }
})

//Add user Profile Picture

const addProfilePic = asyncHandler(async (req, res) => {
    try {
        const { id } = req.body
        console.log(id);

        //Validate the exitence of id and file

        if (!id || !req.file) {
            return res.status(400).send({ message: 'Id or file is  missing' })
        }
        const image = req.file.filename
        const user = await User.findByIdAndUpdate(
            id,
            {
                image: image,
            },
            { new: true }
        )
        //Optionally, check if the user exists before updating
        if (!user) {
            return res.status(404).send({ message: "user not found" })
        }
        res.redirect('/profile')
    } catch (error) {
        console.log("Error in addProfilePic function", error);
        res.status(500).send({ message: 'Internal server error' })

    }
})








//process addnew address
const processNewAddress = asyncHandler(async (req, res) => {
    try {
        console.log("hgfhgvgh");
        res.render('addAddress')

    } catch (error) {
        console.log("Error happens in the userCntrl processNewAddress function", error);

    }
})
//Add address

const addUserAddress = asyncHandler(async (req, res) => {
    try {
        const { fullName, mobile, region, pinCode, addressLine, areaStreet, landmak, townCity, state, addressType } = req.body
        const userId = req.session.user
        const user = await User.findById(userId)
        const newUserAddress = { fullName, mobile, region, pinCode, addressLine, areaStreet, landmak, townCity, state, addressType, main: false }
        if (user.address.length === 0) {
            newUserAddress.main = true
        }
        user.address.push(newUserAddress)
        await user.save()
        res.redirect('/profile')

    } catch (error) {
        console.log("Error  in addUserAddress function", error);

    }
})

//Checkout time Addadress
const checkoutAddress = asyncHandler(async (req, res) => {
    try {
        const { fullName, mobile, region, pinCode, addressLine, areaStreet, landmak, townCity, state, addressType } = req.body
        const userId = req.session.user
        const user = await User.findById(userId)
        const newUserAddress = { fullName, mobile, region, pinCode, addressLine, areaStreet, landmak, townCity, state, addressType, main: false }
        if (user.address.length === 0) {
            newUserAddress.main = true
        }
        user.address.push(newUserAddress)
        await user.save()
        res.redirect('/checkout')
    } catch (error) {
        console.log("Error happens in the usercontroll Checkout function", error);

    }
})

//Edit User Address

const editAddress = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id
        const userId = req.session.user
        const user = await User.findById(userId)
        const address = user.address.id(id)
        res.render('editAddress', { address })
    } catch (error) {
        console.log('Error in the editAddress', error);
    }
})

//Update Address

const updateAddress = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.user
        const { fullName, mobile, region, pinCode, addressLine, areaStreet, landmak, townCity, state, addressType, id } = req.body
        const user = await User.findById(userId)
        if (user) {
            const oldAddress = user.address.id(id)
            if (oldAddress) {
                oldAddress.fullName = fullName
                oldAddress.mobile = mobile
                oldAddress.region = region
                oldAddress.pinCode = pinCode
                oldAddress.addressLine = addressLine
                oldAddress.areaStreet = areaStreet
                oldAddress.landmark = landmak
                oldAddress.townCity = townCity
                oldAddress.state = state
                oldAddress.addressType = addressType
                await user.save()
                res.redirect('/profile')
            } else {
                console.log("Address Not Found");
            }
        }
    } catch (error) {
        console.log('Error in the update address function', error);

    }
})

//Delete Address

const deleteAddress = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id
        const userId = req.session.user
        const user = await User.findById(userId)
        const deleteAddress = await User.findOneAndUpdate(
            { _id: userId },
            {
                $pull: { address: { _id: id } }
            },
            { new: true }
        )
        console.log('This is the deleted address', deleteAddress);
    } catch (error) {
        console.log('Error in the deleteAddress Function', error);


    }

})
//forgot password----------------------------------------------------------------

const forgotPsdPage = asyncHandler(async (req, res) => {
    try {
        res.render("forgotPassword");
    } catch (error) {
        console.log(
            "Error happents in userControler forgotPsdPage  function :",
            error
        );
    }
});

//check email is valid in forgot password-------------------------------------------

const forgotEmailValid = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        const findUser = await User.findOne({ email: email });
        console.log(findUser, "thie isi user");
        if (findUser) {
            console.log('>>>>>>>>');
            const otp = generateOtp();
            console.log(otp);
            const transporter = nodemailer.createTransport({
                service: "gmail",
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.AUTH_EMAIL,
                    pass: process.env.AUTH_PASS,
                },
            });
            console.log(transporter);
            const info = await transporter.sendMail({
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Verify Your Account  ✔",
                text: `Your OTP is : ${otp}`,
                html: `<b>  <h4 >Your OTP  ${otp}</h4>    <br>  <a href="/user/emailOTP/">Click here</a></b>`,
            });
            if (info) {
                console.log(info, "this is info");
                req.session.forgotOTP = otp;
                req.session.forgotEmail = req.body.email;
                console.log(req.session.forgotEmail);


                res.redirect('/emailForgot')
                console.log('??????????????????????????????//');

            } else {
                res.json("email error");
            }
        } else {
            console.log('<<<<<<<<<><><><><><><><><>');
            res.redirect("/user/forgotPassword");
        }
    } catch (error) {
        console.log(
            "Error happens in userControler forgotEmailValid function:",
            error
        );
    }
});




//--------------------------------------------------------------------

const forgotPsdOTP = asyncHandler(async (req, res) => {
    try {

        const enteredOTP = req.body.otp
        console.log("otp entered by user :", enteredOTP);
        if (enteredOTP === req.session.forgotOTP) {
            res.render("resetPassword");
        } else {
            console.log("error in otp ");
        }
    } catch (error) {
        console.log(
            "Error hapents in userControler forgotPsdOTP  function :",
            error
        );
    }
});



//-----------------------------------------------


const updatePassword = asyncHandler(async (req, res) => {
    try {
        const email = req.session.forgotEmail;
        const user = await User.findOne({ email });
        if (user) {
            const hashedPassword = await generateHashedPassword(req.body.password);
            const updateUser = await User.findByIdAndUpdate(
                user._id,
                {
                    password: hashedPassword,
                },
                { new: true }
            );


            res.redirect("/");
        }
    } catch (error) {
        console.log(
            "Error hapents in userControler updatePassword  function :",
            error
        );
    }
});


//Change password
const changePassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        const userId = req.session.user; // Assuming you store user ID in the session upon login

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!(await user.isPasswordMatched(oldPassword))) {
            return res.status(400).json({ error: 'Incorrect old password' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ error: 'New passwords do not match' });
        }

        // Update the user's password
        console.log(newPassword);
        const hashedPassword = await generateHashedPassword(newPassword);
        // user.password = hashedPassword;
        const updateUser = await User.findByIdAndUpdate(
            user._id,
            {
                password: hashedPassword,
            },
            { new: true }
        );
        // const passwordChange = User.findByIdAndUpdate({ _id: userId }, { $set: { password: hashedPassword } })
        // if (passwordChange) {
        //     console.log('password changed');
        // }
        await user.save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error in userController changePassword function:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

const aboutpage= asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user
        const user=await User.findById(userId)
        res.render('about',{user})
        
    } catch (error) {
        console.log('Error Happence in th about Ctrl in;; the funtion aboutpage',error);
    }
})

const contactpage= asyncHandler(async(req,res)=>{
    try {
        const userId=req.session.user
        const user=await User.findById(userId)
        res.render('contact',{user})
        
    } catch (error) {
        console.log('Error Happence in the contactCtrl in;; the funtion contact page',error);
    }
})












module.exports = {
    loginUser,
    verifyUser,
    registerUser,
    createUser,
    loadIndex,
    resendOTP,
    emailVerified,
    logout,
    // searchProduct,
    userProfile,
    editProfile,
    updateProfile,
    addProfilePic,
    addUserAddress,
    editAddress,
    updateAddress,
    deleteAddress,
    emailForgot,
    forgotEmailValid,
    forgotPsdOTP,
    updatePassword,
    forgotPsdPage,
    processNewAddress,
    checkoutAddress,
    changePassword,
    aboutpage,
    contactpage












}