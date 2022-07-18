const urlModel = require("../models/urlModel");
// const validUrl = require("valid-url")
let shortid = require("shortid")
const validateRequest = function (value) {
    if (Object.keys(value).length == 0) {
        return false;
    } else return true;
};
function validURL(myURL) {
    let regex = (/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/)
    return regex.test(myURL)
}
const validateString = function (name) {
    if (typeof name == undefined || typeof name == null) return false;
    if (typeof name == "string" && name.trim().length == 0) return false;

    return true;
};
let createShortUrl = async function (req, res) {
    try {
        let bodyData = req.body
        let { urlCode, longUrl } = bodyData
        if (!validateRequest(bodyData)) {
            return res.status(400).send({ status: false, message: "please provide data in body" })
        }
        let obj = {}
        if (!urlCode) { obj.urlCode = shortid.generate() }
        if (!validateString(urlCode)) { obj.urlCode = shortid.generate() }

        let duplicateUrlCode = await urlModel.findOne({ urlCode: urlCode })
        if (duplicateUrlCode) { return res.status(400).send({ status: false, message: "this urlCode already exists" }) }
        if (urlCode) { obj.urlCode = urlCode }
        
        if (!longUrl) { return res.status(400).send({ status: false, message: "please provide longUrl" }) }
        if (!validURL(longUrl)) { return res.status(400).send({ status: false, message: "please provide a valid url" }) }
        let duplicateLongUrl = await urlModel.findOne({ longUrl: longUrl })
        if (duplicateLongUrl) { return res.status(400).send({ status: false, message: "this url already exists"}) }
        obj.longUrl = longUrl

        obj.shortUrl = `http://localhost:3000/${obj.urlCode}`

        let data = await urlModel.create(obj)
        let responseData = await urlModel.findOne(obj).select({ __v: 0, _id: 0, createdAt: 0, updatedAt: 0})
        res.status(201).send({ status: true, message: "Success", data: responseData })
    }
    catch (err) {
       return res.status(500).send({ status: false, message: err })
    }
}
let getShortUrl = async function (req, res) {
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
module.exports = { createShortUrl, getShortUrl }