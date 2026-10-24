import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const STORAGE_KEYS = {
  errors: "meuEstudoCreci.errors",
  successes: "meuEstudoCreci.successes",
  summaries: "meuEstudoCreci.summaries",
  completedDays: "meuEstudoCreci.completedDays",
  completedPomodoros: "meuEstudoCreci.completedPomodoros",
};

const studyDays = [
  [
    "Terça",
    "13/10",
    "Fundamentos de Computação",
    "Arquitetura, hardware, software e periféricos.",
  ],
  [
    "Quarta",
    "14/10",
    "Sistemas Operacionais",
    "Windows, Linux e conceitos gerais.",
  ],
  [
    "Quinta",
    "15/10",
    "Sistemas Operacionais",
    "Processos, memória, arquivos, usuários e permissões.",
  ],
  [
    "Sexta",
    "16/10",
    "Português e Inglês",
    "Interpretação de textos e compreensão de textos técnicos.",
  ],
  [
    "Sábado",
    "17/10",
    "Redes de Computadores",
    "LAN, WAN, WLAN, topologias e meios físicos.",
  ],
  [
    "Domingo",
    "18/10",
    "Prova anterior Quadrix",
    "Resolver questões, corrigir e registrar erros importantes.",
  ],
  [
    "Segunda",
    "19/10",
    "Revisão semanal",
    "Refazer questões erradas e revisar os assuntos estudados.",
  ],
];

