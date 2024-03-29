const asyncHandler=require('express-async-handler');
const Product=require('../model/productModel');
const slugify=require('slugify');

const Category=require('../model/categoryModel');
const User=require('../model/userModel');
const productModel = require('../model/productModel');
const categoryModel = require('../model/categoryModel');



//get all products

const allProducts = asyncHandler(async (req, res) => {
    try {
      const limit = 8; // Number of products per page
      const page = req.query.page ? parseInt(req.query.page) : 1; // Current page number
  
      // Using the aggregation pipeline to efficiently paginate and count documents
      const [product, totalProduct] = await Promise.all([
        Product.find()
          .skip((page - 1) * limit)
          .limit(limit),
        Product.countDocuments(),
      ]);
  
      const totalPages = Math.ceil(totalProduct / limit);
  
      res.render('product', { product, page, totalPages, limit });
    } catch (error) {
      console.error("Error in all products view", error);
      // Handle the error appropriately, for example, send an error response to the client
      res.status(404).render('404', { statusCode: 404, message: "Page not found" });
    }
  });
  


//add Product page rendering

const addProduct = asyncHandler(async (req, res) => {
    try {

        const categories = await Category.find(); // Using MongoDB as an example
        res.render('addProduct', { categories: categories });

    } catch (error) {
        console.log('Error in addProduct function', error);
    }
})


// create a new product and save to database

const createProduct = asyncHandler(async (req, res) => {
    try {
        const { title } = req.body;
        const productData = req.body;

        const productExist = await Product.findOne({ title });

        
        if (!productExist) {
            const caseInsensitiveCategoryExist = await Product.findOne({
                title: { $regex: new RegExp('^' + title + '$', 'i') }
            });
            if(caseInsensitiveCategoryExist){
                res.redirect('/admin/addProduct');

            }else{
                if (productData.title) {
                    productData.slug = slugify(productData.title);
                }

            




            const images = [];
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    images.push(req.files[i].filename);
                }
            }

            const newProduct = new Product({
                title: productData.title,
                description: productData.description,
                brand: productData.brand,
                slug: productData.title,  // Corrected this line
                price: productData.price,
                color: productData.color,
                quantity: productData.quantity,
                category: productData.category,
                size:productData.size,  // Corrected the typo here
                images: images,
            });

            const pr = await newProduct.save();

            res.redirect('/admin/product');
        }
    } else {
            console.log('Product already exists');
            res.redirect('/admin/addProduct');
        }
    } catch (error) {
        console.log('Error happened in createProduct function', error);
          // Added error response
    }
});



//rendering specific product edit page

const editProduct = asyncHandler(async (req, res) => {
    try {
        const { id } = req.query;

        const product = await Product.findById(id);
        const categories = await Category.find();

        if (product) {
            res.render('editProduct', { product: product, categories: categories });
        } else {
            res.status(404).send('Product not found'); 
        }

    } catch (error) {
        console.log('Error occurred in editProduct function', error);
      res.status(404).render('404', { statusCode: 404, message: "Page not found" });
    }
});

//edit product

const productEdited = asyncHandler(async (req, res) => {
    try {
        const id = req.body.id;
        const productData = req.body;
        
        let updateData = {
            title: productData.title,
            description: productData.description,
            brand: productData.brand,
            slug: slugify(productData.title),  // Assuming you're using slugify
            price: productData.price,
            color: productData.color,
            quantity: productData.quantity,
            size:productData.size,
            category: productData.category
        };

        // Handle image upload
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => file.filename);
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

       
        
        res.redirect('/admin/product');
    } catch (error) {
        console.log('Error occurred in productEdited function', error);
        res.status(404).render('404', { statusCode: 404, message: "Page not found" });
    }
});



//aproduct view

const aProductPage = asyncHandler(async (req, res) => {
    try {
       const userId=req.session.user;
       const user=await User.findById(userId);
       const productId=req.query.id;
       const product=await Product.findById(productId);

       if(product)
       {
        res.render('aProduct',{user,product})
       }


    } catch (error) {
        console.log('Error occurred in product controller aProductPage function', error);
        res.status(404).render('404', { statusCode: 404, message: "Page not found" });
    }
});


// //shop a product page

