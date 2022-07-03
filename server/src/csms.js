const AWS = require("aws-sdk");
const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

AWS.config.update({
  region: "ap-northeast-2",
  endpoint: "http://dynamodb.ap-northeast-2.amazonaws.com",
});

const baseURL = "https://computer.cnu.ac.kr/computer/notice";
const category = ["notice", "project", "bachelor"];

const { SES_ACCESSKEY, SES_SECRETKEY } = process.env;

const sesAccessKey = SES_ACCESSKEY;
const sesSecretKey = SES_SECRETKEY;

module.exports.handler = async (event, context) => {
  const newdate = new Date();
  const year = ("0" + newdate.getFullYear()).slice(-2);
  const month = ("0" + (newdate.getMonth() + 1)).slice(-2);
  const day = ("0" + newdate.getDate()).slice(-2);
  const today = year + "." + month + "." + day;
  const posts = { notice: [], project: [], bachelor: [] };

  await Promise.all(
    category.map(async (category) => {
      await axios.get(`${baseURL}/${category}.do`).then((data) => {
        const $ = cheerio.load(data.data);
        $(
          "#jwxe_main_content > div > div > div.bn-list-common01.type01.bn-common > table > tbody > tr"
        ).each((index, item) => {
          const postDate = $(item).find("td:nth-child(5)").text().trim();

          if (today === postDate) {
            const url = `${baseURL}/${category}.do${$(item)
              .find("td.b-td-left > div > a")
              .attr("href")}`;
            const title = $(item).find("td.b-td-left > div > a").text().trim();
            posts[category].push({ url, title });
          }
        });
      });
    })
  );

  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: "Gmail",
      port: 465,
      auth: {
        user: sesAccessKey,
        pass: sesSecretKey,
      },
      from: sesAccessKey,
    })
  );

  const listOfRecipients = await getEmails();

  for (const element of Items) {
    listOfRecipients.push(element.email);
  }

  let response = "";

  const mailOptions = {
    from: sesAccessKey,
    to: [],
    bcc: listOfRecipients,
    subject: `[CNUCSE] ${year}년 ${month}월 ${day}일 공지`,
    html: `
      ${
        posts["bachelor"].length > 0
          ? `<br/><h1>학사공지</h1> ${posts["bachelor"]
              .map((item) => `<h3><a href="${item.url}">${item.title}</a></h3>`)
              .join("")}
              <br/>
              <hr/>`
          : ""
      }
      ${
        posts["notice"].length > 0
          ? `<br/><h1>일반소식</h1> ${posts["notice"]
              .map((item) => `<h3><a href="${item.url}">${item.title}</a></h3>`)
              .join("")}
              <br/>
              <hr/>`
          : ""
      }
      ${
        posts["project"].length > 0
          ? `<br/><h1>사업단소식</h1> ${posts["project"]
              .map((item) => `<h3><a href="${item.url}">${item.title}</a></h3>`)
              .join("")}
              <br/>`
          : ""
      }
      `,
  };

  if (
    posts["bachelor"].length !== 0 ||
    posts["notice"].length !== 0 ||
    posts["project"].length !== 0
  ) {
    response = await new Promise((rsv, rjt) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return rjt(error);
        }
        rsv("Email sent");
      });
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      input: response,
    }),
  };
};