const weeks = [
  {
    title: "Semana 1",
    range: "13 a 19 de outubro",
    days: [
      [
        "13/10",
        "Fundamentos de Computação",
        "Arquitetura, hardware, software e periféricos.",
      ],
      ["14/10", "Sistemas Operacionais", "Windows, Linux e conceitos gerais."],
      [
        "15/10",
        "Sistemas Operacionais",
        "Processos, memória, arquivos, usuários e permissões.",
      ],
      [
        "16/10",
        "Português e Inglês",
        "Interpretação de textos e textos técnicos.",
      ],
      [
        "17/10",
        "Redes de Computadores",
        "LAN, WAN, WLAN, topologias e meios físicos.",
      ],
      [
        "18/10",
        "Prova anterior Quadrix",
        "Questões, correção e prática discursiva curta.",
      ],
      [
        "19/10",
        "Revisão semanal",
        "Refazer questões erradas e revisar a semana.",
      ],
    ],
  },
  {
    title: "Semana 2",
    range: "20 a 26 de outubro",
    days: [
      ["20/10", "Modelos de rede", "Modelos OSI e TCP/IP."],
      ["21/10", "Protocolos de rede", "IPv4, IPv6, TCP e UDP."],
      ["22/10", "Protocolos de aplicação", "HTTP, HTTPS, DNS, SMTP e FTP."],
      [
        "23/10",
        "Português e Inglês",
        "Ortografia, classes de palavras e vocabulário técnico.",
      ],
      [
        "24/10",
        "Equipamentos de rede",
        "Switches, roteadores, access points, firewalls e VPN.",
      ],
      ["25/10", "Questões e discursiva", "Redes e infraestrutura."],
      ["26/10", "Revisão semanal", "Refazer erros e revisar conceitos."],
    ],
  },
  {
    title: "Semana 3",
    range: "27 de outubro a 2 de novembro",
    days: [
      [
        "27/10",
        "Segurança da Informação",
        "Confidencialidade, integridade, disponibilidade e autenticidade.",
      ],
      [
        "28/10",
        "Ameaças e políticas",
        "Políticas, ataques e vulnerabilidades.",
      ],
      ["29/10", "Criptografia", "Certificados digitais e assinatura digital."],
      [
        "30/10",
        "Raciocínio Lógico",
        "Proposições, conectivos e estruturas lógicas.",
      ],
      [
        "31/10",
        "Proteção e continuidade",
        "Backup, restauração, continuidade e ISO 27001/27002.",
      ],
      ["01/11", "Questões e discursiva", "Segurança da informação."],
      ["02/11", "Revisão semanal", "Redes e segurança."],
    ],
  },
  {
    title: "Semana 4",
    range: "3 a 9 de novembro",
    days: [
      ["03/11", "Banco de Dados", "Conceitos e SGBD."],
      ["04/11", "Modelo relacional", "Tabelas, chaves e relacionamentos."],
      ["05/11", "SQL e normalização", "Consultas, manipulação e normalização."],
      [
        "06/11",
        "Legislação e ética",
        "Princípios da Administração Pública e Lei 8.429/1992.",
      ],
      ["07/11", "Administração de SGBDs", "Noções básicas e questões."],
      ["08/11", "Questões e discursiva", "Banco de dados ou segurança."],
      ["09/11", "Revisão semanal", "Revisar erros."],
    ],
  },
  {
    title: "Semana 5",
    range: "10 a 16 de novembro",
    days: [
      ["10/11", "Engenharia de Software", "Fundamentos e ciclo de vida."],
      ["11/11", "Modelos de desenvolvimento", "Ciclos e modelos."],
      ["12/11", "Métodos ágeis", "Scrum e Kanban."],
      ["13/11", "Português", "Coesão, coerência, conectivos e tempos verbais."],
      ["14/11", "UML e testes", "Casos de uso, classes, atividades e testes."],
      ["15/11", "Questões e discursiva", "Engenharia de Software."],
      ["16/11", "Revisão semanal", "Questões acumuladas."],
    ],
  },
  {
    title: "Semana 6",
    range: "17 a 23 de novembro",
    days: [
      ["17/11", "Governança de TI", "Fundamentos de ITIL e COBIT."],
      ["18/11", "Serviços de TI", "Gerenciamento de serviços e SLA."],
      [
        "19/11",
        "Riscos e indicadores",
        "Gestão de riscos, métricas e indicadores.",
      ],
      [
        "20/11",
        "Legislação",
        "Lei 9.784/1999: processo administrativo, direitos e deveres.",
      ],
      [
        "21/11",
        "Governança de TIC",
        "Planejamento, controle e relatórios técnicos.",
      ],
      ["22/11", "Questões e discursiva", "Governança de TI."],
      ["23/11", "Revisão semanal", "Governança e erros anteriores."],
    ],
  },
  {
    title: "Semana 7",
    range: "24 a 30 de novembro",
    days: [
      ["24/11", "Políticas e normas", "Padrões e normas técnicas de TIC."],
      [
        "25/11",
        "Auditoria de TIC",
        "Controles internos, riscos e conformidade.",
      ],
      [
        "26/11",
        "Segurança institucional",
        "Políticas aplicadas aos processos.",
      ],
      ["27/11", "Português", "Sintaxe, concordância e regência."],
      ["28/11", "Contratos de TIC", "Planejamento e seleção de soluções."],
      [
        "29/11",
        "Termo de Referência",
        "Fiscalização, indicadores e SLA; discursiva.",
      ],
      ["30/11", "Revisão semanal", "Políticas, auditoria e contratos."],
    ],
  },
  {
    title: "Semana 8",
    range: "1 a 7 de dezembro",
    days: [
      [
        "01/12",
        "Infraestrutura de TIC",
        "Servidores, redes, serviços e segurança.",
      ],
      [
        "02/12",
        "Ativos de TIC",
        "Gestão de ativos e preservação de informações.",
      ],
      ["03/12", "Sistemas", "Implantação, migração e fundamentos."],
      [
        "04/12",
        "Raciocínio Lógico",
        "Conjuntos, porcentagem, proporção e regra de três.",
      ],
      ["05/12", "Atendimento técnico", "Suporte estratégico e Ouvidoria."],
      [
        "06/12",
        "Comunicação técnica",
        "Pareceres, notas técnicas, treinamentos e discursiva.",
      ],
      ["07/12", "Revisão semanal", "Questões dos tópicos específicos."],
    ],
  },
  {
    title: "Semana 9",
    range: "8 a 14 de dezembro",
    days: [
      ["08/12", "Legislação específica", "Lei 6.530/1978."],
      [
        "09/12",
        "Legislação específica",
        "Decreto 81.871/1978 e Código Civil: corretagem.",
      ],
      ["10/12", "Resoluções COFECI", "Resoluções indicadas no edital."],
      [
        "11/12",
        "Legislação complementar",
        "LAI 12.527/2011 e LGPD 13.709/2018.",
      ],
      ["12/12", "Português", "Pontuação, crase, reescrita e redação oficial."],
      ["13/12", "Inglês", "Textos técnicos, tabelas, conectivos e instruções."],
      [
        "14/12",
        "Revisão semanal",
        "Questões de legislação, Português e Inglês.",
      ],
    ],
  },
  {
    title: "Semana 10",
    range: "15 a 21 de dezembro",
    days: [
      ["15/12", "Raciocínio Lógico", "Equações, funções e sequências."],
      ["16/12", "Matemática", "Progressões, contagem e probabilidade."],
      [
        "17/12",
        "Estatística e finanças",
        "Média, moda, mediana, gráficos, juros e descontos.",
      ],
      ["18/12", "Legislação e ética", "Revisão das leis principais."],
      ["19/12", "Revisão de TI", "Redes, segurança e banco de dados."],
      ["20/12", "Revisão de TI", "Engenharia, governança e contratos."],
      ["21/12", "Revisão semanal", "Questões mistas e pontos fracos."],
    ],
  },
  {
    title: "Semana 11",
    range: "22 a 28 de dezembro",
    days: [
      [
        "22/12",
        "Simulado específico",
        "Questões de conhecimentos específicos.",
      ],
      ["23/12", "Correção do simulado", "Classificar e revisar os erros."],
      [
        "24/12",
        "Simulado básico",
        "Questões de conhecimentos básicos e complementares.",
      ],
      [
        "25/12",
        "Revisão leve",
        "Português, Inglês e legislação, conforme sua disponibilidade.",
      ],
      ["26/12", "Discursiva", "Resposta de 20 a 30 linhas sobre tema de TI."],
      [
        "27/12",
        "Prova Quadrix",
        "Resolver parte cronometrada da prova anterior.",
      ],
      ["28/12", "Revisão semanal", "Corrigir e revisar pontos fracos."],
    ],
  },
  {
    title: "Semana 12",
    range: "29 de dezembro a 4 de janeiro",
    days: [
      ["29/12", "Simulado geral", "Questões de todas as áreas."],
      ["30/12", "Correção", "Classificar erros por assunto."],
      [
        "31/12",
        "Revisão de TI",
        "Três assuntos específicos com maior dificuldade.",
      ],
      [
        "01/01",
        "Revisão leve",
        "Questões curtas de Português, Inglês e legislação.",
      ],
      ["02/01", "Prova anterior", "Simulado ou continuação da prova Quadrix."],
      ["03/01", "Discursiva", "Resposta de 20 a 30 linhas."],
      ["04/01", "Revisão semanal", "Refazer questões erradas."],
    ],
  },
  {
    title: "Semana 13",
    range: "5 a 11 de janeiro",
    days: [
      ["05/01", "Fundamentos e redes", "Sistemas operacionais e redes."],
      [
        "06/01",
        "Segurança e banco",
        "Segurança da informação e banco de dados.",
      ],
      ["07/01", "Engenharia e governança", "Software, ITIL, COBIT e TIC."],
      [
        "08/01",
        "Contratos e legislação",
        "Infraestrutura e legislação específica.",
      ],
      ["09/01", "Simulado geral", "Condições próximas às da prova."],
      [
        "10/01",
        "Correção e discursiva",
        "Corrigir o simulado e treinar a escrita.",
      ],
      ["11/01", "Revisão final", "Erros recorrentes e comunicados oficiais."],
    ],
  },
  {
    title: "Semana 14",
    range: "12 a 17 de janeiro",
    days: [
      [
        "12/01",
        "Fundamentos e redes",
        "Revisão de fundamentos, redes e segurança.",
      ],
      [
        "13/01",
        "Banco e engenharia",
        "Banco de dados, Engenharia de Software e governança.",
      ],
      [
        "14/01",
        "Contratos e legislação",
        "Contratos, infraestrutura e legislação.",
      ],
      [
        "15/01",
        "Básicos e complementares",
        "Português, Inglês, Raciocínio Lógico e legislação.",
      ],
      [
        "16/01",
        "Revisão leve",
        "Anotações, erros importantes, local e documentos.",
      ],
      [
        "17/01",
        "Dia previsto da prova",
        "Priorize descanso, alimentação e deslocamento.",
      ],
    ],
  },
];

