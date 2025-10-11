import app from "./app";

const PORT = process.env.PORT || 3001; // mesma porta que o frontend está tentando acessar
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
