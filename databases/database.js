const mongoose = require('mongoose')
const Connectionstring  = "mongodb+srv://ishantkarmacharya:502100@cluster0.ksm2o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const database=async()=>{
    await mongoose.connect(Connectionstring)
    console.log("database connected sucessfully")
}

module.exports = database