function readStorage(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    alert("Não foi possível salvar os dados neste navegador.");
    return;
  }

  const dataKeys = Object.entries(STORAGE_KEYS);
  const matchedKey = dataKeys.find(([, storageKey]) => storageKey === key);

  if (!auth.currentUser || !matchedKey) return;

  const dataKey = matchedKey[0];

  saveUserData(auth.currentUser.uid, dataKey, value).catch((error) => {
    console.error("Erro ao salvar dados no Firestore:", error);
    alert(
      "Os dados foram salvos no navegador, mas não foi possível sincronizar com a nuvem.",
    );
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function dateFromISO(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
}

function addDaysISO(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function makeId() {
  return globalThis.crypto?.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Adiciona os campos que ainda não existem no HTML.
function addField(
  form,
  { id, label, type = "text", placeholder = "", options = null },
) {
  if (document.getElementById(id)) return;

  const wrapper = document.createElement("div");
  wrapper.className = "form-group notebook-extra-field";

  const labelEl = document.createElement("label");
  labelEl.htmlFor = id;
  labelEl.textContent = label;

  let field;

  if (options) {
    field = document.createElement("select");
    options.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      field.appendChild(opt);
    });
  } else if (type === "textarea") {
    field = document.createElement("textarea");
    field.rows = 3;
  } else {
    field = document.createElement("input");
    field.type = type;
  }

  field.id = id;
  field.name = id;
  field.placeholder = placeholder;

  if (type === "date") field.value = todayISO();

  wrapper.append(labelEl, field);

  const submit = form.querySelector('[type="submit"]');
  if (submit) {
    form.insertBefore(wrapper, submit.closest(".form-actions") || submit);
  } else {
    form.appendChild(wrapper);
  }
}

function enhanceNotebookForms() {
  const blocks = ["Básicos", "Complementares", "Específicos"];

  const errorForm = document.getElementById("errorForm");
  if (errorForm) {
    addField(errorForm, {
      id: "errorDate",
      label: "Data da questão",
      type: "date",
    });
    addField(errorForm, {
      id: "errorBlock",
      label: "Bloco",
      options: blocks,
    });
    addField(errorForm, {
      id: "errorItem",
      label: "Item / enunciado resumido",
      type: "textarea",
      placeholder: "Resuma a questão ou o enunciado",
    });

    addField(errorForm, {
      id: "errorMyAnswer",
      label: "Minha resposta",
      options: ["Certo", "Errado"],
    });

  
    addField(errorForm, {
      id: "errorAnswerKey",
      label: "Gabarito",
      options: ["Certo", "Errado"]
    });

    addField(errorForm, {
      id: "errorRule",
      label: "Regra correta / o que preciso lembrar",
      type: "textarea",
      placeholder: "Explique a regra correta",
    });
  }

  const successForm = document.getElementById("successForm");
  if (successForm) {
    addField(successForm, {
      id: "successDate",
      label: "Data da questão",
      type: "date",
    });
    addField(successForm, {
      id: "successBlock",
      label: "Bloco",
      options: blocks,
    });
    addField(successForm, {
      id: "successItem",
      label: "Item / enunciado resumido",
      type: "textarea",
      placeholder: "Resuma a questão ou o enunciado",
    });
    
    addField(successForm, {
      id: "successMyAnswer",
      label: "Minha resposta",
      options: ["Certo", "Errado"]
    });

    
    addField(successForm, {
      id: "successAnswerKey",
      label: "Gabarito",
      options: ["Certo", "Errado"]
    });

    addField(successForm, {
      id: "successRule",
      label: "Regra correta / o que entendi",
      type: "textarea",
      placeholder: "Registre a regra ou o raciocínio que compreendeu",
    });
  }
}

function ensureSummaryEditor() {
  if (document.getElementById("autoSummaryPanel")) return;

  const summaryForm = document.getElementById("summaryForm");
  if (!summaryForm) return;

  const panel = document.createElement("section");
  panel.id = "autoSummaryPanel";
  panel.className = "saved-entry auto-summary-panel";

  panel.innerHTML = `
    <h3>Resumo automático dos cadernos</h3>
    <p>O resumo reúne as explicações registradas nos cadernos de erros e acertos. Você pode editar o texto e salvar sua versão.</p>
    <textarea id="autoSummaryText" rows="12"
      aria-label="Resumo automático editável"
      placeholder="Seu resumo será montado a partir dos registros..."></textarea>
    <div class="summary-actions">
      <button type="button" id="refreshAutoSummary">Atualizar com os cadernos</button>
      <button type="button" id="saveAutoSummary">Salvar minhas edições</button>
    </div>
    <p id="autoSummaryStatus" class="entry-meta" aria-live="polite"></p>
  `;

  summaryForm.parentNode.insertBefore(panel, summaryForm);

  document
    .getElementById("refreshAutoSummary")
    .addEventListener("click", async () => {
      generateAutoSummary(true);

      const field = document.getElementById("autoSummaryText");
      const status = document.getElementById("autoSummaryStatus");

      if (!field) return;

      const summary = field.value;

      if (!auth.currentUser) {
        if (status) {
          status.textContent =
            "Resumo atualizado no navegador. Entre na sua conta para sincronizar com a nuvem.";
        }
        return;
      }

      try {
        await saveUserData(auth.currentUser.uid, "autoSummary", summary);

        if (status) {
          status.textContent = "Resumo atualizado e sincronizado com a nuvem.";
        }
      } catch (error) {
        console.error("Erro ao sincronizar o resumo:", error);

        if (status) {
          status.textContent =
            "Resumo atualizado no navegador, mas não foi possível sincronizar com a nuvem.";
        }
      }
    });

  document
    .getElementById("saveAutoSummary")
    .addEventListener("click", async () => {
      const summary = document.getElementById("autoSummaryText").value;

      localStorage.setItem("meuEstudoCreci.autoSummary", summary);

      if (auth.currentUser) {
        try {
          await saveUserData(auth.currentUser.uid, "autoSummary", summary);

          document.getElementById("autoSummaryStatus").textContent =
            "Resumo salvo neste navegador e na nuvem.";
        } catch (error) {
          console.error("Erro ao salvar o resumo no Firestore:", error);

          document.getElementById("autoSummaryStatus").textContent =
            "Resumo salvo neste navegador, mas não foi possível sincronizar com a nuvem.";
        }
      } else {
        document.getElementById("autoSummaryStatus").textContent =
          "Resumo salvo neste navegador. Entre na sua conta para sincronizar com a nuvem.";
      }
    });

  const saved = localStorage.getItem("meuEstudoCreci.autoSummary");

  if (saved !== null) {
    document.getElementById("autoSummaryText").value = saved;
  } else {
    generateAutoSummary(false);
  }
}

function generateAutoSummary(overwrite = true) {
  const field = document.getElementById("autoSummaryText");
  if (!field) return;
  if (!overwrite && field.value.trim()) return;

  const records = readStorage(STORAGE_KEYS.errors);

  const grouped = new Map();

  records.forEach((record) => {
    const block = record.block || "Bloco não informado";
    const subject = record.subject || "Matéria não informada";
    const topic = record.topic || record.title || "Assunto não informado";

    const key = `${block}|||${subject}|||${topic}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        block,
        subject,
        topic,
        rules: [],
      });
    }

    const rule = String(record.rule || "").trim();

    if (rule && !grouped.get(key).rules.includes(rule)) {
      grouped.get(key).rules.push(rule);
    }
  });

  if (!records.length) {
    field.value =
      "Ainda não há questões no caderno de erros. Quando você registrar questões erradas e preencher a regra correta, o resumo será organizado por bloco, disciplina e assunto.";
  } else {
    const blocks = [
      "Básicos",
      "Complementares",
      "Específicos",
      "Bloco não informado",
    ];

    const ordered = [...grouped.values()].sort((a, b) => {
      const ai = blocks.indexOf(a.block);
      const bi = blocks.indexOf(b.block);

      return (
        (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) ||
        a.subject.localeCompare(b.subject, "pt-BR") ||
        a.topic.localeCompare(b.topic, "pt-BR")
      );
    });

    let currentBlock = "";
    let currentSubject = "";

    const sections = [];

    ordered.forEach((group) => {
      if (group.block !== currentBlock) {
        sections.push(`\n${group.block.toUpperCase()}\n`);
        currentBlock = group.block;
        currentSubject = "";
      }

      if (group.subject !== currentSubject) {
        sections.push(`\n${group.subject}\n`);
        currentSubject = group.subject;
      }

      sections.push(`\n${group.topic}`);

      if (group.rules.length) {
        group.rules.forEach((rule) => {
          sections.push(`- Regra correta: ${rule}`);
        });
      } else {
        sections.push(
          "- Regra correta ainda não preenchida no caderno de erros.",
        );
      }
    });

    field.value = sections.join("\n").trim();
  }

  if (overwrite) {
    localStorage.setItem("meuEstudoCreci.autoSummary", field.value);

    const status = document.getElementById("autoSummaryStatus");

    if (status) {
      status.textContent =
        "Resumo organizado por disciplina e assunto. Clique em “Salvar minhas edições” para sincronizar com a nuvem.";
    }
  }
}

function renderWeekPreview() {
  const container = document.getElementById("weekList");
  if (!container) return;

  const today = new Date();
  const todayKey = [
    String(today.getDate()).padStart(2, "0"),
    String(today.getMonth() + 1).padStart(2, "0"),
  ].join("/");

  let todayPlan = null;
  let todayWeekIndex = -1;
  let todayDayIndex = -1;

  weeks.some((week, weekIndex) => {
    const dayIndex = week.days.findIndex((day) => day[0] === todayKey);

    if (dayIndex !== -1) {
      todayPlan = week.days[dayIndex];
      todayWeekIndex = weekIndex;
      todayDayIndex = dayIndex;
      return true;
    }

    return false;
  });

  if (!todayPlan) {
    container.innerHTML = `
      <div class="week-row">
        <div class="week-topic">
          <strong>Nenhum plano encontrado para hoje</strong>
          <small>Confira as datas do cronograma.</small>
        </div>
      </div>
    `;
    return;
  }

  const [date, mainSubject, mainTopic] = todayPlan;
  const dayKey = `${todayWeekIndex}-${todayDayIndex}`;
  const completedPomodoros = new Set(
    readStorage(STORAGE_KEYS.completedPomodoros, []),
  );

  const isExamDay =
    date === "17/01" && mainSubject.toLowerCase().includes("prova");

  if (isExamDay) {
    container.innerHTML = `
      <div class="week-row">
        <div class="week-day">
          ${escapeHtml(date)}
          <small>Dia da prova</small>
        </div>
        <div class="week-topic">
          <strong>Boa prova!</strong>
          <small>Priorize descanso, alimentação, documentos e deslocamento.</small>
        </div>
      </div>
    `;
    return;
  }

  const basic = choosePomodoro(
    pomodoroBasics,
    todayWeekIndex * 7 + todayDayIndex,
    [mainSubject],
  );

  const complementary = choosePomodoro(
    pomodoroComplementary,
    todayWeekIndex * 7 + todayDayIndex,
    [mainSubject, basic.subject],
  );

  const pomodoros = [
    {
      id: `${dayKey}-p1`,
      title: mainSubject,
      topic: mainTopic,
    },
    {
      id: `${dayKey}-p2`,
      title: basic.subject,
      topic: basic.topic,
    },
    {
      id: `${dayKey}-p3`,
      title: complementary.subject,
      topic: complementary.topic,
    },
  ];

  container.innerHTML = `
    <div class="week-row">
      <div class="week-day">
        ${escapeHtml(date)}
        <small>Plano de hoje</small>
      </div>
      <div class="week-topic">
        <strong>${escapeHtml(mainSubject)}</strong>
        <small>${escapeHtml(mainTopic)}</small>
      </div>
    </div>

    <div class="pomodoro-list">
      ${pomodoros
        .map(
          (pomodoro, index) => `
        <label class="pomodoro-item pomodoro-check">
          <input
            type="checkbox"
            data-preview-pomodoro="${pomodoro.id}"
            ${completedPomodoros.has(pomodoro.id) ? "checked" : ""}
          >
          <span class="pomodoro-content">
            <strong>P${index + 1} · 30 minutos — ${escapeHtml(pomodoro.title)}</strong>
            <span>${escapeHtml(pomodoro.topic)}</span>
          </span>
        </label>
      `,
        )
        .join("")}
    </div>
  `;

  container.querySelectorAll("[data-preview-pomodoro]").forEach((input) => {
    input.addEventListener("change", () => {
      const updated = new Set(readStorage(STORAGE_KEYS.completedPomodoros, []));

      if (input.checked) {
        updated.add(input.dataset.previewPomodoro);
      } else {
        updated.delete(input.dataset.previewPomodoro);
      }

      writeStorage(STORAGE_KEYS.completedPomodoros, [...updated]);

      const dayPomodoros = [
        ...document.querySelectorAll(
          `#allWeeks [data-pomodoro][data-day-key="${dayKey}"]`,
        ),
      ];

      const previewPomodoros = [
        ...container.querySelectorAll("[data-preview-pomodoro]"),
      ];

      const allChecked =
        previewPomodoros.length > 0 &&
        previewPomodoros.every((item) => item.checked);

      const dayCheckbox = document.querySelector(
        `#allWeeks [data-day="${dayKey}"]`,
      );

      if (dayCheckbox) {
        dayCheckbox.checked = allChecked;

        const completedDays = new Set(
          readStorage(STORAGE_KEYS.completedDays, []),
        );

        if (allChecked) {
          completedDays.add(dayKey);
        } else {
          completedDays.delete(dayKey);
        }

        writeStorage(STORAGE_KEYS.completedDays, [...completedDays]);
      }

      const allDayPomodorosChecked =
        dayPomodoros.length > 0 && dayPomodoros.every((item) => item.checked);

      if (dayCheckbox && dayCheckbox.checked !== allDayPomodorosChecked) {
        dayCheckbox.checked = allDayPomodorosChecked;
      }
    });
  });
}

