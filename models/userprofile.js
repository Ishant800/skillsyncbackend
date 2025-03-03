const mongoose = require('mongoose')
const userprofile = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    bio:{
        type:String,
        
    }
    ,profilepicture:{
        type:String
    },
    socialLinks:{
        github:{type:String},
        Linkden:{type:String},
        website:{type:String}
    }
,projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
reviews: [
    {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String }
    }
]
}, { timestamps: true });

module.exports = mongoose.model('Profile', userprofile);