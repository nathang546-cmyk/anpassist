// Atualiza data/google.js com a nota, o total e as avaliações mais recentes do Google.
// Roda todo dia pelo GitHub Actions (.github/workflows/avaliacoes-google.yml).
// Precisa do segredo GOOGLE_PLACES_API_KEY (chave da Places API (New) no Google Cloud).
//
// O Google só devolve até 5 avaliações por consulta; as novas são somadas às que já estão
// no arquivo, então o mural cresce com o tempo. A distribuição por estrelas não vem da API
// e continua sendo editada à mão (o site esconde o gráfico se ela não bater com o total).

import { readFile, writeFile } from "node:fs/promises";

const ARQUIVO = new URL("../data/google.js", import.meta.url);
const PREFIXO = "window.ANP_GOOGLE = ";
const MAX_AVALIACOES = 12;

const chave = process.env.GOOGLE_PLACES_API_KEY;
if (!chave) {
  console.log("GOOGLE_PLACES_API_KEY não configurada: nada a atualizar.");
  process.exit(0);
}

const fonte = await readFile(ARQUIVO, "utf8");
const inicio = fonte.indexOf(PREFIXO);
const cabecalho = fonte.slice(0, inicio);
const dados = JSON.parse(fonte.slice(inicio + PREFIXO.length).trim().replace(/;\s*$/, ""));

const resposta = await fetch(`https://places.googleapis.com/v1/places/${dados.placeId}?languageCode=pt-BR`, {
  headers: {
    "X-Goog-Api-Key": chave,
    "X-Goog-FieldMask": "rating,userRatingCount,reviews"
  }
});
if (!resposta.ok) {
  console.error(`Places API respondeu ${resposta.status}: ${await resposta.text()}`);
  process.exit(1);
}
const lugar = await resposta.json();

const antes = JSON.stringify(dados);
if (typeof lugar.rating === "number") dados.nota = lugar.rating;
if (typeof lugar.userRatingCount === "number") dados.total = lugar.userRatingCount;

const conhecidos = new Set(dados.avaliacoes.map((a) => a.nome.trim().toLowerCase()));
for (const r of lugar.reviews ?? []) {
  const nome = r.authorAttribution?.displayName?.trim();
  const texto = (r.originalText?.text ?? r.text?.text ?? "").trim();
  if (!nome || !texto || r.rating < 4 || conhecidos.has(nome.toLowerCase())) continue;
  dados.avaliacoes.unshift({ nome, nota: r.rating, texto, data: r.publishTime?.slice(0, 10) });
  conhecidos.add(nome.toLowerCase());
}
dados.avaliacoes = dados.avaliacoes.slice(0, MAX_AVALIACOES);

if (JSON.stringify(dados) === antes) {
  console.log(`Sem mudanças (nota ${dados.nota}, ${dados.total} avaliações).`);
} else {
  dados.atualizado = new Date().toISOString().slice(0, 10);
  await writeFile(ARQUIVO, `${cabecalho}${PREFIXO}${JSON.stringify(dados, null, 2)};\n`);
  console.log(`Atualizado: nota ${dados.nota}, ${dados.total} avaliações, ${dados.avaliacoes.length} no mural.`);
}