function reviewDates(entry) {
  const base = entry.dateISO || todayISO();

  return {
    one: addDaysISO(base, 1),
    seven: addDaysISO(base, 7),
    thirty: addDaysISO(base, 30),
  };
}

function renderSavedEntries(key, containerId, kind) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const allEntries = readStorage(key);

  const prefix = kind === "errors" ? "error" : "success";
  const searchInput = document.getElementById(`${prefix}Search`);
  const filterType = document.getElementById(`${prefix}FilterType`);
  const filterDate = document.getElementById(`${prefix}FilterDate`);
  const clearButton = document.getElementById(
    `clear${kind === "errors" ? "Error" : "Success"}Filters`,
  );

  const searchText = (searchInput?.value || "")
    .trim()
    .toLocaleLowerCase("pt-BR");
  const selectedFilter = filterType?.value || "all";
  const selectedDate = filterDate?.value || "";

  const entries = allEntries.filter((entry) => {
    const subject = String(entry.subject || "").toLocaleLowerCase("pt-BR");
    const topic = String(entry.topic || entry.title || "").toLocaleLowerCase(
      "pt-BR",
    );
    const entryDate = entry.dateISO || "";

    let matchesSearch = true;

    if (searchText) {
      if (selectedFilter === "subject") {
        matchesSearch = subject.includes(searchText);
      } else if (selectedFilter === "topic") {
        matchesSearch = topic.includes(searchText);
      } else if (selectedFilter === "date") {
        matchesSearch =
          entryDate.includes(searchText) ||
          String(entry.date || "")
            .toLocaleLowerCase("pt-BR")
            .includes(searchText);
      } else {
        matchesSearch =
          subject.includes(searchText) ||
          topic.includes(searchText) ||
          entryDate.includes(searchText) ||
          String(entry.date || "")
            .toLocaleLowerCase("pt-BR")
            .includes(searchText);
      }
    }

    const matchesDate = !selectedDate || entryDate === selectedDate;

    return matchesSearch && matchesDate;
  });

  if (!entries.length) {
    container.innerHTML = allEntries.length
      ? '<p class="empty-state">Nenhum registro encontrado com esses filtros.</p>'
      : '<p class="empty-state">Seus registros aparecerão aqui.</p>';
  } else {
    container.innerHTML = entries
      .slice()
      .reverse()
      .map((entry) => {
        const dates = reviewDates(entry);

        const reviewBox = (label, dateKey, stateKey) => `
      <label class="review-check">
        <input
          type="checkbox"
          data-review-id="${escapeHtml(entry.id)}"
          data-review-key="${stateKey}"
          ${entry.reviews?.[stateKey] ? "checked" : ""}
        >
        <span>Rev. ${label} (${dateFromISO(dates[dateKey])})</span>
      </label>
    `;

        
return `
  <article class="saved-entry">
    <div class="entry-preview">
      <div class="entry-meta">
        ${escapeHtml(dateFromISO(entry.dateISO) || entry.date || "Data não informada")}
        · ${escapeHtml(entry.block || "Bloco não informado")}
        · ${escapeHtml(entry.subject || "Matéria não informada")}
      </div>

      <h4>${escapeHtml(entry.topic || entry.title || "Registro")}</h4>

      ${entry.item ? `
        <div class="question-statement">
          <strong>Enunciado:</strong>
          <p>${escapeHtml(entry.item)}</p>
        </div>
      ` : `
        <p>Este registro ainda não tem um enunciado cadastrado.</p>
      `}

      <div class="answer-options">
        <p><strong>Qual é a sua resposta?</strong></p>
        <button type="button" class="answer-option" data-answer="Certo">
          Certo
        </button>
        <button type="button" class="answer-option" data-answer="Errado">
          Errado
        </button>
      </div>

      <button type="button" class="check-answer">
        Conferir resposta
      </button>

      <div class="answer-feedback" hidden aria-live="polite"></div>

      <button
        type="button"
        class="toggle-entry"
        aria-expanded="false"
      >Ver mais</button>

      <div class="entry-details" hidden>
        ${
          entry.myAnswer
            ? `<p><strong>Minha resposta original:</strong> ${escapeHtml(entry.myAnswer)}</p>`
            : ""
        }

        ${
          entry.answerKey
            ? `<p><strong>Gabarito original:</strong> ${escapeHtml(entry.answerKey)}</p>`
            : ""
        }

        ${
          entry.reason
            ? `
              <p>
                <strong>${kind === "errors" ? "Por que errei / fiquei em dúvida:" : "Por que acertei:"}</strong>
                ${escapeHtml(entry.reason)}
              </p>
            `
            : ""
        }

        ${
          entry.rule
            ? `
              <p>
                <strong>${kind === "errors" ? "Regra correta:" : "Regra / raciocínio compreendido:"}</strong>
                ${escapeHtml(entry.rule)}
              </p>
            `
            : ""
        }

        ${entry.text ? `<p>${escapeHtml(entry.text)}</p>` : ""}

        </div>
        <div class="review-list">
          ${reviewBox("1 dia", "one", "one")}
          ${reviewBox("7 dias", "seven", "seven")}
          ${reviewBox("30 dias", "thirty", "thirty")}
        </div>
    </div>

    <div class="entry-actions">
      <button type="button" data-edit="${escapeHtml(entry.id)}">Editar</button>
      <button class="delete-entry" type="button" data-delete="${escapeHtml(entry.id)}">Excluir</button>
    </div>
  </article>
`;

      })
      .join("");
  }

  const filterControls = [searchInput, filterType, filterDate].filter(Boolean);

  filterControls.forEach((control) => {
    if (!control.dataset.filterListenerAdded) {
      control.dataset.filterListenerAdded = "true";

      control.addEventListener("input", () => {
        renderSavedEntries(key, containerId, kind);
      });

      control.addEventListener("change", () => {
        renderSavedEntries(key, containerId, kind);
      });
    }
  });

  if (clearButton && !clearButton.dataset.filterListenerAdded) {
    clearButton.dataset.filterListenerAdded = "true";

    clearButton.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (filterType) filterType.value = "all";
      if (filterDate) filterDate.value = "";

      renderSavedEntries(key, containerId, kind);
    });
  }

  container.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!confirm("Deseja excluir este registro?")) return;

      writeStorage(
        key,
        readStorage(key).filter((item) => item.id !== button.dataset.delete),
      );

      renderSavedEntries(key, containerId, kind);
      generateAutoSummary(true);
    });
  });

  container.querySelectorAll(".toggle-entry").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".saved-entry");
      if (!card) return;

      const details = card.querySelector(".entry-details");
      if (!details) return;

      const expanded = button.getAttribute("aria-expanded") === "true";

      details.hidden = expanded;
      button.setAttribute("aria-expanded", String(!expanded));
      button.textContent = expanded ? "Ver mais" : "Ver menos";
    });
  });

  
