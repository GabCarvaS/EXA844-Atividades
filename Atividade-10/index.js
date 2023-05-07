const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    //connect.sid
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 600000 }, //10min
  })
);

app.get("/", (req, res) => {
  let inputValue = "";
  let hiddenValue = parseInt(req.session.hiddenValue) || 0;
  hiddenValue++;
  req.session.hiddenValue = hiddenValue.toString();

  // let hiddenValue = req.session.id || "";

  if (!req.cookies["connect.sid"] || !req.session) {
    // Session expired or cookie deleted, redirect to new page
    res.redirect("/expired");
  } else {
    if (req.cookies.inputValue) {
      inputValue = req.cookies.inputValue;
    }

    res.cookie("inputValue", inputValue, {
      expires: new Date(Date.now() + 300000), //5 min
      maxAge: 300000,
    });
    console.log("---------------------------------");
    console.log(`inputValue: ${inputValue}`);
    console.log(`hiddenValue: ${hiddenValue}`);

    res.send(`
    <form method="POST" action="/">
      <input type="text" name="inputValue" value="${inputValue}">
      <input type="hidden" name="hiddenValue" value="${hiddenValue}">
      <button type="submit">Enviar</button>
    </form>
    <pre>
      inputValue: ${inputValue}\n
      hiddenValue: ${hiddenValue}
    </pre>
`);
  }
});

app.get("/expired", (req, res) => {
  res.clearCookie("inputValue");
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.send(`
      <p>Sessão expirada</p>
      <button onclick="location.href='/'">Iniciar nova sessão</button>
    `);
  });
});

app.post("/", (req, res) => {
  let { hiddenValue, inputValue } = req.body;
  req.session.hiddenValue = hiddenValue;
  res.cookie("inputValue", inputValue, { maxAge: 900000 });
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000.");
  console.log("http://localhost:3000/");
});
