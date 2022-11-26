const urlModel = require("../models/urlModel");
const validURL = require("valid-url")
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
const isValidURL = (url) => {
    if (/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(url.trim()))
        return true
    else
        return false
}
const validateString = function (name) {
    if (typeof name == undefined || typeof name == null) return false;
    if (typeof name == "string" && name.trim().length == 0) return false;

    return true;
};
let urlFound = false;

    let object = {
      method: "get",
      url: longUrl,
    };
    await axios(object)
      .then((res) => {
        if (res.status == 201 || res.status == 200) urlFound = true;
      })
      .catch((err) => {});

    if (urlFound == false) {
      return res.status(400).send({ status: false, message: "Invalid URL" });
    }


const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
 16084,
  "redis-16084.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("cgKE4gdfAdqEIi2I5VB5crreANgGymGr", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

let createShortUrl = async function (req, res) {
    try {
        let bodyData = req.body
        let { longUrl } = bodyData
        if (!validateRequest(bodyData)) {
            return res.status(400).send({ status: false, message: "please provide data in body" })
        }
       
        if (!longUrl) { return res.status(400).send({ status: false, message: "please provide longUrl" }) }
        if (!isValidURL(longUrl)) { return res.status(400).send({ status: false, message: "please provide a valid url" }) }
        // let longUrlData = await urlModel.findOne({ longUrl: longUrl }).select({_id:0,__v:0})
        
        // if(longUrlData){
        //     return res.status(200).send({status:true,data:longUrlData})
        // }
        let cachedShortUrlData = await GET_ASYNC(`${longUrl}`)
        if(cachedShortUrlData) {
           
          res.status(200).send({status:true,message:"url already exists", data:cachedShortUrlData})
        } 
        else{let urlCode=shortid.generate(longUrl)
           
         let shortUrl=`http://localhost:3000/${urlCode}`
        let data=await urlModel.create({longUrl:longUrl,urlCode:urlCode,shortUrl:shortUrl})
        let responseData=await urlModel.findOne({longUrl:longUrl}).select({_id:0,__v:0})
        await SET_ASYNC(`${longUrl}`, JSON.stringify(responseData))
        return res.status(201).send({status:true, data:responseData})
    }
    
    }
    catch (err) {
       return res.status(500).send({ status: false, message: err })
    }
}
let getUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        let cachedUrlData = await GET_ASYNC(`${urlCode}`)
        if(cachedUrlData) {
           
          res.status(302).redirect(cachedUrlData)
        } 
        else{
        let data = await urlModel.findOne({ urlCode: urlCode }).select({ __v: 0, _id: 0, createdAt: 0, updatedAt: 0, shortUrl: 0, urlCode: 0 })
        if (!data) {return res.status(404).send({ status: false, message: "no url found" }) }
        await SET_ASYNC(`${urlCode}`, data.longUrl)
        res.redirect(302, data.longUrl)
    }

    }
    catch (err) {
       return res.status(500).send({ status: false, message: err })
    }

}
module.exports = { createShortUrl, getUrl }