container.querySelectorAll(".saved-entry").forEach(card => {
  const answerButtons = card.querySelectorAll(".answer-option");
  const checkButton = card.querySelector(".check-answer");
  const feedback = card.querySelector(".answer-feedback");

  if (!answerButtons.length || !checkButton || !feedback) return;

  let selectedAnswer = "";

  answerButtons.forEach(button => {
    button.addEventListener("click", () => {
      selectedAnswer = button.dataset.answer || "";

      answerButtons.forEach(option => {
        option.classList.toggle(
          "selected",
          option.dataset.answer === selectedAnswer
        );
      });

      feedback.hidden = true;
      feedback.textContent = "";
    });
  });

  checkButton.addEventListener("click", () => {
    if (!selectedAnswer) {
      feedback.textContent = "Escolha Certo ou Errado antes de conferir.";
      feedback.hidden = false;
      return;
    }

    const entries = readStorage(key);
    const entryId = card.querySelector("[data-edit]")?.dataset.edit;
    const entry = entries.find(item => item.id === entryId);

    if (!entry || !entry.answerKey) {
      feedback.textContent =
        "Este registro ainda não tem gabarito cadastrado. Edite a questão e informe o gabarito.";
      feedback.hidden = false;
      return;
    }

    const normalize = value => value.trim().toLocaleLowerCase("pt-BR");
    const isCorrect =
      normalize(selectedAnswer) === normalize(entry.answerKey);

    
const details = card.querySelector(".entry-details");
const toggleButton = card.querySelector(".toggle-entry");

if (isCorrect) {
  feedback.textContent = "Resposta correta! Muito bem!";

  if (details) {
    details.hidden = true;
  }

  if (toggleButton) {
    toggleButton.hidden = true;
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.textContent = "Ver mais";
  }
} else {
  feedback.textContent = `Resposta incorreta. O gabarito é: ${entry.answerKey}.`;

  if (details) {
    details.hidden = false;
  }

  if (toggleButton) {
    toggleButton.hidden = false;
    toggleButton.setAttribute("aria-expanded", "true");
    toggleButton.textContent = "Ocultar detalhes";
  }
}

feedback.hidden = false;

  });
});


  container.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      editEntry(key, containerId, kind, button.dataset.edit);
    });
  });

  container.querySelectorAll("[data-review-id]").forEach((input) => {
    input.addEventListener("change", () => {
      const all = readStorage(key);
      const entry = all.find((item) => item.id === input.dataset.reviewId);
      if (!entry) return;

      entry.reviews = {
        ...(entry.reviews || {}),
        [input.dataset.reviewKey]: input.checked,
      };

      writeStorage(key, all);
    });
  });
}

