const urlModel = require("../models/urlModel");
const isValidURL = require("valid-url")
let shortid = require("shortid")

const validateRequest = function (value) {
    if (Object.keys(value).length == 0) {
        return false;
    } else return true;
};
// function validURL(myURL) {
//     let regex = (/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/)
//     return regex.test(myURL)
// }
// const isValidUrl = (url) => {
//     if (/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(url.trim()))
//         return true
//     else
//         return false
// }
const validateString = function (name) {
    if (typeof name == undefined || typeof name == null) return false;
    if (typeof name == "string" && name.trim().length == 0) return false;

    return true;
};
let createShortUrl = async function (req, res) {
    try {
        let bodyData = req.body
        let { longUrl } = bodyData
        if (!validateRequest(bodyData)) {
            return res.status(400).send({ status: false, message: "please provide data in body" })
        }
       
        if (!longUrl) { return res.status(400).send({ status: false, message: "please provide longUrl" }) }
        if (!isValidURL.isUri(longUrl)) { return res.status(400).send({ status: false, message: "please provide a valid url" }) }
        let longUrlData = await urlModel.findOne({ longUrl: longUrl }).select({_id:0,__v:0})
        console.log(longUrlData)
        if(longUrlData){
            return res.status(200).send({status:true,data:longUrlData})
        }
        let urlCode=shortid.generate(longUrl)
        let shortUrl=`http://localhost:3000/${urlCode}`
        let data=await urlModel.create({longUrl:longUrl,urlCode:urlCode,shortUrl:shortUrl})
        
        return res.status(201).send({status:true, data:data})
    
    }
    catch (err) {
       return res.status(500).send({ status: false, message: err })
    }
}
let getUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode

        let data = await urlModel.findOne({ urlCode: urlCode }).select({ __v: 0, _id: 0, createdAt: 0, updatedAt: 0, shortUrl: 0, urlCode: 0 })
        if (!data) {return res.status(404).send({ status: false, message: "no url found" }) }

        res.redirect(302, data.longUrl)



    }
    catch (err) {
       return res.status(500).send({ status: false, message: err })
    }

}
module.exports = { createShortUrl, getUrl }