const shopProduct = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6; 

    // Calculate the skip value to determine 
    const skip = (page - 1) * limit;

    // const product = await Product.find()
    //     .skip(skip)
    //     .limit(limit);

    // // Get the total number of products in the database
    // const totalProductsCount = await Product.countDocuments();

    // // Calculate the total number of pages based on the total products and limit
    // const totalPages = Math.ceil(totalProductsCount / limit);

    // res.render('shop', { product, page, totalPages ,limit });
    // } catch (error) {
    //     console.log('Error occured in shopProduct function', error);
    // }
        // Modify the query to exclude deleted products\
        const id=req.session.user
        const user=await User.findById(id)
        const product= await Product.find({ isDeleted: false })
            .skip(skip)
            .limit(limit);

        // Get the total number of non-deleted products in the database
        const totalProductsCount = await Product.countDocuments({ isDeleted: false });

        // Calculate the total number of pages based on the total non-deleted products and limit
        const totalPages = Math.ceil(totalProductsCount / limit);

        res.render('shop', {user,product, page, totalPages, limit });
    } catch (error) {
        console.log('Error occurred in shopProduct function', error);
        // Handle the error appropriately, for example, by sending an error response.
        res.status(404).render('404', { statusCode: 404, message: "Page not found" });
    }
});




//unlist a product

const unlistProduct = asyncHandler(async (req, res) => {
    try {
        const productId = req.query.id;

    const productExists = await Product.findById(productId);
    if (!productExists) {
        return res.status(404).json({ message: "Product not found" });
    }

    const unlistedProduct = await Product.findByIdAndUpdate(productId, {
        status: false
    }, { new: true });

    if (!unlistedProduct) {
        return res.status(400).json({ message: "Failed to unlist product" });
    }

    res.redirect('/admin/product');
    } catch (error) {
        console.log("error occured in unlistProduct function");
    }
});



//list product



const listProduct = asyncHandler(async (req, res) => {
    try {
        const productId = req.query.id;

    const productExists = await Product.findById(productId);
    if (!productExists) {
        return res.status(404).json({ message: "Product not found" });
    }

    const listedProduct = await Product.findByIdAndUpdate(productId, {
        status: true
    }, { new: true });

    if (!listedProduct) {
        return res.status(400).json({ message: "Failed to list product" });
    }

    res.redirect('/admin/product');
    } catch (error) {
        console.log("error occured in listProduct function");
    }
});


//product delete

const deleteProduct=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id;
        const product=await Product.findByIdAndUpdate(id,{isDeleted:true},{new:true});
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }
        res.redirect('/admin/product');
    } catch (error) {
      console.log("deleteProduct error");  
    }
})




// Search products
const searchProduct = async (req, res) => {
    try {
        const limit=8; // Number of products per page
        const page=req.query.page ? parseInt(req.query.page) : 1;  // Current page number
        const product = await Product.find()
            .skip((page - 1) * limit)  // Skip the results from previous pages
            .limit(limit);  // Limit the number of results to "limit"

        const totalProduct = await Product.countDocuments();
        const totalPages = Math.ceil(totalProduct / limit);
        console.log("hai");

      


      const userid=req.session.userId
      const search = req.body.search;
     
      const categoryload = await categoryModel.find({
        catugoryName: { $regex: new RegExp(search, "i") },
      });
      const productlist = await productModel.find({
        title: { $regex: new RegExp(search, "i") },
      });
  
      if (productlist.length > 0) {
        res.render("product", {
          product: productlist,
          category: categoryload,
          userid,
          page,totalPages,limit
          
        });
      } else if (categoryload.length > 0) {
        const product = await productModel.find({
          category: categoryload[0].catugoryName,
        });
        res.render("product", {
          product: product,
          category: categoryload,
          userid,
          page,totalPages,limit
        
        });
      } else {
        res.render("product", {
          product: productlist,
          category: categoryload,
          userid,
          page,totalPages,limit
         
        });
      }
    } catch (error) {
      res.status(500).send("An error occurred.");
    }
  };













module.exports={
    allProducts,
    addProduct,
    createProduct,
    editProduct,
    productEdited,
    aProductPage,
    shopProduct,
    unlistProduct,
    listProduct,
    deleteProduct,
    searchProduct
}