function editEntry(key, containerId, kind, id) {
  const entries = readStorage(key);
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  const fields = [
    ["subject", "Matéria"],
    ["block", "Bloco (Básicos, Complementares ou Específicos)"],
    ["topic", "Assunto"],
    ["item", "Questão resumida"],
    ["myAnswer", "Minha resposta"],
    ["answerKey", "Gabarito"],
    [
      "reason",
      kind === "errors"
        ? "Por que errei ou fiquei em dúvida?"
        : "Por que minha resposta estava correta?",
    ],
    ["rule", "Regra correta / o que aprendi"],
  ];

  const oldForm = container.querySelector("#editEntryForm");
  if (oldForm) oldForm.remove();

  const form = document.createElement("form");
  form.id = "editEntryForm";
  form.className = "saved-entry";

  form.innerHTML = `
    <h3>Editar registro</h3>
    ${fields
      .map(
        ([field, label]) => `
      <label>
        ${label}
        <textarea name="${field}" rows="2"></textarea>
      </label>
    `,
      )
      .join("")}
    <button type="submit">Salvar alterações</button>
    <button type="button" id="cancelEditEntry">Cancelar</button>
  `;

  fields.forEach(([field]) => {
    form.elements[field].value = entry[field] || "";
  });

  container.prepend(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    fields.forEach(([field]) => {
      entry[field] = form.elements[field].value.trim();
    });

    writeStorage(key, entries);
    renderSavedEntries(key, containerId, kind);
    generateAutoSummary(true);
  });

  document.getElementById("cancelEditEntry").addEventListener("click", () => {
    form.remove();
  });

  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setupEntryForm(formId, key, containerId, kind, getEntry) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = getEntry();
    const dateISO = data.dateISO || todayISO();

    const entry = {
      id: makeId(),
      dateISO,
      date: dateFromISO(dateISO),
      reviews: { one: false, seven: false, thirty: false },
      ...data,
    };

    const entries = readStorage(key);
    entries.push(entry);
    writeStorage(key, entries);

    form.reset();

    ["errorDate", "successDate"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = todayISO();
    });

    renderSavedEntries(key, containerId, kind);
    generateAutoSummary(true);
  });

  renderSavedEntries(key, containerId, kind);
}

const pomodoroBasics = [
  {
    subject: "Língua Portuguesa",
    topic: "Interpretação de textos, tema central e informações implícitas.",
  },
  {
    subject: "Língua Portuguesa",
    topic: "Classes de palavras, concordância e regência.",
  },
  {
    subject: "Língua Portuguesa",
    topic: "Pontuação, crase, coesão e reescrita de frases.",
  },
  {
    subject: "Inglês",
    topic:
      "Interpretação de textos técnicos e identificação da ideia principal.",
  },
  {
    subject: "Inglês",
    topic: "Vocabulário técnico, conectivos e compreensão de instruções.",
  },
  {
    subject: "Matemática e Raciocínio Lógico",
    topic: "Proposições, conectivos, equivalências e tabelas-verdade.",
  },
  {
    subject: "Matemática e Raciocínio Lógico",
    topic: "Porcentagem, razão, proporção e regra de três.",
  },
  {
    subject: "Matemática e Raciocínio Lógico",
    topic: "Conjuntos, sequências, gráficos e problemas matemáticos.",
  },
  {
    subject: "Matemática e Raciocínio Lógico",
    topic: "Estatística básica, probabilidade e matemática financeira.",
  },
];

const pomodoroComplementary = [
  {
    subject: "Legislação e Ética",
    topic: "Princípios da Administração Pública e ética no serviço público.",
  },
  {
    subject: "Legislação e Ética",
    topic: "Lei 9.784/1999: processo administrativo.",
  },
  {
    subject: "Legislação e Ética",
    topic: "Lei 8.429/1992: improbidade administrativa, conforme o edital.",
  },
  {
    subject: "Legislação do Sistema COFECI-CRECI",
    topic:
      "Lei 6.530/1978: regulamentação da profissão de corretor de imóveis.",
  },
  {
    subject: "Legislação do Sistema COFECI-CRECI",
    topic: "Decreto 81.871/1978 e resoluções indicadas no edital.",
  },
  {
    subject: "Legislação e Proteção de Dados",
    topic: "LAI — Lei 12.527/2011 e LGPD — Lei 13.709/2018.",
  },
  {
    subject: "Redação Discursiva",
    topic:
      "Planejar uma resposta técnica: introdução, desenvolvimento e conclusão.",
  },
  {
    subject: "Redação Discursiva",
    topic: "Escrever uma resposta de 20 a 30 linhas e revisar a clareza.",
  },
];

