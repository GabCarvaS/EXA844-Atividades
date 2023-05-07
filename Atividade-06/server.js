const http = require("http");
const { spawn } = require("child_process");
const qs = require("querystring");
const fs = require("fs");

const PORT = process.env.PORT || 3000;
const PYTHON_PATH = process.env.PYTHON_PATH || "python";
http
  .createServer((req, res) => {
    if (req.method === "POST" && req.url === "/cgi-bin/message.py") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const { author, message } = qs.parse(body);
        const python = spawn(PYTHON_PATH, ["./cgi-bin/message.py"]);

        res.setHeader("Content-Type", "text/plain");

        python.stdout.on("data", (data) => {
          console.log(`stdout: ${data}`);
        });

        python.stderr.on("data", (data) => {
          console.error(`stderr: ${data}`);
        });

        python.on("close", (code) => {
          console.log(`child process exited with code ${code}`);
          res.statusCode = 302; // Redireciona para a mesma página
          res.setHeader("Location", "/"); // Define a URL de destino do redirecionamento
          res.end();
        });

        python.stdin.write(`author=${author}&message=${message}`);
        python.stdin.end();
      });
    } else {
      fs.readFile("messages.json", "utf8", function (err, data) {
        if (err) throw err;

        const messages = JSON.parse(data).messages;

        // ordena as mensagens pelo timestamp em ordem crescente
        //messages = messages.sort((a, b) => a.timestamp - b.timestamp);
        messages.sort(
          (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)
        );

        let messageList = "<ul>";

        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];
          messageList += `<li>Usuario ${message.author} disse: ${message.message}</li>`;
        }

        messageList += "</ul>";

        res.setHeader("Content-Type", "text/html");
        res.statusCode = 200;
        res.end(`
          <html>
            <head>
              <title>Enviar Mensagem</title>
            </head>
            <body>
              <form method="post" action="/cgi-bin/message.py">
                <label for="author">Autor:</label>
                <input type="text" name="author" id="author" placeholder="Digite seu nome aqui" required />
                <br>
                <label for="message">Mensagem:</label>
                <input type="text" name="message" id="message" placeholder="Digite sua mensagem aqui" required />
                <br>
                <button type="submit">Enviar</button>
              </form>
              ${messageList}
            </body>
          </html>
        `);
      });
    }
  })
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
