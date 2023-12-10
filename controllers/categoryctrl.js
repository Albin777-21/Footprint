const asyncHandler=require('express-async-handler')
const Category=require('../model/categoryModel')


// const addCategory=asyncHandler(async(req,res)=>{
//     try {
//         const {name,description}=req.body;
//         // if (!description) {
//         //     // if there is no description respond with a 400 Bad Request status
//         //     return res.status(400).send('Description is required');
//         // }
//         const categoryExist=await Category.findOne({name});
//         if(categoryExist)
//         {
//            res.redirect('/admin/category');
//         }else{
//             const caseInsensitiveCategoryExist = await Category.findOne({
//                 name: { $regex: new RegExp('^' + name + '$', 'i') }
//             });
    
//             if (caseInsensitiveCategoryExist) {
                
//                 res.redirect('/admin/category');
//             }
       
//             const newCategory=new Category(
//                 {
//                     name,
//                     description,
//                     image:req.file.filename
//                 }
//             );
        
//         await newCategory.save();
//         res.redirect('/admin/category');
//             }
//     } catch (error) {
//         console.log("add category error",error);
        
//     }
// })

const addCategory = async (req, res) => {
    try {
        console.log(req.body);
        const categoryData = new Category({
            name: req.body.name,
            image: req.file.filename,
            isListed: req.body.isListed,
            description: req.body.description
        });
        const category = await categoryData.save();
        console.log(category);

        if (category) {
            const categoryList = await Category.find({});
            return res.render('category', { message: 'Category added Successfully', category: categoryList });
        } 
    } catch (error) {
        console.log(error.name); 
        console.log(error.code);
        if (error.name === 'MongoServerError' && error.code === 11000) {
            const categoryList = await Category.find({});
            return res.render('category', { message: 'Category name is already taken. Please try a different name.', category: categoryList });
        } else {
            console.log(error.message);
            const categoryList = await Category.find({});
            return res.render('category', { message: 'An error occurred while adding the category', category: categoryList  });
        }
    }
};











//Get all Category from database

const allCategory=asyncHandler(async(req,res)=>{
    try {
        const allCategory=await Category.find()
        req.session.Category=allCategory
        res.render('category',({category:allCategory}))
    } catch (error) {
        console.log('This is all category error',error);
        
    }
})

//edit category

const editCategory=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id;
        const category=await Category.findById(id)
        if(category){
            res.render('editCategory',{category:category})
        }else{
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log('Error happens in categoryController editCategory function',error);
        
    }
})

//update category

const updateCategory = asyncHandler(async (req, res) => {
    try {
        const id = req.body.id;
        const img = req.file ? req.file.filename : null; // Check if req.file is defined
console.log(id);
        if (img) {
            await Category.findByIdAndUpdate(id, {
                name: req.body.name,
                description: req.body.description, // Use the description from the request body
                image: req.file.filename
            }, { new: true })
       } else {
            await Category.findByIdAndUpdate(id, {
                name: req.body.name,
                description: req.body.description,

            }, { new: true })
        }
        // console.log(req.body.name);
        res.redirect('/admin/category')
    } catch (error) {
        console.log('error happence in catogaryController editCatogary function', error);
    }
})

//delete category

const deleteCategory=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id
        const category=await Category.findByIdAndDelete(id)
        res.redirect('/admin/category')
    } catch (error) {
        console.log('Delete Category error',error);
        
    }
})

//Unlist a category

const unlistCategory=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id
        const unlistedCategory=await  Category.findByIdAndUpdate(id,{status:true},{new:true})
        res.redirect('/admin/category')
    } catch (error) {
        console.log('Unlist category error');
        
    }
})

//list category

const listCategory=asyncHandler(async(req,res)=>{
    try {
        const id=req.query.id
        const listedCategory=await Category.findByIdAndUpdate(id,{status:true},{new:true})
        res.redirect('/admin/category')
    } catch (error) {
        console.log('List category error',error);
        
    }
})
module.exports={
    addCategory,
    allCategory,
    editCategory,
    updateCategory,
    deleteCategory,
    unlistCategory,
    listCategory
}