function sameStudyArea(a, b) {
  const normalize = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const subjectA = normalize(a);
  const subjectB = normalize(b);

  const groups = [
    ["portugues", "lingua portuguesa"],
    ["ingles"],
    ["matematica", "raciocinio logico"],
    ["legislacao", "etica", "cofeci", "creci", "protecao de dados"],
    ["redacao", "discursiva"],
  ];

  return groups.some(
    (group) =>
      group.some((word) => subjectA.includes(word)) &&
      group.some((word) => subjectB.includes(word)),
  );
}

function choosePomodoro(pool, startIndex, excludedSubjects = []) {
  for (let i = 0; i < pool.length; i++) {
    const item = pool[(startIndex + i) % pool.length];

    const alreadyUsed = excludedSubjects.some((subject) =>
      sameStudyArea(item.subject, subject),
    );

    if (!alreadyUsed) return item;
  }

  return pool[startIndex % pool.length];
}

function renderAllWeeks() {
  const container = document.getElementById("allWeeks");
  if (!container) return;

  const completed = new Set(readStorage(STORAGE_KEYS.completedDays, []));

  const completedPomodoros = new Set(
    readStorage(STORAGE_KEYS.completedPomodoros, []),
  );

  let dayCount = 0;

  container.innerHTML = weeks
    .map((week, weekIndex) => {
      const dayRows = week.days
        .map((day, dayIndex) => {
          dayCount++;

          const date = day[0];
          const mainSubject = day[1];
          const mainTopic = day[2];
          const key = `${weekIndex}-${dayIndex}`;

          const isExamDay =
            date === "17/01" && mainSubject.toLowerCase().includes("prova");

          const basic = choosePomodoro(
            pomodoroBasics,
            weekIndex * 7 + dayIndex,
            [mainSubject],
          );

          const complementary = choosePomodoro(
            pomodoroComplementary,
            weekIndex * 7 + dayIndex,
            [mainSubject, basic.subject],
          );

          const pomodoroData = [
            {
              id: `${key}-p1`,
              title: `P1 · 30 minutos — ${mainSubject}`,
              topic: mainTopic,
            },
            {
              id: `${key}-p2`,
              title: `P2 · 30 minutos — ${basic.subject}`,
              topic: basic.topic,
            },
            {
              id: `${key}-p3`,
              title: `P3 · 30 minutos — ${complementary.subject}`,
              topic: complementary.topic,
            },
          ];

          const pomodoros = isExamDay
            ? `
          <div class="pomodoro-item exam-day">
            <strong>Dia da prova</strong>
            <span>Priorize descanso, alimentação, documentos e deslocamento.</span>
          </div>
        `
            : pomodoroData
                .map(
                  (pomodoro) => `
          <label class="pomodoro-item pomodoro-check">
            <input
              type="checkbox"
              data-pomodoro="${pomodoro.id}"
              data-day-key="${key}"
              ${completedPomodoros.has(pomodoro.id) ? "checked" : ""}
            >
            <span class="pomodoro-content">
              <strong>${escapeHtml(pomodoro.title)}</strong>
              <span>${escapeHtml(pomodoro.topic)}</span>
            </span>
          </label>
        `,
                )
                .join("");

          return `
        <article class="day-plan">
          <label class="day-check">
            <input
              type="checkbox"
              data-day="${key}"
              ${completed.has(key) ? "checked" : ""}
            >
            <span>
              <strong>${escapeHtml(date)}</strong>
              <small>${escapeHtml(mainSubject)}</small>
            </span>
          </label>

          <div class="pomodoro-list">
            ${pomodoros}
          </div>
        </article>
      `;
        })
        .join("");

      return `
      <article class="week-block">
        <h3>${escapeHtml(week.title)}</h3>
        <p>${escapeHtml(week.range)}</p>
        <p>Três pomodoros por dia · 30 minutos cada · 1h30 no total</p>
        ${dayRows}
      </article>
    `;
    })
    .join("");

  function saveCompletedDays(updated) {
    writeStorage(STORAGE_KEYS.completedDays, [...updated]);
  }

  function saveCompletedPomodoros(updated) {
    writeStorage(STORAGE_KEYS.completedPomodoros, [...updated]);
  }

  container.querySelectorAll("[data-pomodoro]").forEach((input) => {
    input.addEventListener("change", () => {
      const updatedPomodoros = new Set(
        readStorage(STORAGE_KEYS.completedPomodoros, []),
      );

      if (input.checked) {
        updatedPomodoros.add(input.dataset.pomodoro);
      } else {
        updatedPomodoros.delete(input.dataset.pomodoro);
      }

      saveCompletedPomodoros(updatedPomodoros);

      const dayKey = input.dataset.dayKey;
      const dayInputs = [
        ...container.querySelectorAll(
          `[data-pomodoro][data-day-key="${dayKey}"]`,
        ),
      ];

      const allChecked =
        dayInputs.length > 0 && dayInputs.every((item) => item.checked);

      const dayCheckbox = container.querySelector(`[data-day="${dayKey}"]`);

      if (dayCheckbox) {
        dayCheckbox.checked = allChecked;

        const updatedDays = new Set(
          readStorage(STORAGE_KEYS.completedDays, []),
        );

        if (allChecked) {
          updatedDays.add(dayKey);
        } else {
          updatedDays.delete(dayKey);
        }

        saveCompletedDays(updatedDays);
      }

      updateProgress(dayCount);
    });
  });

  container.querySelectorAll("[data-day]").forEach((input) => {
    input.addEventListener("change", () => {
      const dayKey = input.dataset.day;
      const updatedDays = new Set(readStorage(STORAGE_KEYS.completedDays, []));

      const updatedPomodoros = new Set(
        readStorage(STORAGE_KEYS.completedPomodoros, []),
      );

      const dayPomodoros = [
        ...container.querySelectorAll(
          `[data-pomodoro][data-day-key="${dayKey}"]`,
        ),
      ];

      if (input.checked) {
        updatedDays.add(dayKey);
        dayPomodoros.forEach((pomodoro) => {
          pomodoro.checked = true;
          updatedPomodoros.add(pomodoro.dataset.pomodoro);
        });
      } else {
        updatedDays.delete(dayKey);
        dayPomodoros.forEach((pomodoro) => {
          pomodoro.checked = false;
          updatedPomodoros.delete(pomodoro.dataset.pomodoro);
        });
      }

      saveCompletedDays(updatedDays);
      saveCompletedPomodoros(updatedPomodoros);
      updateProgress(dayCount);
    });
  });

  updateProgress(dayCount);
}

function updateProgress(totalDays) {
  const total =
    totalDays || weeks.reduce((sum, week) => sum + week.days.length, 0);

  const completed = readStorage(STORAGE_KEYS.completedDays, []).length;
  const percent = total
    ? Math.min(100, Math.round((completed / total) * 100))
    : 0;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("completedText", `${completed} de ${total} dias concluídos`);
  setText("progressPercent", `${percent}%`);
  setText("mockProgressLabel", `${percent}%`);

  const plan = document.getElementById("planProgress");
  const mock = document.getElementById("mockProgress");

  if (plan) plan.style.width = `${percent}%`;
  if (mock) mock.style.width = `${percent}%`;
}

