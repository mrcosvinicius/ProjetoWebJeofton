const http = require("http");
const url = require("url");

let alunos = [];
let nextId = 1;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  
  if (path === "/alunos" && method === "GET") { // rota para vizualizar todos os alunos
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(alunos));
  } else if (path === "/alunos" && method === "POST") { // rota para criar um novo aluno
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const dados = JSON.parse(body);

        if (!dados.nome || !dados.idade) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Nome e idade são obrigatórios" }));
          return;
        }

        const novoAluno = {
          id: nextId++,
          nome: dados.nome,
          idade: parseInt(dados.idade),
          email: dados.email || "",
          curso: dados.curso || "",
          matricula: dados.matricula || `MAT${Date.now()}`,
        };

        alunos.push(novoAluno);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Aluno cadastrado com sucesso",
            aluno: novoAluno,
          })
        );
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Erro ao processar dados" }));
      }
    });
  } else if (path.startsWith("/alunos/") && method === "GET") { // rota para vizualizar aluno através do seu id
    const id = parseInt(path.split("/")[2]);
    const aluno = alunos.find((a) => a.id === id);

    if (aluno) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(aluno));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Aluno não encontrado" }));
    }
    
  } else if (path.startsWith("/alunos/") && method === "PUT") { // rota para atualizar aluno através do seu id
    const id = parseInt(path.split("/")[2]);
    const alunoIndex = alunos.findIndex((a) => a.id === id);

    if (alunoIndex === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Aluno não encontrado" }));
      return;
    }

    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const dados = JSON.parse(body);

        alunos[alunoIndex] = {
          ...alunos[alunoIndex],
          ...dados,
          id: alunos[alunoIndex].id, 
        };

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Aluno atualizado com sucesso",
            aluno: alunos[alunoIndex],
          })
        );
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Erro ao processar dados" }));
      }
    });
  } else if (path.startsWith("/alunos/") && method === "DELETE") { // rota para deletar aluno através do seu id
    const id = parseInt(path.split("/")[2]);
    const alunoIndex = alunos.findIndex((a) => a.id === id);

    if (alunoIndex === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Aluno não encontrado" }));
      return;
    }

    const alunoRemovido = alunos.splice(alunoIndex, 1)[0];

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Aluno removido com sucesso",
        aluno: alunoRemovido,
      })
    );
  } else { // caso a rota seja escrita de forma errado aparacera um erro
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Rota não encontrada" }));
  }
});

// porta que está rodando
const PORT = 3000;
server.listen(PORT, () => {
    // se o servidor estiver funcionando aparecerá no console uma mensagem com o número da porta que estará rodando
  console.log(`Servidor rodando na porta ${PORT}`);
});
