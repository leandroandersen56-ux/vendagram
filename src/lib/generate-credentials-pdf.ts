import jsPDF from "jspdf";

interface CredentialsPDFData {
  orderId: string;
  createdAt: string;
  amount: number;
  platform: string;
  listingTitle: string;
  credentials: {
    login?: string;
    password?: string;
    email?: string;
    twofa?: string;
    notes?: string;
  };
}

export function generateCredentialsPDF(data: CredentialsPDFData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Header azul
  doc.setFillColor(45, 111, 240);
  doc.rect(0, 0, pageW, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Froiv", 20, 22);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Marketplace de Contas Digitais", 20, 30);
  doc.setFontSize(9);
  doc.text(
    `Pedido #${data.orderId.slice(0, 8).toUpperCase()} · ${new Date(data.createdAt).toLocaleDateString("pt-BR")}`,
    20,
    38
  );

  // Título
  doc.setTextColor(17, 17, 17);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Credenciais de Acesso", 20, 60);

  // Info do produto
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(102, 102, 102);
  doc.text(`Plataforma: ${data.platform}`, 20, 72);
  doc.text(`Anuncio: ${data.listingTitle}`, 20, 79);
  doc.text(`Valor pago: R$ ${data.amount.toFixed(2).replace(".", ",")}`, 20, 86);

  // Divider
  doc.setDrawColor(232, 232, 232);
  doc.line(20, 92, pageW - 20, 92);

  // Credenciais
  let y = 104;
  const fields = [
    { label: "Login / Usuario", value: data.credentials.login || "—" },
    { label: "Senha", value: data.credentials.password || "—" },
    { label: "Email de cadastro", value: data.credentials.email || "Nao informado" },
    { label: "Codigo 2FA / Backup", value: data.credentials.twofa || "Nao configurado" },
    { label: "Observacoes", value: data.credentials.notes || "Nenhuma" },
  ];

  fields.forEach((field) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(136, 136, 136);
    doc.text(field.label.toUpperCase(), 20, y);
    y += 6;

    doc.setFillColor(248, 250, 255);
    doc.setDrawColor(216, 230, 255);
    doc.roundedRect(20, y, pageW - 40, 12, 2, 2, "FD");
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 17, 17);

    const txt = field.value.length > 60 ? field.value.substring(0, 57) + "..." : field.value;
    doc.text(txt, 25, y + 8);
    y += 20;
  });

  // Aviso de segurança
  doc.setFillColor(255, 248, 224);
  doc.setDrawColor(255, 140, 0);
  doc.roundedRect(20, y, pageW - 40, 24, 3, 3, "FD");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 83, 9);
  doc.text("IMPORTANTE", 25, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Troque a senha imediatamente apos o primeiro acesso.", 25, y + 15);
  doc.text("Nao compartilhe este documento com ninguem.", 25, y + 21);
  y += 32;

  // Escrow info
  doc.setFillColor(232, 248, 239);
  doc.setDrawColor(0, 166, 80);
  doc.roundedRect(20, y, pageW - 40, 16, 3, 3, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(5, 150, 105);
  doc.text("Compra protegida pelo Escrow Froiv - froiv.com", 25, y + 10);

  // Footer
  doc.setTextColor(170, 170, 170);
  doc.setFontSize(8);
  doc.text("www.froiv.com - contato@froiv.com", pageW / 2, 285, { align: "center" });
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, pageW / 2, 290, { align: "center" });

  doc.save(`froiv-credenciais-${data.orderId.slice(0, 8)}.pdf`);
}