function setupNavigation() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute(
        "aria-label",
        open ? "Fechar menu" : "Abrir menu",
      );
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }
}

setupNavigation();
enhanceNotebookForms();

setupEntryForm(
  "errorForm",
  STORAGE_KEYS.errors,
  "errorEntries",
  "errors",
  () => ({
    dateISO: document.getElementById("errorDate")?.value || todayISO(),
    block: document.getElementById("errorBlock")?.value || "Básicos",
    subject: document.getElementById("errorSubject")?.value.trim() || "",
    topic: document.getElementById("errorTopic")?.value.trim() || "",
    item: document.getElementById("errorItem")?.value.trim() || "",
    myAnswer: document.getElementById("errorMyAnswer")?.value.trim() || "",
    answerKey: document.getElementById("errorAnswerKey")?.value.trim() || "",
    reason: document.getElementById("errorReason")?.value.trim() || "",
    rule: document.getElementById("errorRule")?.value.trim() || "",
  }),
);

setupEntryForm(
  "successForm",
  STORAGE_KEYS.successes,
  "successEntries",
  "successes",
  () => ({
    dateISO: document.getElementById("successDate")?.value || todayISO(),
    block: document.getElementById("successBlock")?.value || "Básicos",
    subject: document.getElementById("successSubject")?.value.trim() || "",
    topic: document.getElementById("successTopic")?.value.trim() || "",
    item: document.getElementById("successItem")?.value.trim() || "",
    myAnswer: document.getElementById("successMyAnswer")?.value.trim() || "",
    answerKey: document.getElementById("successAnswerKey")?.value.trim() || "",
    reason: document.getElementById("successReason")?.value.trim() || "",
    rule: document.getElementById("successRule")?.value.trim() || "",
  }),
);

setupEntryForm(
  "summaryForm",
  STORAGE_KEYS.summaries,
  "summaryEntries",
  "summaries",
  () => ({
    subject: document.getElementById("summarySubject")?.value.trim() || "",
    title: document.getElementById("summaryTitle")?.value.trim() || "",
    text: document.getElementById("summaryText")?.value.trim() || "",
  }),
);

renderWeekPreview();
renderAllWeeks();
ensureSummaryEditor();

const authForm = document.getElementById("authForm");
const createAccountButton = document.getElementById("createAccountButton");
const signOutButton = document.getElementById("signOutButton");
const authStatus = document.getElementById("authStatus");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");

function showAuthMessage(message) {
  if (authStatus) {
    authStatus.textContent = message;
  }
}

function getAuthErrorMessage(error) {
  const messages = {
    "auth/invalid-email": "Digite um e-mail válido.",
    "auth/missing-password": "Digite sua senha.",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
    "auth/email-already-in-use": "Este e-mail já possui uma conta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde e tente novamente.",
    "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
  };

  return (
    messages[error.code] ||
    "Não foi possível concluir a operação. Tente novamente."
  );
}

if (authForm) {
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      showAuthMessage("Entrando na sua conta...");

      await signInWithEmailAndPassword(
        auth,
        authEmail.value.trim(),
        authPassword.value,
      );

      authPassword.value = "";
      showAuthMessage("Login realizado com sucesso!");
    } catch (error) {
      showAuthMessage(getAuthErrorMessage(error));
    }
  });
}

if (createAccountButton) {
  createAccountButton.addEventListener("click", async () => {
    if (!authForm.reportValidity()) return;

    try {
      showAuthMessage("Criando sua conta...");

      await createUserWithEmailAndPassword(
        auth,
        authEmail.value.trim(),
        authPassword.value,
      );

      authPassword.value = "";
      showAuthMessage("Conta criada com sucesso!");
    } catch (error) {
      showAuthMessage(getAuthErrorMessage(error));
    }
  });
}

if (signOutButton) {
  signOutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      showAuthMessage("Você saiu da sua conta.");
    } catch (error) {
      showAuthMessage(getAuthErrorMessage(error));
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  const progressLoginNotice = document.getElementById("progressLoginNotice");

  if (progressLoginNotice) {
    progressLoginNotice.hidden = Boolean(user);
    const accountSection = document.getElementById("conta");
    if (accountSection) {
      accountSection.classList.toggle("is-authenticated", Boolean(user));
    }
  }
  if (user) {
    showAuthMessage(`Conta conectada: ${user.email}`);

    if (signOutButton) signOutButton.hidden = false;
    if (createAccountButton) createAccountButton.hidden = true;

    if (authForm) {
      authForm.querySelector('[type="submit"]').textContent = "Entrar";
    }

    try {
      for (const [dataKey, storageKey] of Object.entries(STORAGE_KEYS)) {
        const value = await loadUserData(user.uid, dataKey);

        if (value !== null) {
          localStorage.setItem(storageKey, JSON.stringify(value));
        } else {
          localStorage.removeItem(storageKey);
        }
      }

      const savedAutoSummary = await loadUserData(user.uid, "autoSummary");

      if (savedAutoSummary !== null) {
        localStorage.setItem("meuEstudoCreci.autoSummary", savedAutoSummary);
      } else {
        localStorage.removeItem("meuEstudoCreci.autoSummary");
      }

      renderSavedEntries(STORAGE_KEYS.errors, "errorEntries", "errors");
      renderSavedEntries(STORAGE_KEYS.successes, "successEntries", "successes");
      renderSavedEntries(STORAGE_KEYS.summaries, "summaryEntries", "summaries");
      renderAllWeeks();
      ensureSummaryEditor();

      showAuthMessage(`Conta conectada: ${user.email}`);
    } catch (error) {
      console.error("Erro ao carregar dados do Firestore:", error);
      showAuthMessage(
        "Conta conectada, mas não foi possível carregar os dados da nuvem.",
      );
    }
  } else {
    showAuthMessage("Você ainda não entrou.");

    if (signOutButton) signOutButton.hidden = true;
    if (createAccountButton) createAccountButton.hidden = false;

    for (const storageKey of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(storageKey);
    }

    localStorage.removeItem("meuEstudoCreci.autoSummary");
  }
});

async function loadUserData(userId, dataKey) {
  const userDoc = doc(db, "users", userId, "studyData", dataKey);
  const snapshot = await getDoc(userDoc);

  return snapshot.exists() ? snapshot.data().value : null;
}

async function saveUserData(userId, dataKey, value) {
  const userDoc = doc(db, "users", userId, "studyData", dataKey);

  await setDoc(userDoc, {
    value,
    updatedAt: new Date().toISOString(),
  });
}
