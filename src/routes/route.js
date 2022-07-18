let {createShortUrl,getShortUrl}=require("../controllers/urlController")
const express = require('express');
let router=express.Router()

router.post("/url/shorten",createShortUrl)
router.get("/:urlCode",getShortUrl)



module.exports=router