import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (data, title) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
  
  const tableColumn = Object.keys(data[0] || {});
  const tableRows = data.map(item => Object.values(item));
  
  autoTable(doc, {
  head: [tableColumn],
  body: tableRows,
  startY: 35,
  styles: { fontSize: 10 },
  headStyles: { fillColor: [41, 128, 185] },
});

  
  doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

export const exportToCSV = (data, filename) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => Object.values(item).join(',')).join('\n');
  const csv = `${headers}\n${rows}`;
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};